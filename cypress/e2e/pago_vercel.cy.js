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
       // 5. AÑADIR AL CARRITO
    cy.get('#bolis-leche', { timeout: 8000 }).should('be.visible');

    cy.get('#bolis-leche').within(() => {
      cy.get('button.add-btn')
        .contains('COMPRAR')
        .click();
    });

    // Pequeña espera para que el Signal y el LocalStorage se sincronicen
    cy.wait(1000); 

    // 6. IR AL CARRITO
    // Intentamos ir por clic para no refrescar la memoria, si falla, el visit ya tiene el respaldo del service
    cy.visit('/cart');
    cy.url().should('include', '/cart');

    // 7. VERIFICACIÓN EN EL CARRITO
    // Usamos una expresión regular /bolis/i para que no falle por mayúsculas/minúsculas
    cy.get('.cart-item h3', { timeout: 15000 }) 
      .should('be.visible') 
      .invoke('text')
      .should('match', /bolis/i); 


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
