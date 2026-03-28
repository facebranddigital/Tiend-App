// set-env.js — Genera environment.ts con credenciales de Vercel antes del build
// Se ejecuta como: node set-env.js && ng build
const { writeFileSync, mkdirSync } = require('fs');

const content = `export const environment = {
  production: true,
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY || ''}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN || ''}',
    projectId: '${process.env.FIREBASE_PROJECT_ID || ''}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET || ''}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER || ''}',
    appId: '${process.env.FIREBASE_APP_ID || ''}',
    measurementId: '${process.env.FIREBASE_MEASUREMENT_ID || ''}'
  }
};
`;

mkdirSync('./src/environments', { recursive: true });
writeFileSync('./src/environments/environment.ts', content, 'utf8');
console.log('✅ environment.ts generado desde variables de entorno de Vercel');
