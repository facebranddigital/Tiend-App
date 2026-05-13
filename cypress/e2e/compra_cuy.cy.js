describe('QA Automation - Flujo Bracasfood Completo', () => {
  
  it('Debe navegar desde el Logo hasta comprar el Cuy', () => {
    // 1. Visitar la página inicial
    cy.visit('/');
    cy.on('uncaught:exception', () => false);

    // 2. PRIMERO: Clic al Logo (clase .logo-link según tu HTML)
    cy.get('.logo-link')
      .should('be.visible')
      .click();
    
    // 3. SEGUNDO: Clic en el botón "VER PLATOS"
    // (Asegúrate de que este botón aparezca después de clickear el logo)
    cy.contains(/VER PLATOS/i, { timeout: 10000 })
      .should('be.visible')
      .click();

    // 4. TERCERO: Buscar el Cuy y darle a COMPRAR
    // Usamos la estructura de tu HTML de Sabores de Nariño
    cy.contains('.product-card', 'Cuy Asado Tradicional')
      .find('button.btn-add')
      .should('be.visible')
      .click();

    cy.log('✅ Proceso completado: Logo -> Ver Platos -> Comprar Cuy');
    
    // Evidencia final
    cy.screenshot('paso-final-cuy');
  });
});
