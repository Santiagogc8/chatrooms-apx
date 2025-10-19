import { rtdb, ref, onValue } from './rtdb'

interface RoomData {
    userId: string,
    rtdbRoomId: string,
    roomId: string
}

const API_BASE_URL = "https://chatrooms-apx.onrender.com";

const state = { // Definimos nuestro state
    data: {
        namesCache: {} // Establecemos un objeto que obtendra los nombres de los usuarios por su id
    },
    listeners: [] as any[],
    getState(){ // Creamos nuestro metodo que nos devolvera la ultima version del estado
        return this.data
    },
    setState(newState: any){ // Creamos nuestro metodo de setState que recibe un nuevo estado
        this.data = newState // Iguala la data del momento con la del nuevo estado 
        for(const cb of this.listeners){cb()} // Y por cada callback del listeners, lo ejecuta
    },
    suscribe(callback: (arg: any) => any){ // Creamos nuestro metodo suscribe para que notifique cambios
        this.listeners.push(callback) // Pusheamos al array de listeners el callback recibido
        return () => { // Retornamos una funcion
            // Que valida si cada listener de listeners es diferente de callback y lo guardamos en el listeners. Esto nos ayudara a "desuscribirnos" de los listeners que ya no usamos
            this.listeners = this.listeners.filter(listener => listener !== callback)
        }
    }, 
    setRoom(objectId: RoomData){ // Creamos nuestro metodo setRoom que recibe un parametro de tipo RoomData
        this.setState({...this.data, ...objectId}); // setea el nuevo estado

        this.listenRoom(objectId.rtdbRoomId) // Llamamos a listenRoom con la propiedad rtdbRoomId de objectId como parametro
    },
    listenRoom(rtdbRoomId: string){ // Creamos nuestro metodo listenRoom, que escuchara los cambios dentro de la rtdb. Este recibe el id de la room de la rtdb
        const messageRef = ref(rtdb, `/rooms/${rtdbRoomId}/messages`); // Obtenemos la referencia de la rtdb en /rooms/:rtdbRoomId/messages y la guardamos en una variable

        // Escuchamos los cambios de la referencia de la rtdb y sobre el snap
        onValue(messageRef, snap => {
            // Guardamos los valores en una variable, lo que nos devuelve el snap (un objeto de objetos) convertido en array (o un objeto vacio en caso de que retorne null)
            const messagesArray = Object.values(snap.val() || {})
            const newState = { // Creamos un nuevo estado
                ...this.data, // Con el estado actual 
                messages: messagesArray // Mas el array de mensajes
            }
            this.setState(newState) // Hacemos un setState con el nuevo estado
        })
    },
    async setAuth(email: string): Promise<string | null> { // Creamos un metodo que nos permitira validar si el email ya existe en la db o no y nos devuelve una promesa con un string (caso afirmativo) o un null (caso negativo)
        const res = await fetch(API_BASE_URL + '/auth', { // Hacemos el fetch con POST 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Pasamos los headers
            body: JSON.stringify({ email: email }) // Y el email en string
        })

        if(res.ok){ // Si la respuesta tiene una propiedad ok
            const getUser = await res.json(); // Esperamos la respuesta del servidor en json
            const newState = { // Creamos un nuevo estado
                ...this.data,  // Conserva el estado anterior
                ...getUser,    // Añade la propiedad 'id' al nivel superior
                email          // Añade el email que acabamos de autenticar
            };
            this.setState(newState); // Y seteamos el nuevo estado
            return getUser.id // Y por ultimo retornamos el id
        } else { // En caso de que el usuario no exista
            return null // Retornamos null
        }
    },
    async setSignUp(email: string, name: string): Promise<string | null> { // Creamos un metodo que nos permitira crear un nuevo usuario en la database
        const res = await fetch(API_BASE_URL + '/signup', { // Hacemos el fetch con POST 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Pasamos los headers
            body: JSON.stringify({ 
                email: email, // El email
                name: name // Y el nombre en string
            }) 
        })

        if(res.ok){ // Si la respuesta tiene una propiedad ok
            const newUser = await res.json(); // Esperamos la respuesta del servidor en json
            const newState = { // Creamos un nuevo estado
                ...this.data,  // Conserva el estado anterior
                ...newUser,    // Añade la propiedad 'id' al nivel superior
                email,          // Añade el email que acabamos de registrar
                name            // Y el nombre que acabamos de registrar
            };
            this.setState(newState); // Y seteamos el nuevo estado
            return newUser.id // Y por ultimo retornamos el id
        } else { // En caso de que el usuario no exista
            // Caso B: Fallo del Registro (posiblemente usuario ya existe)
            if(res.status === 400){ 
                const errorData = await res.json();
                
                if(errorData.message === "user already exists"){
                    // ✅ CORRECCIÓN: Si ya existe, intentamos el login de inmediato
                    // y usamos AWAIT para obtener el ID.
                    return await this.setAuth(email); 
                }
            }
            // Si no es un error "usuario ya existe" (ej. un 500 u otro 400),
            // o si el login implícito falla, devolvemos null y el catch del submit se activa.
            return null;
        }
    },
    async createRoom(userId: string): Promise<string> { // Creamos ahora un metodo que nos permite crear una nueva room, esta recibe un UserId
        const res = await fetch(API_BASE_URL + '/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        if (!res.ok) {
            throw new Error("Error al crear la sala: el servidor devolvió un status " + res.status);
        }
        
        // Asumimos que la creación es exitosa (200 OK)
        const data = await res.json();
        return data.id; // Retorna el ID corto
    },
    async joinRoom(userId: string, roomId: string){ // Ahora creamos nuestro metodo de joinRoom que nos permitira entrar a una room
        const getRoom = fetch(`${API_BASE_URL}/rooms/${roomId}?userId=${userId}`); // Creamos nuestro fetch en la url correspondiente

        const res = await getRoom; // Hacemos el await del fetch

        if (!res.ok) {
            throw new Error("Error al crear la sala: el servidor devolvió un status " + res.status);
        }

        const data = await res.json(); // Hacemos el await del json en la respuesta

        return data.rtdbRoomId; // Y devolvemos el id de la rtdb 
    },
    async sendMessage(message: string){ // Creamos nuestro metodo de envio de mensajes
        const {userId, roomId} = this.data as any; // Obtenemos el userId y la roomId de la data

        const url = `${API_BASE_URL}/rooms/${roomId}/messages`; // Creamos el endpoint

        const res = await fetch(url, { // Hacemos el fetch
            method: 'POST', // Le damos el metodo POST
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ // Y pasamos el body en string
                userId, // Con el userId
                message // Y el message
            })
        })

        // Si la respuesta no tiene un ok
        if (!res.ok) {
            throw new Error("Error al enviar mensaje: el servidor devolvió un status " + res.status); // Enviamos un error
        }
    }, 
    async getName(userId: string){ // Creamos el metodo que nos permitira obtener nombres directamente con ids. Esta recibe un array de strings
        const { namesCache } = this.data as any; // Obtenemos el objeto namesCache de la data

        // Si el userId existe en namesCache
        if(namesCache[userId]){
            return namesCache[userId]; // Devolvemos el valor del userId (Es decir, el nombre)
        }

        // Hacemos el fetch al endpoint
        const res = await fetch(`${API_BASE_URL}/users/${userId}`);

        if (!res.ok) {
            // Si el usuario no existe o hay error, devolvemos un placeholder
            return "Usuario desconocido"; 
        }

        const userData = await res.json(); // Si existe, esperamos la respuesta en json
        const name = userData.name || "Sin nombre"; // Establecemos a name como el nombre obtenido o "Sin nombre"

        // Seteamos el nuevo estado con
        this.setState({
            ...this.data, // La data actual
            namesCache: { // Y en namesCache
                ...namesCache, // El cache actual
                [userId]: name // Con el nuevo nombre en el cache
            }
        });

        return name; // Devolvemos el nombre
    }
}

export {state}