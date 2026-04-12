describe('DCCF: Validación de API de Pago', () => {
  it('Debe procesar un pago exitoso vía API', () => {
    cy.request('POST', 'https://tiend-app-wogt.vercel.app/api/checkout', {
      cart: [{ id: 1, name: 'Producto Prueba', price: 100 }],
      email: 'teveventaspasto@gmail.com',
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('success');
      cy.log('ID de Transacción: ' + response.body.transactionId);
    });
  });
});
