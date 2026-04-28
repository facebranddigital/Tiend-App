import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// 1. RECOMENDACIÓN: Cambia a APP_USR- cuando estés listo para cobrar real.
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN as string,
});
// vercel update //
export const createPreference = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    const { title, price, quantity } = req.body;

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      logger.error('Precio inválido recibido:', price);
      res.status(400).json({ error: 'El precio debe ser un número válido mayor a 0' });
      return;
    }

    const cleanPrice = Math.round(parsedPrice);
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: 'item-123',
            title: title || 'Producto Tiend-App',
            quantity: Number(quantity) || 1,
            unit_price: cleanPrice,
            currency_id: 'COP', // Vital para Nequi
          },
        ],
        // --- CONFIGURACIÓN PARA NEQUI ---
        payment_methods: {
          installments: 1, // Nequi no acepta cuotas
          excluded_payment_types: [
            { id: 'ticket' }, // Opcional: quita Efecty para que Nequi resalte
          ],
        },
        // --- SEGURIDAD ---
        // Evita que el usuario cambie el precio en el checkout
        binary_mode: true,
        auto_return: 'approved',
        back_urls: {
          success: 'https://tiend-app.vercel.app/success',
          failure: 'https://tiend-app.vercel.app/cart',
          pending: 'https://tiend-app.vercel.app/success', // Nequi a veces queda pendiente unos segundos
        },
      },
    });

    logger.info('Preferencia creada con éxito:', result.id);
    res.status(200).json({ id: result.id });
  } catch (error: any) {
    logger.error('Error al crear preferencia en Mercado Pago:', error);
    res.status(500).json({
      error: 'Fallo al crear el pago',
      detalles: error.response?.data || error.message,
    });
  }
});
