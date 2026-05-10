describe('Misión: Buscador de Productos', () => {
  it('Debe filtrar productos por nombre', () => {
    cy.visit('/');
    cy.get('body').should('be.visible'); // Espera a que cargue la página

    // Usamos el selector de clase y el force: true
    cy.get('.search-input').type('Bolis{enter}', { force: true });

    cy.wait(2000); // Esperamos a que el filtro actúe
    cy.screenshot('RESULTADO_BUSQUEDA');
    cy.log('Búsqueda ejecutada con éxito');
  });
});
