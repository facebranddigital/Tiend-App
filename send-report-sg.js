const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

// 1. Configuración de la API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 2. Función para leer los resultados de Cypress
function getCypressResults() {
  const resultsPath = path.join(__dirname, 'cypress', 'results', 'output.json');
  const mochawesomePath = path.join(__dirname, 'cypress', 'results', 'mochawesome.json');
  
  let results = {
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    totalPending: 0,
    totalSkipped: 0,
    duration: 0,
    tests: [],
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString()
  };

  // Intentar leer resultados de mochawesome
  if (fs.existsSync(mochawesomePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(mochawesomePath, 'utf8'));
      results.totalTests = data.stats?.tests || 0;
      results.totalPassed = data.stats?.passes || 0;
      results.totalFailed = data.stats?.failures || 0;
      results.totalPending = data.stats?.pending || 0;
      results.totalSkipped = data.stats?.skipped || 0;
      results.duration = data.stats?.duration || 0;
      results.startedAt = data.stats?.start || results.startedAt;
      results.endedAt = data.stats?.end || results.endedAt;
      
      // Extraer detalles de tests
      if (data.results) {
        data.results.forEach(suite => {
          if (suite.suites) {
            suite.suites.forEach(s => {
              if (s.tests) {
                s.tests.forEach(test => {
                  results.tests.push({
                    title: test.title,
                    fullTitle: test.fullTitle,
                    state: test.state,
                    duration: test.duration,
                    err: test.err?.message || null
                  });
                });
              }
            });
          }
        });
      }
    } catch (e) {
      console.log('⚠️ No se pudo leer mochawesome.json:', e.message);
    }
  }

  // Intentar leer output.json como alternativa
  if (fs.existsSync(resultsPath) && results.totalTests === 0) {
    try {
      const data = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      results.totalTests = data.totalTests || data.stats?.tests || 0;
      results.totalPassed = data.totalPassed || data.stats?.passes || 0;
      results.totalFailed = data.totalFailed || data.stats?.failures || 0;
      results.duration = data.totalDuration || data.stats?.duration || 0;
    } catch (e) {
      console.log('⚠️ No se pudo leer output.json:', e.message);
    }
  }

  return results;
}

// 3. Función para generar el HTML del reporte
function generateReportHtml(results) {
  const statusColor = results.totalFailed > 0 ? '#dc2626' : '#059669';
  const statusText = results.totalFailed > 0 ? 'FAILED' : 'SUCCESS';
  const statusEmoji = results.totalFailed > 0 ? '❌' : '✅';
  
  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}min`;
  };

  let testsHtml = '';
  if (results.tests.length > 0) {
    testsHtml = `
      <div style="margin-top: 20px;">
        <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Detalle de Tests:</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Test</th>
              <th style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Estado</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">Duración</th>
            </tr>
          </thead>
          <tbody>
            ${results.tests.map(test => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${test.title}</td>
                <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: ${test.state === 'passed' ? '#059669' : test.state === 'failed' ? '#dc2626' : '#f59e0b'}; font-weight: bold;">
                    ${test.state === 'passed' ? '✅ Passed' : test.state === 'failed' ? '❌ Failed' : '⏸️ ' + test.state}
                  </span>
                </td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatDuration(test.duration || 0)}</td>
              </tr>
              ${test.err ? `
              <tr>
                <td colspan="3" style="padding: 10px; background-color: #fef2f2; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #dc2626;">Error:</strong> <code style="font-size: 12px;">${test.err}</code>
                </td>
              </tr>
              ` : ''}
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #d1d5db; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #0070f3; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">Cypress Full Test Report</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Tiend-App QA Automation</p>
      </div>
      
      <div style="padding: 25px; background-color: #ffffff;">
        <div style="background-color: ${results.totalFailed > 0 ? '#fef2f2' : '#f0fdf4'}; border: 1px solid ${results.totalFailed > 0 ? '#fecaca' : '#bbf7d0'}; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
          <span style="font-size: 32px;">${statusEmoji}</span>
          <h2 style="margin: 10px 0 5px 0; color: ${statusColor};">${statusText}</h2>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Ejecución completada</p>
        </div>

        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">Resumen de Resultados:</h3>
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="padding: 5px 0;"><strong>Total Tests:</strong></td>
              <td style="text-align: right;">${results.totalTests}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #059669;"><strong>Passed:</strong></td>
              <td style="text-align: right; color: #059669;">${results.totalPassed}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #dc2626;"><strong>Failed:</strong></td>
              <td style="text-align: right; color: #dc2626;">${results.totalFailed}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #f59e0b;"><strong>Pending/Skipped:</strong></td>
              <td style="text-align: right; color: #f59e0b;">${results.totalPending + results.totalSkipped}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;"><strong>Duración Total:</strong></td>
              <td style="text-align: right;">${formatDuration(results.duration)}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Proyecto:</strong> Tiend-App (Vercel)</p>
          <p style="margin: 5px 0;"><strong>Entorno:</strong> Ubuntu Linux (brXeon)</p>
          <p style="margin: 5px 0;"><strong>Inicio:</strong> ${new Date(results.startedAt).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Fin:</strong> ${new Date(results.endedAt).toLocaleString()}</p>
        </div>

        ${testsHtml}
        
        <p style="font-size: 13px; color: #6b7280; margin-top: 20px;">Este es un reporte automático generado por el robot de QA con Cypress.</p>
      </div>
      
      <div style="background-color: #f9fafb; color: #9ca3af; padding: 15px; text-align: center; font-size: 11px; border-top: 1px solid #e5e7eb;">
        &copy; 2026 Ever | Facebranddigital QA Engineering
      </div>
    </div>
  `;
}

// 4. Ejecución principal
(async () => {
  try {
    console.log('📊 Leyendo resultados de Cypress...');
    const results = getCypressResults();
    
    console.log(`📈 Tests encontrados: ${results.totalTests}`);
    console.log(`✅ Passed: ${results.totalPassed}`);
    console.log(`❌ Failed: ${results.totalFailed}`);

    const statusEmoji = results.totalFailed > 0 ? '❌' : '✅';
    const statusText = results.totalFailed > 0 ? 'FAILED' : 'PASSED';

    const msg = {
      to: 'teveventaspasto@gmail.com',
      from: 'facebranddigital@gmail.com',
      subject: `${statusEmoji} QA Report: Tiend-App - ${results.totalPassed}/${results.totalTests} Tests ${statusText}`,
      html: generateReportHtml(results),
    };

    console.log('⏳ Enviando reporte completo a través de SendGrid...');
    await sgMail.send(msg);
    console.log('🚀 ¡Correo enviado exitosamente!');
    console.log('📬 Destinatario:', msg.to);
  } catch (error) {
    console.error('❌ Error al enviar:');
    if (error.response) {
      console.error(JSON.stringify(error.response.body, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
})();
