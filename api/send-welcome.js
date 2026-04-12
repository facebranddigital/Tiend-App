const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  const { email } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: '¡Bienvenido a Tiend-App! 🚀',
      html: '<strong>Tu cuenta ha sido creada con éxito.</strong>',
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
}
