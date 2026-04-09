describe('QA Automation - Registro Real Dinámico', () => {
  // Correo único basado en el tiempo actual
  const timestamp = Math.floor(Date.now() / 1000);
  const emailTesting = `ever_test_${timestamp}@mailsac.com`;
  const passwordSegura = 'D4rk4rm4deus2026';

  it('Debe completar el flujo de registro y activación automáticamente', () => {
    cy.log('Iniciando prueba con: ' + emailTesting);

    // 1. Ir al registro
    cy.visit('/register'); 
    
    // 2. Llenar formulario
    cy.get('input[placeholder*="ejemplo.com"]', { timeout: 15000 })
      .should('be.visible')
      .type(emailTesting);

    cy.get('input[type="password"]').eq(0).type(passwordSegura);
    cy.get('input[type="password"]').eq(1).type(passwordSegura);
      
    // 3. Click en registrar
    cy.get('button').contains('Crear Cuenta').click();

    // 4. Espera inicial y búsqueda del Token
    cy.log('Registro enviado. Esperando que el correo llegue a Mailsac...');
    cy.wait(20000); // 20 seg de cortesía antes de la primera consulta

    cy.getActivationToken(emailTesting).then((token) => {
       cy.log('¡Token obtenido con éxito!: ' + token);

       // 5. Navegar a la página de activación con el token
       cy.visit(`/setup-password?token=${token}`);
       
       // 6. Configurar contraseña final
       cy.get('input[name="password"]', { timeout: 15000 }).type(passwordSegura);
       cy.get('input[name="confirmPassword"]').type(passwordSegura);
       cy.get('button').contains('Establecer').click();
       
       // 7. Validar mensaje de éxito en la UI
       cy.contains('éxito', { matchCase: false, timeout: 20000 }).should('be.visible');
    });
  });
});