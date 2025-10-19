// Instalamos la libreria firebase-admin
require('dotenv').config();
const admin = require('firebase-admin'); // La importamos

// Cargamos el contenido JSON del secreto de Render
const serviceAccountJson = process.env.FIREBASE_KEY_JSON;

// Comprobamos si el contenido existe y lo parseamos
if (!serviceAccountJson) {
    throw new Error("FIREBASE_KEY_JSON no está configurada en Render");
}

// JSON.parse() convierte el string JSON en un objeto JavaScript
const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({ // Inicializamos la app con el metodo initializeApp de admin
    credential: admin.credential.cert(serviceAccount), // Validamos la credencial con admin.credential.cert del JSON serviceAccount
    databaseURL: process.env.DATABASE_URL // Y le pasamos la url de la database de firebase
});

const firestore = admin.firestore(); // Guardamos el metodo firestore de admin en una variable
const rtdb = admin.database(); // Y guardamos la realtime database de firebase en una variable

export { firestore, rtdb }; // Exportamos firestore y la rtdb de firestore