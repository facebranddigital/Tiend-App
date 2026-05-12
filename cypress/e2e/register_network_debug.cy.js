describe('Network debug for register', () => {
  it('captures auth network activity during signup', () => {
    const calls = [];

    cy.intercept('POST', '**/accounts:signUp*', (req) => {
      calls.push({ type: 'signUp', url: req.url, body: req.body });
      req.continue();
    }).as('signUp');

    cy.intercept('POST', '**/token*', (req) => {
      calls.push({ type: 'token', url: req.url, body: req.body });
      req.continue();
    }).as('token');

       cy.visit('/register');

    // 1. Nombre (Usando formControlName como selector)
    cy.get('input[formControlName="name"]', { timeout: 15000 })
      .should('be.visible')
      .type('Debug User');

    // 2. Email
    cy.get('input[formControlName="email"]')
      .should('be.visible')
      .clear()
      .type(`debug_${Date.now()}@example.com`);

    // 3. Password
    cy.get('input[formControlName="password"]')
      .should('be.visible')
      .type('D4rk4rm4deus2026');

    // 4. Confirm Password
    cy.get('input[formControlName="confirmPassword"]')
      .should('be.visible')
      .type('D4rk4rm4deus2026');

    // 5. Botón Registrarse (Ajustado al texto de tu HTML)
    cy.get('button.btn-submit')
      .contains(/Registrarse/i) 
      .click();

        // ... (vienes del código anterior)
    cy.wait(2000).then(() => {
      cy.task('saveDebug', { 
        filename: 'register-network-debug.json', 
        html: JSON.stringify(calls, null, 2) 
      });
    });
  }); // Cierra el it
}); // Cierra el describe
