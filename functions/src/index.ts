import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuración del cliente con tu Access Token
const client = new MercadoPagoConfig({
  accessToken: 'TEST-5621799547530270-041415-c51a8c9043f56891672a94a4250e3b94-3333158014',
});

export const createPreference = onRequest({ cors: true }, async (req, res) => {
  try {
    // Manejo de peticiones pre-vuelo CORS
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    const { title, price, quantity } = req.body;

    // --- VALIDACIÓN Y LIMPIEZA DEL PRECIO ---
    // Convertimos a número y redondeamos (MP no acepta decimales en COP)
    const parsedPrice = parseFloat(price);
    
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      logger.error('Precio inválido recibido:', price);
      res.status(400).json({ error: 'El precio debe ser un número válido mayor a 0' });
      return;
    }

    const cleanPrice = Math.round(parsedPrice);

    const preference = new Preference(client);
    
    // Creación de la preferencia en Mercado Pago
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'item-123',
            title: title || 'Producto Tiend-App',
            quantity: Number(quantity) || 1,
            unit_price: cleanPrice,
            currency_id: 'COP',
          },
        ],
        auto_return: 'approved',
        back_urls: {
          success: 'https://tiend-app.vercel.app/success',
          failure: 'https://tiend-app.vercel.app/cart',
        },
      },
    });

    // Éxito: Enviamos el ID a tu Angular
    logger.info('Preferencia creada con éxito:', result.id);
    res.status(200).json({ id: result.id });

  } catch (error: any) {
    // Error: Registro detallado en los logs de Firebase
    logger.error('Error al crear preferencia en Mercado Pago:', error);

    res.status(500).json({
      error: 'Fallo al crear el pago',
      mensajeOriginal: error.message,
      detalles: error.response?.data || 'Sin detalles adicionales'
    });
  }
});