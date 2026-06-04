import './commands';

// Forzar la inyección del CSS de Leaflet directamente en el navegador de Cypress
beforeEach(() => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com';
  window.parent.document.head.appendChild(link);
});

// Silenciar excepciones de consola
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
