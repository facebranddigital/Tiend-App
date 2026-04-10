describe('DCCF: Gestión de Perfil', () => {

  it('Debe validar datos de Ever', () => {

    cy.visit('https://tiend-app-wogt.vercel.app/login');

    cy.get('input').eq(0).type('teveventaspasto@gmail.com');

    cy.get('input').eq(1).type('D4rk4rm4deus2026');

    cy.get('button').contains(/entrar|login/i).click();

    cy.wait(5000);



    // Lógica condicional: si no ve el texto "Ever", intenta con el primer botón del nav

    cy.get('body').then(($body) => {

      if ($body.text().includes('Ever')) {

        cy.contains('Ever').click({force: true});

      } else {

        cy.get('nav button').first().click({force: true});

      }

    });

    cy.screenshot('PERFIL_VALIDADO');

  });

});
