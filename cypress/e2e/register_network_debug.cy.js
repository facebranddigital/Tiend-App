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
    cy.get('[data-testid="reg-name"]', { timeout: 15000 }).should('be.visible').type('Debug User');
    cy.get('[data-testid="reg-email"]', { timeout: 15000 }).should('be.visible').clear().type(`debug_${Date.now()}@example.com`);
    cy.get('[data-testid="reg-password"]', { timeout: 15000 }).should('be.visible').type('D4rk4rm4deus2026');
    cy.get('[data-testid="reg-confirm-password"]', { timeout: 15000 }).should('be.visible').type('D4rk4rm4deus2026');
    cy.contains('button', /registrarme ahora/i).click();
    cy.wait(2000).then(() => {
      cy.task('saveDebug', { filename: 'register-network-debug.json', html: JSON.stringify(calls, null, 2) });
    });
  });
});
