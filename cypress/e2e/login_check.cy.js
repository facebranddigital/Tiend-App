describe('Misión: Bracasfood Status Check', () => {
  it('Debe cargar la página principal', () => {
    // Visitamos la página raíz definida en cypress.config.js
    cy.visit('/');

    // Verificamos que contenga un elemento clave de la página de inicio
    // (Ajusta este selector según lo que haya en tu landing page real)
    // OPCIÓN 1: Buscar por el título de tu marca (Lo más seguro)
cy.contains(/Sabores de Nariño|Bracasfood/i, { timeout: 10000 }).should('be.visible');
    
    cy.screenshot('STATUS_CHECK_INICIO');
  });

  it('Debe cargar la página de Login', () => {
    // Visitamos la ruta relativa /login
    cy.visit('/login');
    cy.get('button').contains(/Iniciar Sesión/i).should('be.visible');

    // Verificamos que el formulario de login esté presente
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    
    cy.screenshot('STATUS_CHECK_LOGIN');
  });
});
