import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, phone }: RegisterData = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send welcome email
    const { data, error } = await resend.emails.send({
      from: 'TIEND <onboarding@resend.dev>', // Change to your verified domain
      to: email,
      subject: '¡Bienvenido a TIEND! Tu experiencia innovadora comienza ahora',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">TIEND</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">The Future of Style</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333; margin: 0 0 20px; font-size: 24px;">¡Hola ${firstName}! </h2>
                      <p style="color: #666; line-height: 1.6; margin: 0 0 20px; font-size: 16px;">
                        Gracias por unirte a la comunidad TIEND. Estamos emocionados de tenerte con nosotros en esta experiencia de innovación y estilo.
                      </p>
                      <p style="color: #666; line-height: 1.6; margin: 0 0 20px; font-size: 16px;">
                        Ya eres parte de más de <strong>50,000 usuarios</strong> que están definiendo el mañana con nosotros.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="margin: 30px 0;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                            <a href="https://tiend.app" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                              Explorar Colecciones
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Benefits -->
                      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #333; margin: 0 0 15px; font-size: 18px;">Lo que te espera:</h3>
                        <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li>Acceso anticipado a nuevas colecciones</li>
                          <li>Descuentos exclusivos para miembros</li>
                          <li>Contenido premium sobre tendencias tech</li>
                          <li>Notificaciones de ofertas especiales</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                      <p style="color: #999; font-size: 14px; margin: 0 0 10px;">
                        Síguenos en nuestras redes sociales
                      </p>
                      <p style="color: #999; font-size: 12px; margin: 0;">
                        © 2026 TIEND. Todos los derechos reservados.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Welcome email sent successfully',
      emailId: data?.id 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
