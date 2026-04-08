const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://tiend-app-wogt.vercel.app',
    setupNodeEvents(on, config) {
      // listeners
    },
  },
});
