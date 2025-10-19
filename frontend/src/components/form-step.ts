export class FormStep extends HTMLElement{
    shadow: ShadowRoot;

    constructor(){
        super();
        this.shadow = this.attachShadow({'mode': 'open'});
    }

    connectedCallback(){
        this.render()
    }

    render(){
        this.shadow.innerHTML = `
        <style>
            :host {
                display: none;
                pointer-events: none;
            }

            :host([active]) {
                display: flex;
                transform: translateY(0);
                pointer-events: auto;
            }
        </style>

        <slot></slot>
        `
    }

    public toggleVisibility(activate: boolean){
        if(activate){
            this.setAttribute('active', '');
        } else{
            this.removeAttribute('active')
        }
    }

    public validate(): boolean{
        // Buscar el primer input, textarea o select proyectado en el slot.
        const inputElement = this.querySelector('input:not([type="button"]), textarea, select') as HTMLInputElement | null;

        if (!inputElement) {
            // Si no hay campos de entrada, se considera válido.
            return true;
        }

        // 1. Usar la API de validación nativa de HTML
        const isValid = inputElement.checkValidity();

        if (!isValid) {
            // 2. Mostrar el mensaje de error nativo (Buena UX)
            inputElement.reportValidity();
            
            // 3. Opcional: Enfocar el campo para que el usuario pueda corregir
            inputElement.focus(); 
        }
        
        return isValid;
    }
}

customElements.define('form-step', FormStep)