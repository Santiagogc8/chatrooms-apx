// En las ultimas versiones de firebase debemos hacer importaciones modulares
import { initializeApp } from "firebase/app"; // Importamos initializeApp
import { getDatabase, ref, onValue } from "firebase/database"; // Y getDatabase, refs, onValue 

const app = initializeApp({ // Guardamos nuestros datos de la rtdb
    apiKey: 'QQhvSmnDbQN8AUWwezOzvuE4ArYDY1gaGQNK7tNU',
    authDomain: 'apx-firebase.firebaseapp.com',
    databaseURL: 'https://apx-firebase-default-rtdb.firebaseio.com',
    projectId: 'apx-firebase'
});

const rtdb = getDatabase(app); // Obtenemos la database

export { rtdb, ref, onValue } // Y exportamos la rtdb, ref y el onValue