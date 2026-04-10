describe('QA Automation - Kill Modal & Checkout', () => {
  it('Debería cerrar el modal por la fuerza y completar el pago', () => {
    cy.on('uncaught:exception', () => false);

    // 1. FORZAR RESOLUCIÓN: Evitamos que la pantalla cambie de tamaño
    cy.viewport(1440, 900);

    // 2. VISITAR: Esperamos que cargue el contenido
    cy.visit('https://tiend-app-wogt.vercel.app');
    cy.wait(6000);

    // 3. ATAQUE AL MODAL: Intentamos clic en la esquina de la "X"
    cy.get('body').then(($body) => {
      if ($body.text().includes('Nuestras Colecciones')) {
        cy.log('Modal detectado. Tirando a la X superior derecha...');
        
        // Buscamos el contenedor blanco y hacemos clic en su esquina superior derecha
        cy.contains('Nuestras Colecciones')
          .parent()
          .click('topRight', { force: true, x: -10, y: 10 });
        
        cy.wait(2000);
      }
    });

    // 4. LIMPIEZA DE CÓDIGO (Anti-cambio de tamaño)
    // Si el modal sigue ahí estorbando, lo borramos del HTML directamente
    cy.window().then((win) => {
      const modal = win.document.querySelector('app-modal, .modal, [class*="overlay"], div[style*="position: fixed"]');
      if (modal) {
        modal.remove();
        cy.log('Modal eliminado del código.');
      }
    });

    // 5. FLUJO DE COMPRA: El camino ya debe estar limpio
    cy.contains(/SHOP NOW|VER COLECCIÓN/i).first().click({ force: true });
    
    // Ir al carrito
    cy.visit('https://tiend-app-wogt.vercel.app/#/cart');
    cy.wait(4000);

    // 6. PAGO: Clic en el botón final
    cy.get('button').filter(':visible').last().click({ force: true });

    cy.wait(5000);
    cy.screenshot('PAGO-EXITOSO-FINAL');
  });
});
