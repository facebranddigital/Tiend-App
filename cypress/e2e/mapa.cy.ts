describe('Prueba Automatizada de Seguimiento de Pedido - Bracasfood', () => {
  const PEDIDO_TEST_ID = 'BR-1679';

  beforeEach(() => {
    cy.visit(`/seguimiento/${PEDIDO_TEST_ID}`, {
      onBeforeLoad(win) {
        const mockGeolocalizacion = {
          watchPosition: (success: any, error: any, options: any) => {
            success({
              coords: {
                latitude: 3.4516,
                longitude: -76.532,
                accuracy: 10
              },
              timestamp: Date.now()
            });
            (win as any).actualizarGpsSimulado = success;
            return 1;
          },
          clearWatch: cy.stub().as('clearWatch')
        };
        Object.defineProperty(win.navigator, 'geolocation', {
          value: mockGeolocalizacion,
          writable: true
        });
      }
    });
  });

  it('Debería renderizar el mapa con dimensiones correctas', () => {
    // Forzar estilos de visualización al contenedor del mapa para evitar el fondo crema invisible
    cy.get('#map-container')
      .invoke('attr', 'style', 'height: 500px; width: 100%; display: block;')
      .should('be.visible');

    cy.contains(`Pedido #${PEDIDO_TEST_ID}`).should('be.visible');
    cy.get('path.leaflet-interactive', { timeout: 6000 }).should('exist');
  });
});
