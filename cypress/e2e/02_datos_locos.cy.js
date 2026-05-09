describe('QA - Validación de Datos Bracasfood', () => {
  it('Debe rechazar cantidades no numéricas', () => {
    cy.visit('/');
    cy.get('.float-btn.ai').click();

    // 1. Elegimos un producto (Paso 1)
    cy.get('.btn-bot-item').first().click();

    // 2. Metemos texto en vez de número (Paso 2)
    cy.get('.chat-footer input').type('muchos{enter}');

    // 3. ASERCIÓN: El bot debe pedir un número válido (Case 2 de tu lógica)
    cy.contains('Por favor, dime un número válido').should('exist');

    // 4. Metemos un número negativo
    cy.get('.chat-footer input').clear().type('-5{enter}');
    cy.contains('Por favor, dime un número válido').should('exist');

    // 5. ASERCIÓN FINAL: El placeholder no debe haber cambiado a "pagar"
    cy.get('.chat-footer input').should('have.attr', 'placeholder', 'Escribe la cantidad...');
  });
});
