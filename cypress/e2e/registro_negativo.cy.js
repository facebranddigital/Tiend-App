describe('Misión: Pruebas Negativas', () => {
  it('Debe mostrar error con credenciales inválidas', () => {
    cy.visit('https://tiend-app-wogt.vercel.app/login');
    cy.get('input').eq(0).type('usuario_falso@nada.com');
    cy.get('input').eq(1).type('password_incorrecta');
    cy.get('button').contains(/entrar|login/i).click();
    cy.wait(2000);
    // Verificamos que no pasamos al home
    cy.url().should('include', '/login');
    cy.screenshot('ERROR_LOGIN_NEGATIVO');
  });
});
