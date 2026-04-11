import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;

  try {
    await resend.emails.send({
      from: 'Tiend App <onboarding@resend.dev>',
      to: [email],
      subject: '¡Bienvenido a Tiend-App! 🚀',
      html: '<h1>¡Registro exitoso!</h1><p>Tu cuenta ya está activa. ¡Gracias por unirte!</p>'
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
