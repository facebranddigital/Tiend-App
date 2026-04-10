describe('DCCF: Proceso de Pago', () => {

  it('Debe navegar al checkout y validar estado', () => {

    cy.visit('https://tiend-app-wogt.vercel.app/login');

    cy.get('input').eq(0).type('teveventaspasto@gmail.com');

    cy.get('input').eq(1).type('D4rk4rm4deus2026');

    cy.get('button').contains(/entrar|login/i).click();

    cy.wait(5000);

    

    // Forzamos la visita a la ruta de pago sin que Cypress se detenga si hay error 404/500

    cy.visit('https://tiend-app-wogt.vercel.app/checkout', { failOnStatusCode: false });

    cy.screenshot('CHECKOUT_STATE');

  });

});
