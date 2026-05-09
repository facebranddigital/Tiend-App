describe('Misión: Buscador de Productos', () => {
  it('Debe filtrar productos por nombre', () => {
    cy.visit('https://tiend-app-wogt.vercel.app/');
    cy.wait(4000);
    // Buscamos el input de búsqueda (ajusta el selector si es necesario)
    cy.get('input').first().type('Robot', { force: true });
    cy.wait(2000);
    cy.screenshot('RESULTADO_BUSQUEDA');
    cy.log('Búsqueda ejecutada con éxito');
  });
});
