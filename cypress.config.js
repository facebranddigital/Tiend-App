const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200', // <--- Agregamos esto
    supportFile: false,
  },
});
