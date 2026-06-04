const { defineConfig } = require('cypress');
const fs = require('fs');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts', // 👈 Enlazado directo a tu archivo TypeScript de soporte
    chromeWebSecurity: false, // Desactiva bloqueos de Same-Origin en localhost
    experimentalModifyObstructiveThirdPartyCode: true, // Previene bloqueos por scripts externos
    setupNodeEvents(on, config) {
      on('task', {
        saveDebug({ filename, html }) {
          console.log(`Guardando archivo de depuración en: ${filename}`);
          fs.writeFileSync(filename, html);
          return null;
        },
      });
      return config;
    },
  },
});
