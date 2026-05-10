const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  // Manejo de CORS (importante para que Angular no de error al llamar a la API)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, name } = req.body;

  // Validamos que lleguen los datos
  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio' });
  }

  const msg = {
    to: email,
    from: 'facebranddigital@gmail.com', // Asegúrate de que este correo esté verificado en SendGrid
    subject: '¡Bienvenido a Bracasfood! 🚀',
    html: `
      <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
        <h2>Hola ${name || 'Usuario'} 👋</h2>
        <p>Tu cuenta en <strong>Bracasfood</strong> ha sido creada con éxito.</p>
        <p>Haz clic en el botón de abajo para verificar tu cuenta y empezar a comprar:</p>
        <br>
        <a href="https://vercel.app" 
           style="background-color: #ff5722; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          VERIFICAR CUENTA
        </a>
        <br><br>
        <p>Si el botón no funciona, copia y lanza este link: https://vercel.app</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Correo enviado a:', email);
    res.status(200).json({ success: true, message: 'Email enviado' });
  } catch (error) {
    console.error('Error detallado de SendGrid:', error.response?.body || error);
    res.status(500).json({ 
      error: 'No se pudo enviar el correo',
      details: error.message 
    });
  }
}
