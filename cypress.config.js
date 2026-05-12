const { defineConfig } = require('cypress');
const fs = require('fs');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: false,
    chromeWebSecurity: false, // Permite saltar entre dominios
    experimentalModifyObstructiveThirdPartyCode: true, // <--- AÑADE ESTO para evitar el error de spec bridge
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
