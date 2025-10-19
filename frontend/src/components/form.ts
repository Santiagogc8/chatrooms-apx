import './form-step';

import { state } from '../state';
import { Router } from '@vaadin/router';

declare class FormStep extends HTMLElement {
    toggleVisibility(activate: boolean): void;
    validate(): boolean;
}

class Form extends HTMLElement{
    shadow: ShadowRoot;
    steps: Array<FormStep> = []; 
    currentStep: number = 0;
    totalSteps: number = 0;

    constructor(){
        super();
        this.shadow = this.attachShadow({'mode': 'open'});
    }

    connectedCallback(){
        this.render();

        requestAnimationFrame(() => {
            const slot = this.shadow.querySelector('slot');
            if (slot) {
                // Cuando el slot cambie (cuando los form-step sean proyectados), vuelve a buscar
                slot.addEventListener('slotchange', () => {
                    const nodeList = this.querySelectorAll('form-step');
                    this.steps = Array.from(nodeList) as Array<FormStep>;
                    this.totalSteps = this.steps.length

                    if (this.totalSteps > 0) {
                        this.steps[0].toggleVisibility(true); // Mostrar el primer paso
                    }
                });
                // Llama la primera vez
                const nodeList = this.querySelectorAll('form-step');
                this.steps = Array.from(nodeList) as Array<FormStep>;
                this.totalSteps = this.steps.length

                if (this.totalSteps > 0) {
                    this.steps[0].toggleVisibility(true); // Mostrar el primer paso
                }

                const boton = this.querySelector('.next');

                boton?.addEventListener('click', (e)=>{
                    e.preventDefault();
                    this.nextStep()
                });

                const newRoom = this.querySelector('#new') as HTMLElement;
                const existingRoom = this.querySelector('#existing') as HTMLElement;

                newRoom?.addEventListener('click', () => {
                    const stateInput = this.querySelector('#room-selection-state') as HTMLInputElement;

                    if (stateInput) stateInput.value = 'new'; // Establecemos el input en new
                    
                    this.nextStep(); // Pasamos al siguiente paso (redirigir al chat)
                });

                existingRoom?.addEventListener('click', () => {
                    const existingRoomField = this.querySelector('#existing-room-field') as HTMLElement;
                    const stateInput = this.querySelector('#room-selection-state') as HTMLInputElement; // Seleccionar el campo de estado
                    
                    // 🚨 REGISTRAR LA SELECCIÓN
                    if (stateInput) stateInput.value = 'existing';

                    newRoom.style.display = "none";
                    existingRoomField.style.display = "inherit";
                });
            }
        });

        
    }

    render(){
        this.shadow.innerHTML = `
            <slot></slot>
        `
        
    }

    async nextStep(){
        const currentElement = this.steps[this.currentStep];

        if(this.currentStep < this.totalSteps - 1){ 
            if (typeof currentElement.validate === 'function' && !currentElement.validate()) {
                return; 
            }
        }

        console.log("✅ VALIDACIÓN APROBADA en paso", this.currentStep);
        currentElement.toggleVisibility(false);

        if(this.currentStep === 0){
            const email = this.querySelector('#email') as HTMLInputElement;
            const enteredEmail = email.value; // Capturamos el valor

            // Guardar el email en el estado ANTES de hacer la llamada a /auth
            // Esto asegura que 'email' no sea vacío si setAuth falla.
            state.setState({ ...state.getState(), email: enteredEmail });

            const auth = await state.setAuth(enteredEmail); // Usamos el email capturado

            if(auth){
                this.currentStep = 2
            } else {
                this.currentStep++
            }
        } else {
            this.currentStep++
        }

        if (this.currentStep < this.totalSteps){
            console.log(`Paso ${this.currentStep} de ${this.totalSteps} pasos totales`);
            this.steps[this.currentStep].toggleVisibility(true);

            if(this.currentStep === this.totalSteps - 1){
                const boton = this.querySelector('.next');
                boton!.textContent = 'Enviar';
            }
        } else{
            this.submit()
        }
    }

    async submit(){

        try {
            const selectionInput = this.querySelector('#room-selection-state') as HTMLInputElement;
            const roomSelection = selectionInput.value; // 'new' o 'existing'
            const roomIdInput = this.querySelector('#existing-room-field') as HTMLInputElement;
            const roomId = roomIdInput.value; 

            let {userId, email} = state.getState() as any;
            const nameInput = this.querySelector('#name') as HTMLInputElement;
            const nameValue = nameInput.value;

            let rtdbRoomId: string;
            let finalRoomId: string;

            if(!userId){
                userId = await state.setSignUp(email, nameValue);

                if(!userId){
                    throw new Error('El userId es null')
                }
            }

            if(roomSelection === "new"){
                finalRoomId = await state.createRoom(userId); // ID corto (para la URL)
                rtdbRoomId = await state.joinRoom(userId, finalRoomId); // ID largo (para la conexión)
            } else {
                finalRoomId = roomId;
                rtdbRoomId = await state.joinRoom(userId, finalRoomId);
            }

            state.setRoom({ userId, roomId: finalRoomId, rtdbRoomId });

            Router.go(`/chat/${finalRoomId}`);
        }

        catch (error) {
            // 5. MANEJO DE ERRORES: Muestra el error y no congela la app.
            console.error("Hubo un error crítico en la comunicación con la API (setSignUp/Rooms):", error);
            alert("Error al conectar o crear la sala. Revisa la consola para más detalles.");
        }
    }
}

customElements.define('custom-form', Form)