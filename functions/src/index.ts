import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';

// Esta función es para confirmar que tu servidor en la nube ya nos hace caso
export const checkBackend = onRequest((request, response) => {
  logger.info('Consulta al backend de Tiend-App', { structuredData: true });
  response.send('¡Backend de Tiend-App funcionando correctamente, Ever!');
});
