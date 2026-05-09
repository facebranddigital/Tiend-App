describe('QA - Funcionalidad QR Bracasfood', () => {
  it('Debe activar Pago Express y abrir WhatsApp al hacer clic', () => {
    // 1. Simular escaneo de QR
    cy.visit('/?openbot=true');
    cy.wait(1500);

    // 2. Verificar mensaje de bienvenida
    cy.contains('pago rápido iniciado').should('exist');

    // 3. Stub para capturar la apertura de la ventana (Previene que Cypress se bloquee)
    cy.window().then((win) => {
      cy.stub(win, 'open').as('whatsappOpen');
    });

    // 4. DAR CLIC AL BOTÓN MORADO
    cy.get('.btn-whatsapp').contains('Confirmar').click();

    // 5. ASERCIÓN: Verificar que se intentó abrir la URL de WhatsApp con tu número
    cy.get('@whatsappOpen').should('be.calledWithMatch', /https:\/\/wa.me\/573218119383/);
  });
});
