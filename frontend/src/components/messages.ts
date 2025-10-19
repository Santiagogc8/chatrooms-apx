import { state } from "../state";

class MessagesContainer extends HTMLElement{
    constructor(){
        super()
    }

    connectedCallback(){
        const currentState = state.getState()
        this.render(currentState);

        state.suscribe(() => {
            const newState = state.getState();
            // Llama a render de nuevo con la data fresca
            this.render(newState);
        });
    }

    async render(data: any){
        const { userId, messages = [] } = data; // Obtenemos el userId y los mensajes lo establecemos como un array vacio

        // El objeto Set de JavaScript, por definición, solo almacena valores únicos. Cuando le pasamos un array con duplicados, automáticamente los elimina.
        const uniqueUserIds = [...new Set(messages.map((m: any) => m.userId))];

        // 2. Obtener todos los nombres (usando la función que acabamos de crear)
        const namePromises = uniqueUserIds.map((id: any) => state.getName(id));
        await Promise.all(namePromises); // Esperamos a que todos los nombres estén en el cache

        // Renderizamos y usamos el cache para obtener los nombres
        const messagesHTML = messages.map((m: any) => {
            const isOwn = m.userId === userId;
            const className = isOwn ? 'this' : '';
            
            // 💡 Obtenemos el nombre del cache (ya lleno)
            const senderName = isOwn ? 'Tú' : (data.namesCache[m.userId] || 'Desconocido');
            
            return `
                <span class="${className}">${senderName}</span>
                <p class="${className}">${m.message}</p>
            `;
        }).join('') || '';

        this.innerHTML = `
            ${messagesHTML}
            
            <style>
                p{
                    background-color: var(--message-other);
                    display: inline-block;
                    padding: 15px;
                    align-self: start;
                    flex: 1;
                    max-height: fit-content;
                    width: fit-content;
                    max-width: 375px;
                    overflow-wrap: break-word;
                    color: var(--text-primary);
                    border-radius: 8px;
                }

                p.this{
                    background-color: var(--message-own);
                    align-self: end;
                    
                }

                span{
                    font-size: 14px;
                    color: var(--text-secondary)
                }

                span.this{
                    display: none;
                }
            </style>
        `
    }
}

customElements.define('messages-container', MessagesContainer);