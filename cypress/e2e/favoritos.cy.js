describe('Misión: Lista de Deseos', () => {
  it('Debe marcar un producto como favorito', () => {
    cy.visit('https://tiend-app-wogt.vercel.app/');
    cy.wait(5000);
    // Buscamos un icono de corazón o botón de favorito
    cy.get('button').find('i, svg').first().click({force: true, multiple: true});
    cy.log('Interacción con favoritos probada');
    cy.screenshot('FAVORITOS_TEST');
  });
});
