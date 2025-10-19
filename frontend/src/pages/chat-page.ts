import { state } from "../state";
import { Router } from '@vaadin/router';

class ChatPage extends HTMLElement{
    constructor(){
        super();
    }

    connectedCallback(){
        this.render();

        const container = document.querySelector('messages-container') as HTMLElement & { _scrollTimer?: number };

        container!.addEventListener('scroll', () => {
            container!.classList.add('show-scrollbar');
            clearTimeout(container!._scrollTimer);
            container!._scrollTimer = setTimeout(() => {
                container!.classList.remove('show-scrollbar');
            }, 300);
        });

        if (container) {
            container.scrollTop = container.scrollHeight; // Mueve el scroll al final
        }

        const sendBtnEl = this.querySelector('#new-message__send') as HTMLButtonElement;
        const messageInput = this.querySelector('#new-message') as HTMLInputElement;

        sendBtnEl.addEventListener('click', async ()=>{
            const message = messageInput.value;

            if(!message) return; // Si no se escribio un mensaje, terminamos la funcion

            try{
                await state.sendMessage(message); 
                messageInput.value = '';

                // Forzamos el scroll hacia abajo
                const container = document.querySelector('messages-container') as HTMLElement;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            } catch (error) {
                // Manejamos el error del envio
                console.error("Error al enviar el mensaje:", error);
                alert("No se pudo enviar el mensaje. Verifica tu API.");
                Router.go('/')
            }
        })
    }

    render(){
        const estado = state.getState() as any;
        const roomId = estado.roomId ? `Room ID: ${estado.roomId}` : "Aun no hay un ID, asegurate de estar registrado"

        this.innerHTML = `
            <div class="chat-container">
                <nav-el>${roomId}</nav-el>
                <messages-container></messages-container>
                <div class="new-message__container">
                    <input id="new-message" placeholder="Escribe tu mensaje" autocomplete="off">
                    <button id="new-message__send">Enviar</button>
                </div>
            </div>

            <style>
                nav-el{
                    width: 100%;
                }

                .chat-container{
                    height: 100vh;
                    font-family: var(--roboto-font);
                    display: flex;
                    width: 90vw;
                    flex-direction: column;
                    align-items: center;
                    margin: 0 auto;
                    color: var(--text-primary);
                }

                @media(min-width: 768px){
                    .chat-container{
                        width: 50vw;
                    }
                }

                messages-container {
                    width: 100%;
                    flex: 1;
                    overflow-y: scroll;
                    margin: 0 auto;
                    display: flex;
                    gap: 10px;
                    padding: 20px 5px;
                    flex-direction: column;
                    scrollbar-width: thin;
                    scrollbar-color: transparent transparent;
                    scrollbar-gutter: stable;
                    transition: scrollbar-color 0.3s ease;
                }

                messages-container.show-scrollbar {
                    scrollbar-color: var(--text-secondary) transparent;
                }

                messages-container::-webkit-scrollbar {
                    width: 8px;
                    background: transparent;
                }

                messages-container::-webkit-scrollbar-thumb {
                    background-color: transparent;
                    border-radius: 4px;
                    transition: background-color 0.3s ease;
                }

                messages-container.show-scrollbar::-webkit-scrollbar-thumb {
                    background-color: var(--text-secondary);
                }

                .new-message__container{
                    width: 100%;
                    display: flex;
                    gap: 5px;
                    padding: 5px;
                }

                #new-message{
                    flex: 1;
                    height: 50px;
                    background-color: rgba(69, 14, 20, 0.3);
                    border: none;
                    border-radius: 2rem;
                    color: white;
                    padding: 10px;
                }

                #new-message::placeholder{
                    color: white;
                }

                #new-message:focus{
                    outline: none;
                }

                #new-message__send{
                    border: none;
                    background-color: var(--primary-color);
                    border-radius: 1.5rem;
                    color: white;
                    cursor: pointer;
                    padding: 10px;
                }
            </style>
        `

        
    }
}

customElements.define('chat-page', ChatPage);