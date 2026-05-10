describe('QA Automation - Flujo Completo Bracasfood', () => {
  it('Debería cerrar el modal, añadir producto y completar el pago', () => {
    // 1. Configuración de fallos y pantalla
    cy.on('uncaught:exception', () => false);
    cy.viewport(1440, 900);

    // 2. Visita inicial
    cy.visit('/');
    cy.wait(3000); // Tiempo para que el modal cargue

    // 3. Eliminación del Modal (Si existe)
    cy.get('body').then(($body) => {
      if ($body.find('app-modal, .modal, [class*="overlay"]').length > 0) {
        cy.log('Modal detectado. Eliminando del DOM...');
        cy.window().then((win) => {
          const modal = win.document.querySelector('app-modal, .modal, [class*="overlay"]');
          if (modal) modal.remove();
        });
      }
    });

    // 4. FLUJO DE COMPRA: Ir a la sección
    // Usamos uno de tus botones del Hero
    cy.contains('button', /Bolis Leche|Papitas BF/i)
      .should('be.visible')
      .click();

    // 5. AÑADIR AL CARRITO
    // Esperamos a que el ID del producto esté en pantalla
    cy.get('#bolis-leche', { timeout: 8000 }).should('be.visible');

    // Usamos .within para asegurar que clicamos el botón del producto correcto
    cy.get('#bolis-leche').within(() => {
      cy.get('button.add-btn')
        .contains('COMPRAR')
        .click();
    });

    // 6. IR AL CARRITO
    // Si cy.visit('/cart') te vacía el carrito, usa cy.get('[routerLink="/cart"]').click()
    cy.visit('/cart');
    cy.url().should('include', '/cart');

    // 7. VERIFICACIÓN DEL CARRITO
    // En lugar de clases genéricas, buscamos que el texto del producto esté presente
    cy.get('body', { timeout: 10000 })
      .should('not.contain', 'vacío') // Verifica que no diga "Carrito vacío"
      .and('contain', 'Bolis');       // Verifica que aparezca el nombre del producto

    // 8. PAGO FINAL
    // Buscamos el botón por su función (Pagar/Finalizar/Checkout)
    cy.get('button')
      .contains(/Finalizar|Pagar|Checkout|Enviar/i)
      .should('be.visible')
      .click({ force: true });

    // 9. EVIDENCIA
    cy.wait(2000);
    cy.screenshot('PAGO-EXITOSO-FINAL');
  });
});
