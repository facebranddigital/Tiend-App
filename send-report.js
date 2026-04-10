const { Resend } = require('resend');

// Intenta leer de la terminal o de un archivo .env si lo tuvieras
const apiKey = process.env.RESEND_API_KEY;
const resend = new Resend(apiKey);

async function sendReport() {
  if (!apiKey) {
    console.error('❌ Error: No se encontró la RESEND_API_KEY. Asegúrate de exportarla.');
    process.exit(1);
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'QA Robot <onboarding@resend.dev>',
      to: ['facebranddigital@gmail.com'], // <--- CAMBIA ESTO POR TU CORREO
      subject: '🚀 Tiend-App: Cypress Test Passed',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #4CAF50; border-radius: 8px;">
          <h2 style="color: #4CAF50;">✅ ¡Prueba de Login Exitosa!</h2>
          <p>El robot de automatización ha verificado <strong>Tiend-App</strong> correctamente.</p>
          <p><strong>Entorno:</strong> Ubuntu Linux (brXeon)</p>
          <p><strong>Status:</strong> 200 OK</p>
          <hr>
          <p style="font-size: 12px; color: #888;">Reporte generado automáticamente por Cypress & Resend.</p>
        </div>
      `
    });

    if (error) return console.error('❌ Error de Resend:', error);
    console.log('🚀 ¡Correo enviado! ID:', data.id);
  } catch (err) {
    console.error('❌ Error fatal:', err);
  }
}

sendReport();
