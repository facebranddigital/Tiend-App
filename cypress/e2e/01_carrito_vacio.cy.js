describe('QA - Seguridad de Bracasfood', () => {
  it('Debe bloquear el flujo de pago si no hay productos', () => {
    cy.visit('/');

    // 1. Abrir el chat
    cy.get('.float-btn.ai').click();

    // 2. Intentar pagar de inmediato
    cy.get('.chat-footer input').type('pagar{enter}');

    // 3. ASERCIÓN: El bot debe lanzar la alerta del Case 3
    cy.contains('Tu carrito está vacío')
      .should('exist') // 1. Verifica que el mensaje se creó en el código (Lógica OK)
      .scrollIntoView(); // 2. Intenta traerlo al área visible

    // 4. ASERCIÓN: El placeholder NO debe haber cambiado a dirección
    cy.get('.chat-footer input').should('have.attr', 'placeholder', '¿Qué deseas hacer? (1 o 2)');
  });
});
