// set-env.js — Genera environment.ts y environment.prod.ts con credenciales de Vercel antes del build
// Se ejecuta como: node set-env.js && ng build
const { writeFileSync, mkdirSync } = require('fs');

const defaultFirebase = {
  apiKey: 'AIzaSyDHwKpocUR1xHtCdhabnNiEAOOQpaXR6Mk',
  authDomain: 'tiend-app.firebaseapp.com',
  projectId: 'tiend-app',
  storageBucket: 'tiend-app.firebasestorage.app',
  messagingSenderId: '441509358559',
  appId: '1:441509350559:web:996a0f06a13a38b13a66aa',
  measurementId: 'G-0XP0146XTK'
};

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || defaultFirebase.apiKey,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || defaultFirebase.authDomain,
  projectId: process.env.FIREBASE_PROJECT_ID || defaultFirebase.projectId,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || defaultFirebase.storageBucket,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER || defaultFirebase.messagingSenderId,
  appId: process.env.FIREBASE_APP_ID || defaultFirebase.appId,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || defaultFirebase.measurementId
};

const makeContent = (production) => `export const environment = {
  production: ${production},
  firebase: ${JSON.stringify(firebaseConfig, null, 2)}
};
`;

mkdirSync('./src/environments', { recursive: true });
writeFileSync('./src/environments/environment.ts', makeContent(false), 'utf8');
writeFileSync('./src/environments/environment.prod.ts', makeContent(true), 'utf8');
console.log('✅ environment files generado desde variables de entorno de Vercel');
