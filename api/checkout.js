const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { monto, email } = req.body;
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: 'Compra en Tiend-App',
            quantity: 1,
            unit_price: Number(monto),
            currency_id: 'COP'
          }
        ],
        payer: { email: email },
        back_urls: {
          success: 'https://tiend-app-wogt.vercel.app/',
          failure: 'https://tiend-app-wogt.vercel.app/',
          pending: 'https://tiend-app-wogt.vercel.app/'
        },
        auto_return: 'approved',
      }
    });

    res.status(200).json({
      status: 'success',
      init_point: result.init_point
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
