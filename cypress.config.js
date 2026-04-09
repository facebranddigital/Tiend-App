const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Ajusta según tu URL de Vercel
    baseUrl: 'https://tiend-app-wogt.vercel.app', 
  },
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/results',
    overwrite: false,
    html: false, // Desactivamos el HTML individual para unir todo al final
    json: true,
  },
});
