describe('Misión: Tiend-App Status Check', () => {
  it('Debe cargar la página principal', () => {
    // Visitamos la página raíz definida en cypress.config.js
    cy.visit('/');

    // Verificamos que contenga un elemento clave de la página de inicio
    // (Ajusta este selector según lo que haya en tu landing page real)
    cy.contains(/bienvenido|tienda|productos/i).should('be.visible');
    
    cy.screenshot('STATUS_CHECK_INICIO');
  });

  it('Debe cargar la página de Login', () => {
    // Visitamos la ruta relativa /login
    cy.visit('/login');

    // Verificamos que el formulario de login esté presente
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    
    cy.screenshot('STATUS_CHECK_LOGIN');
  });
});
