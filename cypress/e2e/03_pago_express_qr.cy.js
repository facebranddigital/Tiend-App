describe('QA - Flujo Completo: De Bolis a WhatsApp', () => {

  it('Debe agregar Bolis y validar el mensaje de Pago Express Nequi', () => {
    // 1. Interceptar window.open
    cy.visit('http://localhost:4200/?openbot=true', {
      onBeforeLoad(win) {
        cy.stub(win, 'open').as('whatsappWindow');
      }
    });
    cy.on('uncaught:exception', () => false);

    // 2. SELECCIONAR PRODUCTO (Bolis)
    cy.contains('.product-card', /Bolis/i, { timeout: 15000 })
      .find('button').first().click({ force: true });

    // 3. CLIC EN EL BOTÓN MORADO DE PAGO EXPRESS
    cy.contains('button', 'Confirmar y recibir QR en WhatsApp 🚀', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // 4. ESPERA DEL SETTIMEOUT
    cy.wait(2000); 
    
    // 5. VERIFICACIÓN FINAL DEL CONTENIDO REAL
    cy.get('@whatsappWindow').should('be.called').then((stub) => {
      const urlEnviada = stub.getCall(0).args[0]; // Tomamos la URL completa
      
      // Validamos los datos reales que se ven en tu log
      expect(urlEnviada).to.include('573218119383');
      expect(urlEnviada).to.include('PAGO_NEQUI_BRACAS');
      expect(urlEnviada).to.include('Solicito%20el%20QR%20de%20Nequi');
      
      cy.log('✅ URL de Pago Express capturada correctamente');
    });

    cy.screenshot('PAGO-EXPRESS-NEQUI-VALIDADO');
  });
});
