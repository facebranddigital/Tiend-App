describe('DCCF: Cierre de Sesión', () => {
  it('Debe iniciar sesión y realizar el logout al lado del carrito', () => {
    // 1. Limpiar el almacenamiento local y las cookies antes de iniciar
    cy.clearLocalStorage();
    cy.clearCookies();

    cy.visit('/login');
    cy.on('uncaught:exception', () => false);

    // 2. Introducir credenciales con limpieza de texto previa
    cy.get('input[formControlName="email"]', { timeout: 15000 })
      .should('be.visible')
      .clear({ force: true })
      .type('teveventaspasto@gmail.com', { delay: 50 });

    cy.get('input[formControlName="password"]')
      .should('be.visible')
      .clear({ force: true })
      .type('D4rk4rm4deus2026', { delay: 50 });

    // 3. Forzar el enfoque y envío del formulario a través del botón
    cy.get('button.login-btn')
      .scrollIntoView()
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true });

    // 4. Esperar el cambio de estado en la URL (Login Exitoso)
    cy.url({ timeout: 20000 }).should('not.include', '/login');
    cy.log('✅ Login exitoso, procediendo al Logout');

    // 5. LOGOUT DIRECTO AL LADO DEL CARRITO
    cy.get('nav, header').within(() => {
      // Localizamos el contenedor del carrito para movernos horizontalmente a su derecha
      cy.get('.fa-shopping-cart, .fa-cart-shopping, .fa-shopping-bag, [routerLink="/carrito"]')
        .parent()
        .nextAll()
        .find('button, a, i')
        .first()
        .should('be.visible')
        .click({ force: true });
    });

    // 6. Confirmar retorno a la pantalla de Login
    cy.url({ timeout: 15000 }).should('include', '/login');
    cy.screenshot('LOGOUT_ROJO_DERECHA_EXITOSO');
  });
});
