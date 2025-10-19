// Instalamos la libreria firebase-admin
import 'dotenv/config'
import * as admin from "firebase-admin"; // La importamos
import * as serviceAccountModule from "./key.json"; 

// Esta línea de validación revisa si la clave está en 'default' (por problemas de compilación) 
// o si es el objeto directo. Esto resuelve el problema de "invalid-credential".
const serviceAccount = (serviceAccountModule as any).default || serviceAccountModule;

admin.initializeApp({ // Inicializamos la app con el metodo initializeApp de admin
    credential: admin.credential.cert(serviceAccount), // Validamos la credencial con admin.credential.cert del JSON serviceAccount
    databaseURL: process.env.DATABASE_URL // Y le pasamos la url de la database de firebase
});

const firestore = admin.firestore(); // Guardamos el metodo firestore de admin en una variable
const rtdb = admin.database(); // Y guardamos la realtime database de firebase en una variable

export { firestore, rtdb }; // Exportamos firestore y la rtdb de firestore