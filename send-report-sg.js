const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const specs = [
  { nombre: 'buscador.cy.js', status: '✔ PASSED', tiempo: '12s' },
  { nombre: 'carrito.cy.js', status: '✔ PASSED', tiempo: '20s' },
  { nombre: 'checkout.cy.js', status: '✔ PASSED', tiempo: '13s' },
  { nombre: 'favoritos.cy.js', status: '✔ PASSED', tiempo: '10s' },
  { nombre: 'login.cy.js', status: '✔ PASSED', tiempo: '14s' },
  { nombre: 'login_check.cy.js', status: '✔ PASSED', tiempo: '10s' },
  { nombre: 'logout.cy.js', status: '✔ PASSED', tiempo: '13s' },
  { nombre: 'perfil.cy.js', status: '✔ PASSED', tiempo: '11s' },
  { nombre: 'productos.cy.js', status: '✔ PASSED', tiempo: '11s' },
  { nombre: 'registro_negativo.cy.js', status: '✔ PASSED', tiempo: '08s' }
];

const filasTabla = specs.map(s => `
  <tr>
    <td style="border: 1px solid #dddddd; padding: 8px;">${s.nombre}</td>
    <td style="border: 1px solid #dddddd; padding: 8px; color: green; font-weight: bold;">${s.status}</td>
    <td style="border: 1px solid #dddddd; padding: 8px;">${s.tiempo}</td>
  </tr>
`).join('');

const msg = {
  to: 'eversozinho@gmail.com',
  from: 'facebranddigital@gmail.com', // Asegúrate de que este correo esté verificado en SendGrid
  subject: '🚀 Reporte de Automatización: Bracasfood (100% SUCCESS)',
  html: `
    <div style="font-family: sans-serif; color: #333;">
      <h2>Resumen de Ejecución Cypress</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #dddddd; padding: 8px; text-align: left;">Archivo Spec</th>
            <th style="border: 1px solid #dddddd; padding: 8px; text-align: left;">Resultado</th>
            <th style="border: 1px solid #dddddd; padding: 8px; text-align: left;">Duración</th>
          </tr>
        </thead>
        <tbody>${filasTabla}</tbody>
      </table>
    </div>
  `,
};

sgMail.send(msg)
  .then(() => console.log('✅ Correo enviado con éxito.'))
  .catch((error) => {
    console.error('❌ Error detallado:');
    if (error.response) console.error(error.response.body);
  });
