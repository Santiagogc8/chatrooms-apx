const database = require('./database.js'); // Usamos require()
const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const path = require('path');

const firestore = database.firestore;
const rtdb = database.rtdb;

const app = express(); // Inicializamos express
const port = 3000; // Y establecemos nuestro puerto

app.use(cors()); // Le decimos a express que use cors en todo
app.use(express.json()); // Le hacemos el parseo de JSON a todas las requests

const userCollection = firestore.collection('users'); // Accedemos a la coleccion users dentro de firestore y lo guardamos en una variable para luego
const roomCollection = firestore.collection('rooms'); // Accedemos a la coleccion rooms dentro de firestore y lo guardamos en una variable para luego

// Sign Up
// Creamos un post para la ruta signup que nos permitira
app.post('/signup', (req, res)=>{
    const email = req.body.email || ''; // Recibir un email para enviar un codigo y verificar si es la persona que dice ser
    const name = req.body.name || ''; // El user tambien nos puede enviar un nombre

    /* Las colecciones de firestore tienen una funcion llamada "where" que recibe 3 parametros y realiza una busqueda en todo el array de la coleccion

    1. El primer parametro, recibe la propiedad que se esta buscando. Por ejemplo, aqui estamos buscando email. Where itera todos los elementos y busca la propiedad email
    2. El segundo parametro, es la condicion. Mayor, menor, igual, etc. En nuestro caso queremos algo que sea igual (==)
    3. El tercer parametro, es el email que estamos buscando, entonces valida que la propiedad email, tenga el valor que estamos buscando de email

    Luego, debemos obtener el dato con get(), que nos devuelve una promesa. 
    La promesa la resolvemos con un if, 
    */
    userCollection.where("email", "==", email).get().then(searchRes => {
        if(searchRes.empty){ // En caso de que searchRes este vacio
            userCollection.add({ // agregamos un doc a la db que agrega. 
                email, // el email recibido 
                name // y el nombre recibido
            }).then(newUserRef => res.json({id: newUserRef.id})) // Luego, a la promesa le devolvemos la respuesta del json con el id con el que se creo la referencia
        }else { // Si el where retorna false
            res.status(400).json({ // Respondemos con un estado 400 (error del cliente) y enviamos un json con un mensaje
                message: "user already exists"
            })
        }
    })
})

// Authentication
// Pero si el usuario ya existe, debemos hacer que pueda "iniciar sesion". Entonces creamos nuestro endpoint en /auth
app.post('/auth', (req, res)=>{
    const { email } = req.body; // Recibimos el email. El email entre llaves es lo mismo que decir req.body.email. Basicamente las llaves actuan como un destruturador

    // Hacemos nuestro where buscando a email
    userCollection.where("email", "==", email).get().then(searchRes =>{
        if(searchRes.empty){ // Pero esta vez validamos si esta vacio. En caso afirmativo
            res.status(400).json({ // Respondemos con un estado 404 (no se encontro) y enviamos un json con un mensaje
                message: "user not found"
            })
        } else{ // En caso negativo 
            res.json({ // Devolvemos un json
                id: searchRes.docs[0].id // Este devuelve el resultado de la busqueda en su propiedad docs en la posicion 0 (es un array en el que el primer elemento es lo que buscamos) y accedemos a su id
            })
        }
    })
})

// Obtener la data de un user
// Si queremos mostrar el nombre o demas data de un usuario alternativo, debemos de obtener su objeto. Lo cual podemos hacer a traves de un endpoint a users
app.get('/users/:userId', (req, res) =>{
    const { userId } = req.params; // Obtenemos el userId de los parametros recibidos

    // Buscamos el documento directamente con el ID en la colección users
    userCollection.doc(userId).get().then(doc => {
        if (!doc.exists) { // Si no existe
            res.status(404).json({ message: "User not found" }); // Respondemos con un 404
            return; // Y terminamos la funcion
        }

        // Devolvemos el contenido del documento, que incluye 'name' y 'email' en caso de que si exista
        res.json(doc.data()); 

    }).catch(err => {
        // Manejo de errores
        console.error("Error al obtener usuario:", err);
        res.status(500).json({ message: "Internal Server Error" });
    });
})

