describe('QA Automation - Registro Real Dinámico', () => {
  // Correo único basado en el tiempo actual
  const timestamp = Math.floor(Date.now() / 1000);
  const emailTesting = `ever_test_${timestamp}@mailsac.com`;
  const passwordSegura = 'D4rk4rm4deus2026';

  it('Debe completar el flujo de registro y activación automáticamente', () => {
    cy.log('Iniciando prueba con: ' + emailTesting);

    // 1. Ir al registro
    cy.visit('/register'); 
    
    // 2. Llenar formulario
    cy.get('[data-testid="reg-name"]', { timeout: 15000 })
      .should('be.visible')
      .type('Test Usuario');

    cy.get('[data-testid="reg-email"]', { timeout: 15000 })
      .should('be.visible')
      .clear()
      .type(emailTesting);

    cy.get('[data-testid="reg-password"]', { timeout: 15000 })
      .should('be.visible')
      .type(passwordSegura);

    cy.get('[data-testid="reg-confirm-password"]', { timeout: 15000 })
      .should('be.visible')
      .type(passwordSegura);

    // 3. Click en registrar
    cy.contains('button', /registrarme ahora/i).click();

    // 4. Validar redirección al inventario de productos
    cy.url({ timeout: 20000 }).should('include', '/products');
    cy.contains('Inventario de Productos', { timeout: 20000 }).should('be.visible');
  });
});