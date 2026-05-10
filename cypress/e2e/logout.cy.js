describe('DCCF: Cierre de Sesión', () => {
  it('Debe forzar el logout', () => {
    cy.visit('/login');

    cy.get('input').eq(0).type('teveventaspasto@gmail.com');

    cy.get('input').eq(1).type('D4rk4rm4deus2026');

    cy.get('button')
      .contains(/entrar|login/i)
      .click();

    cy.wait(5000);

    // Buscamos el último elemento interactivo del nav (usualmente Salir/Logout)

    cy.get('nav, header').find('button, a').last().click({ force: true });

    cy.wait(2000);

    cy.url().should('include', '/login');

    cy.screenshot('LOGOUT_FINAL');
  });
});
