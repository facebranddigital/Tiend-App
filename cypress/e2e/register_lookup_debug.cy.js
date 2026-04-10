describe('Firebase auth debug', () => {
  it('captures lookup request after signup', () => {
    const callLog = [];

    cy.intercept('POST', '**/accounts:signUp*', (req) => {
      callLog.push({ type: 'signUp', url: req.url, body: req.body });
      req.continue();
    }).as('signUp');

    cy.intercept('POST', '**/accounts:lookup*', (req) => {
      callLog.push({ type: 'lookup', url: req.url, body: req.body });
      req.continue();
    }).as('lookup');

    cy.visit('/register');
    cy.get('[data-testid="reg-name"]', { timeout: 15000 }).should('be.visible').type('Debug User');
    cy.get('[data-testid="reg-email"]', { timeout: 15000 }).should('be.visible').clear().type(`debug_${Date.now()}@example.com`);
    cy.get('[data-testid="reg-password"]', { timeout: 15000 }).should('be.visible').type('D4rk4rm4deus2026');
    cy.get('[data-testid="reg-confirm-password"]', { timeout: 15000 }).should('be.visible').type('D4rk4rm4deus2026');
    cy.contains('button', /registrarme ahora/i).click();
    cy.wait('@signUp');
    cy.wait('@lookup');
    cy.then(() => cy.task('saveDebug', { filename: 'register-lookup-debug.json', html: JSON.stringify(callLog, null, 2) }));
  });
});
