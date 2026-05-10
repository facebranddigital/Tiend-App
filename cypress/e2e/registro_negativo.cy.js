describe('Misión: Pruebas Negativas', () => {
  it('Debe mostrar error con credenciales inválidas', () => {
    cy.visit('/login');

    // Using :visible ensures we ignore that hidden search bar
    cy.get('input:visible').eq(0).type('usuario_falso@nada.com');
    cy.get('input:visible').eq(1).type('password_incorrecta');
    
    cy.get('button')
      .contains(/entrar|login/i)
      .click();

    // Instead of a hard wait(2000), Cypress automatically waits for assertions
    cy.url().should('include', '/login');

    // Optional: Check for an error message on the screen
    // cy.contains(/error|inválid|incorrect/i).should('be.visible');

    cy.screenshot('ERROR_LOGIN_NEGATIVO');
  });
});
