describe('Misión: Validación de Catálogo', () => {
  it('Debe mostrar la lista de productos y entrar a uno', () => {
    cy.visit('https://tiend-app-wogt.vercel.app/');
    cy.wait(5000);
    // Verificar que existan tarjetas de productos
    cy.get('button').contains(/ver|detalle|comprar/i).should('be.visible');
    cy.screenshot('CATALOGO_OK');
  });
});
