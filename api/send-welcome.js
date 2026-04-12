const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, name } = req.body;

  const msg = {
    to: email, 
    from: 'facebranddigital@gmail.com', 
    subject: '¡Bienvenido a Tiend-App! 🚀',
    html: `<strong>Hola ${name || 'Usuario'}, tu cuenta ha sido creada con éxito.</strong>`,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error de SendGrid:', error);
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
}
