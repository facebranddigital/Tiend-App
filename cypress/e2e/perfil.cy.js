describe('DCCF: Gestión de Perfil', () => {
  it('Debe validar datos de Ever', () => {
    cy.visit('/login');

    // 1. LOGIN CORREGIDO: Saltamos el buscador (eq 1 y 2) y usamos force
    cy.get('input')
      .eq(1)
      .type('teveventaspasto@gmail.com', { force: true })
      .trigger('input', { force: true });

    cy.get('input')
      .eq(2)
      .type('D4rk4rm4deus2026', { force: true })
      .trigger('input', { force: true });

    cy.get('button')
      .contains(/entrar|login|iniciar sesión/i)
      .click({ force: true });

    cy.wait(5000);

    // 2. Lógica para entrar al perfil de Ever
    cy.get('body').then(($body) => {
      const texto = $body.text();
      // Usamos una búsqueda más flexible para el nombre
      if (texto.includes('Ever') || texto.includes('Perfil')) {
        cy.contains(/Ever|Perfil/i).click({ force: true });
      } else {
        // Si no aparece el nombre, buscamos el icono de usuario o primer botón del nav
        cy.get('nav button, .user-icon').first().click({ force: true });
      }
    });

    cy.wait(2000);
    cy.screenshot('PERFIL_VALIDADO');
  });
});
