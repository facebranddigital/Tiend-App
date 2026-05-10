Cypress.Commands.add('getActivationToken', (email) => {
  const inboxUrl = `https://mailsac.com/api/addresses/${email}/messages`;

  function fetchMessages(attempts = 0) {
    return cy
      .request({
        method: 'GET',
        url: inboxUrl,
        // Si usas API Key de Mailsac, agrégala aquí:
        // headers: { 'Mailsac-Key': 'TU_KEY_AQUÍ' },
        failOnStatusCode: false,
      })
      .then((response) => {
        const messages = Array.isArray(response.body) ? response.body : [];

        if (messages.length === 0 && attempts < 12) {
          cy.log(`Buscando correo... Intento ${attempts + 1}`);
          cy.wait(10000);
          return fetchMessages(attempts + 1);
        }

        if (messages.length === 0) {
          throw new Error(`Timeout: No llegó el correo a ${email}.`);
        }

        // Tomamos el ID del mensaje más reciente
        const messageId = messages[0]._id;
        const detailUrl = `https://mailsac.com/api/addresses/${email}/messages/${messageId}/body-text`;

        return cy.request({ url: detailUrl, log: true });
      })
      .then((bodyResponse) => {
        // Cypress a veces pone el texto directamente en bodyResponse o en bodyResponse.body
        const bodyText = typeof bodyResponse.body === 'string' ? bodyResponse.body : bodyResponse;

        const tokenMatch = bodyText.match(/token=([^&\s"<>]+)/);

        if (!tokenMatch) {
          cy.log('Cuerpo del correo:', bodyText); // Útil para debug
          throw new Error('Token no encontrado en el texto del correo.');
        }

        const token = tokenMatch[1];
        cy.log(`Token recuperado: ${token}`);
        return token;
      });
  }

  return fetchMessages();
});
