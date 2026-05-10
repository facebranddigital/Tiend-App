describe('QA Automation - Registro Real con Validación de Email', () => {
  const timestamp = Math.floor(Date.now() / 1000);
  const emailTesting = `ever_test_${timestamp}@mailsac.com`;
  const passwordSegura = 'D4rk4rm4deus2026';

  it('Debe registrarse y validar el correo en Mailsac automáticamente', () => {
    // 1. Registro
    cy.visit('/register');
    cy.get('input[formControlName="name"]').type('Ever Test User');
    cy.get('input[formControlName="email"]').type(emailTesting);
    cy.get('input[formControlName="password"]').type(passwordSegura);
    cy.get('input[formControlName="confirmPassword"]').type(passwordSegura);
    cy.contains('button', /Registrarse/i).click();

    // 2. Espera a que el servidor (debería) enviar el correo
    cy.wait(5000); 

    // 3. Ir a Mailsac usando cy.origin
    cy.visit(`https://mailsac.com/inbox/${emailTesting}`);

    cy.origin('https://mailsac.com', { args: { emailTesting } }, ({ emailTesting }) => {
      // Buscar el correo (esto fallará si el backend sigue dando 404)
      cy.contains('td', /Verifica|Welcome|Bienvenido/i, { timeout: 30000 })
        .should('be.visible')
        .click();

      // Extraer el link de validación
      cy.get('a').contains(/Verificar|Confirmar|Validar/i)
        .invoke('attr', 'href')
        .then((href) => {
          // Guardamos la URL para usarla fuera de cy.origin
          Cypress.env('validationUrl', href);
        });
    });

    // 4. Volver a tu App para validar
    cy.then(() => {
      const url = Cypress.env('validationUrl');
      if (url) {
        cy.visit(url);
      }
    });

    // 5. Verificación final en tu inventario
    cy.url({ timeout: 20000 }).should('include', '/products');
    cy.contains(/Inventario|Productos/i).should('be.visible');
    cy.screenshot('REGISTRO-Y-VALIDACION-EXITOSA');
  });
});
