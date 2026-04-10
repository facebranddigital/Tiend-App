describe('Debug register page', () => {
  it('Submits form and saves final URL and DOM', () => {
    const emailTesting = 'ever_test_debug@mailsac.com';
    const passwordSegura = 'D4rk4arm4deus2026';

    cy.visit('/register');
    cy.get('input[placeholder*="ejemplo.com"]').should('be.visible').clear().type(emailTesting);
    cy.get('input[placeholder*="Mínimo 6 caracteres"]').should('be.visible').type(passwordSegura);
    cy.get('input[placeholder*="Repite tu contraseña"]').should('be.visible').type(passwordSegura);
    cy.get('button[type="submit"]').click({ force: true });
    cy.location('href', { timeout: 20000 }).then((href) => {
      cy.task('saveDebug', { filename: 'debug-register-final-url.txt', html: href });
    });
    cy.document().its('documentElement.outerHTML').then((html) => {
      cy.task('saveDebug', { filename: 'debug-register-final.html', html });
    });
  });
});