// Creacion de room
// Ahora necesitamos crear una sala en la base de datos. Hacemos nuestro endpoint en /rooms
app.post('/rooms', (req, res)=>{
    const { userId } = req.body; // Buscamos al userId dentro de req.body y lo guardamos en una variable

    // Buscamos el documento con el id recibido en string y le hacemos un get para obtenerlo
    userCollection.doc(userId.toString()).get().then(doc => { // Respondemos la promesa con 
        if(doc.exists){ // Si el documento existe
            const roomRef = rtdb.ref('rooms/'+nanoid()) // Creamos una referencia en rooms/ (de la rtdb) y el id pasado por nano id.
            roomRef.set({ // Luego seteamos la nueva referencia con 
                messages: [], // Un array de mensajes que empieza vacio
                owner: userId // Y el owner que es el id que recibimos del body
            }).then(() => { // Respondemos la promesa
                const roomLongId = roomRef.key; // Guardamos el id que nos da la rtdb en una variable
                const roomId = 1000 + Math.floor(Math.random()*999) // Buscamos un numero al azar entre 1 y 999 y le sumamos 1000
                roomCollection.doc(roomId.toString()).set({ // A la roomCollection le agregamos un documento con el id creado en roomId en string y lo seteamos
                    rtdbRoomId: roomLongId // Con rtdbRoomId como propiedad y el id largo como valor
                }).then(()=>{ // Respondemos la promesa
                    res.json({ // Con un json con el id creado en string
                        id: roomId.toString()
                    })
                })
            })
        } else{ // En caso de que el id del usuario no exista
            res.status(401).json({ // Devolvemos un 401
                message: 'unauthorized' // Con el mensaje de unauthorized
            })
        }
    })
})

// get del chat con id
// Nos queda mostrar un chat con un id. Este lo recibimos como query param
app.get('/rooms/:roomId', (req, res)=>{
    const { userId } = req.query; // Obtenemos el query param del request
    const { roomId } = req.params; // Obtenemos el parametro roomId de la request

    // Buscamos el documento con el id recibido en string y le hacemos un get para obtenerlo
    userCollection.doc(userId.toString()).get().then(doc => { // Respondemos la promesa con 
        if(doc.exists){ // Si el documento existe
            roomCollection.doc(roomId).get().then(snap => { // Buscamos el documento con el roomId y respondemos la promesa con una snap
                const data = snap.data(); // Obtenemos la data del snap recibido
                res.json(data); // Y devolvemos un json con la data obtenida (el id largo de la room)
            })
        } else{ // En caso de que el id del usuario no exista
            res.status(401).json({ // Devolvemos un 401
                message: 'unauthorized' // Con el mensaje de unauthorized
            })
        }
    })
})

// Por ultimo necesitamos el endpoint para enviar mensajes
// Podemos crear el endpoint en /rooms/:roomId/message (ya que debemos crear una entidad dentro de messages)
app.post('/rooms/:roomId/messages', (req, res) => {
    const { roomId } = req.params; // Obtenemos el roomId que recibimos del endpoint
    const { userId } = req.body; // Obtenemos el userId del body de la request

    userCollection.doc(userId).get().then(doc =>{ // Entramos a la userCollection y buscamos el documento con el userId recibido, respondemos la promesa con el doc
        if(doc.exists){ // Si el documento existe
            roomCollection.doc(roomId).get().then(snap =>{ // Entramos a la roomCollection buscando el documento con el roomId recibido. Respondemos la promesa con la snap
                const rtdbRoomId = snap.data().rtdbRoomId; // Guardamos el id largo de la room obtenida de la data de la snap de la rtdb

                const roomRef = rtdb.ref('/rooms/' + rtdbRoomId + '/messages') // Creamos la referencia en la realtime database en la ruta "/rooms/roomId/messages"

                roomRef.push({ // Hacemos un push a la ref con
                    userId: userId, // El userId obtenido (para identificar al usuario)
                    message: req.body.message, // El mensaje recuperado del body
                    date: new Date().getTime() // Y Un timestamp (número) para la hora exacta
                });

                res.json({ // Terminamos la solicitud con la respuesta del servidor enviando un mensaje
                    message: 'send'
                })
            })
        } else{ // Si el documento con el userId no existe (significa que el usuario no esta registrado)
            res.status(401).json({ // Enviamos un 401 con un mensaje
                message: 'unauthorized' 
            });
        }
    })
});

// Determinamos la ruta absoluta a la carpeta 'dist' del frontend
// __dirname es 'chatrooms/api'. Subimos (..) y entramos a 'frontend/dist'
const staticPath = path.join(__dirname, '..', '..', 'frontend', 'dist');

// Usamos express.static para servir la carpeta compilada
app.use(express.static(staticPath));

// SPA FALLBACK: Redirigimos todas las demás rutas (ej. /chat/1234) a index.html
app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

app.listen(port, ()=>{ // Escuchamos la app en el puerto correspondiente
    console.log(`Your app listening at http://localhost:${port}`)
});