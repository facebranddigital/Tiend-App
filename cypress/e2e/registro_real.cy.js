describe('QA Automation - Registro Real con Validación de Email', () => {
  const timestamp = Math.floor(Date.now() / 1000);
  const emailTesting = `ever2_test_${timestamp}@mailsac.com`;
  const passwordSegura = 'D4rk4rm4deus2026';

  it('Debe registrarse y validar el correo en Mailsac automáticamente', () => {
    cy.on('uncaught:exception', () => false);

    // 1. Registro
    cy.visit('/register');
    cy.get('input[formControlName="name"]').type('Ever Test User');
    cy.get('input[formControlName="email"]').type(emailTesting);
    cy.get('input[formControlName="password"]').type(passwordSegura);
    cy.get('input[formControlName="confirmPassword"]').type(passwordSegura);
    cy.contains('button', /Registrarse/i).click();

    // 2. Espera para el envío
    cy.log('Esperando entrega...');
    cy.wait(15000); 

    // Limpieza de navegación
    cy.window().then((win) => { win.location.href = 'about:blank'; });

    // 3. Salto a Mailsac
    cy.origin('https://mailsac.com', { args: { emailTesting } }, ({ emailTesting }) => {
      cy.on('uncaught:exception', () => false);
      cy.visit(`https://mailsac.com/inbox/${emailTesting}`);
      
      // Lógica mejorada: Si el correo ya está abierto o en la lista, lo manejamos
      cy.get('body', { timeout: 30000 }).then(($body) => {
        if ($body.text().includes('firebaseapp.com')) {
          cy.log('El correo ya parece estar abierto.');
        } else {
          // Si no está abierto, lo buscamos en la tabla
          cy.contains(/Verifica el correo electrónico/i, { timeout: 20000 })
            .should('be.visible')
            .click();
        }
      });

      // Extraer el link de validación
      // Buscamos el enlace que contiene el texto de la URL de Firebase que se ve en tu imagen
      return cy.get('a[href*="firebaseapp.com"]', { timeout: 20000 })
        .invoke('attr', 'href');
    }).then((href) => {
      if (!href) throw new Error('❌ No se encontró el enlace de Firebase.');
      cy.log('✅ URL capturada: ' + href);
      
      // 4. Visitar el link de validación
      cy.visit(href);
    });

    // 5. Verificación de éxito en Firebase.

    // En tu captura se ve el botón "Confirmar", buscamos éxito después de eso
    cy.contains(/verified|erifica|éxito/i, { timeout: 30000 })
      .should('be.visible');

    // 6. Regreso al Login para confirmar
    cy.visit('https://bracasfood.vercel.app');
    cy.get('input[formControlName="email"]', { timeout: 20000 }).should('be.visible');
    
    cy.screenshot('REGISTRO-EXITOSO-FINAL');
  });
});
