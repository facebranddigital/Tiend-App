describe('QA Automation - Bracasfood Flow', () => {
  it('Debe completar el flujo de pedido hasta Nequi', () => {
    cy.visit('/');

    // 1. Abrir chat y elegir producto
    cy.get('.float-btn.ai').click();
    cy.get('.btn-bot-item').first().click();

    // 2. Cantidad y Procesar Pago
    cy.get('.chat-footer input').type('1{enter}');
    cy.wait(1000);
    cy.get('.btn-bot-confirm').click();

    // 3. Dirección y Método de Pago
    cy.get('.chat-footer input').type('Direccion de prueba QA{enter}');
    cy.wait(1000);
    cy.get('.chat-footer input').type('Nequi{enter}');

    // 4. Aserción final: Botón morado visible
    cy.get('.btn-whatsapp').should('be.visible');
  });
});
