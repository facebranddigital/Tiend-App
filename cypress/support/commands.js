Cypress.Commands.add('getActivationToken', (email) => {
  const inboxUrl = `https://mailsac.com/api/addresses/${email}/messages`;

  function fetchMessages(attempts = 0) {
    return cy.request({
      method: 'GET',
      url: inboxUrl,
      failOnStatusCode: false
    }).then((response) => {
      // Validamos si la respuesta es una lista de mensajes
      const messages = Array.isArray(response.body) ? response.body : [];

      // Reintento: 12 intentos cada 10 segundos = 2 minutos de espera total
      if (messages.length === 0 && attempts < 12) {
        cy.log(`Buscando correo en Mailsac... Intento ${attempts + 1} de 12`);
        cy.wait(10000); 
        return fetchMessages(attempts + 1);
      }
      
      if (messages.length === 0) {
        throw new Error(`No se recibió correo para ${email} tras 2 minutos. Revisa HubSpot.`);
      }
      
      const messageId = messages[0]._id;
      return cy.request(`https://mailsac.com/api/addresses/${email}/messages/${messageId}/body-text`);
    }).then((bodyResponse) => {
      const body = typeof bodyResponse === 'string' ? bodyResponse : bodyResponse.body;
      // Captura lo que esté después de "token=" hasta encontrar un espacio o fin de línea
      const tokenMatch = body.match(/token=([^&\s"<>]+)/);
      
      if (!tokenMatch) {
        throw new Error('Correo recibido pero no se encontró el token de activación.');
      }
      
      return tokenMatch[1];
    });
  }

  return fetchMessages();
});