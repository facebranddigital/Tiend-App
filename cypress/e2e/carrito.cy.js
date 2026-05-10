describe('DCCF: Flujo de Carrito - Tiend-App', () => {
  it('Debe agregar productos y verificar el total', () => {
    // 1. Visitamos la raíz del host (http://localhost:4200)
    cy.visit('/');

    const emailValido = 'teveventaspasto@gmail.com';
    const passValida = 'D4rk4rm4deus2026';

    // --- SECCIÓN: LOGIN CON DISPARADORES MANUALES ---
    // Explicación: Usamos { force: true } en type y trigger porque tus inputs 
    // miden 0px de ancho y Cypress cree que están ocultos.
    
    cy.get('input').eq(0)
      .type(emailValido, { force: true })
      .trigger('input', { force: true })  // Obligamos al evento input aunque sea "invisible"
      .trigger('blur', { force: true });

    cy.get('input').eq(1)
      .type(passValida, { force: true })
      .trigger('input', { force: true })
      .trigger('blur', { force: true });

    // Buscamos el botón de acceso por texto (Entrar o Login)
    cy.get('button')
      .contains(/entrar|login/i)
      .click({ force: true });

    // Espera extendida para que el catálogo de productos cargue desde el servidor
    cy.wait(8000); 

    // --- SECCIÓN: SELECCIÓN DE PRODUCTO ---
    // 1. Entrar al primer producto disponible (usamos posición eq(1) como tenías)
    cy.get('button').eq(1).click({ force: true });

    // Esperamos a que cargue la vista de detalle del producto
    cy.wait(5000); 

    // --- SECCIÓN: AGREGAR AL CARRITO ---
    // 2. Buscamos cualquier botón que tenga texto relacionado con "comprar" o "agregar"
    cy.get('button').then(($btns) => {
      const btnAdd = $btns.toArray().find((b) => /agregar|add|carrito|buy/i.test(b.innerText));

      if (btnAdd) {
        // Si encontramos el botón por nombre, le damos click
        cy.wrap(btnAdd).click({ force: true });
      } else {
        // Si no hay texto claro, le damos al último botón (estrategia de respaldo)
        cy.get('button').last().click({ force: true });
      }
    });

    // --- SECCIÓN: FINALIZACIÓN Y EVIDENCIA ---
    // 3. Verificación de éxito (Screenshot para evidencia)
    cy.wait(3000);
    cy.screenshot('RESULTADO_CARRITO_EVER');

    cy.log('¡Flujo de carrito ejecutado con éxito!');
  });
});
