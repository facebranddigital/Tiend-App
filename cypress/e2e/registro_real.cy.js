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

    // 2. Tiempo para que SendGrid entregue el correo
    cy.wait(12000); 

    // Limpieza de Spec Bridge
    cy.window().then((win) => { win.location.href = 'about:blank'; });
    cy.wait(2000);

    // 3. Salto a Mailsac
    cy.origin('https://mailsac.com', { args: { emailTesting } }, ({ emailTesting }) => {
      cy.on('uncaught:exception', () => false);
      
      // Reintento de visita si la bandeja está vacía
      cy.visit(`https://mailsac.com/inbox/${emailTesting}`, { timeout: 60000 });
      
      // Esperar y buscar el asunto (Soporta inglés y español)
      cy.get('table', { timeout: 45000 }).should('be.visible');
      cy.contains(/Verify Email Address|Verifica el correo electrónico/i, { timeout: 30000 })
        .should('be.visible')
        .click();

      // Extraer el link de validación
      return cy.get('body').then(($body) => {
        // Busca enlaces con palabras clave o que apunten a Firebase
        const link = $body.find('a').filter((i, el) => 
          /Confirm|Verify|Verificar|Confirmar/i.test(el.innerText) || el.href.includes('firebaseapp.com')
        ).attr('href');

        if (link) return link;

        // Si es texto plano, extraer por Regex
        const text = $body.text();
        const regex = /(https:\/\/tiend-app\.firebaseapp\.com\/__\/auth\/action?[^\s]+)/;
        const matches = text.match(regex);
        return matches ? matches[0] : null;
      });
    }).then((href) => {
      // 4. Volver a tu App para validar
      if (!href) throw new Error('No se encontró el link de validación.');
      cy.log('✅ URL capturada: ' + href);
      cy.visit(href);
    });

    // 5. Verificación final
    cy.contains(/Se verificó tu correo|Your email has been verified/i, { timeout: 20000 })
      .should('be.visible');

    // Volver al Login de tu app para cerrar el flujo
    cy.visit('http://localhost:4200/login');
    cy.get('input[formControlName="email"]', { timeout: 15000 }).should('be.visible');

    cy.screenshot('REGISTRO-EXITOSO-BRACASFOOD');
  });
});
