class Home extends HTMLElement {
    shadow: ShadowRoot;

    constructor() {
        super();
        // 1. Crear el Shadow Root
        this.shadow = this.attachShadow({ mode: "open" }); // 'open' permite acceder al DOM desde JS externo si es necesario
    }

    connectedCallback() {
        this.render();
    }

    render() {
        // Usamos this.shadowRoot en lugar de this
        this.shadow.innerHTML = ` 
            <div class="home__container">
                <h1>Bienvenido</h1>
                <custom-form>
                    <form-step>
                        <label for="email">Email</label>
                        <input class="form-step__input-text" type="email" autocomplete="off" id="email" name="email" placeholder="someone@example.com" required>
                    </form-step>
                    <form-step>
                        <label for="name">Tu nombre</label>
                        <input class="form-step__input-text" autocomplete="off" id="name" name="name" placeholder="John Doe" required>
                    </form-step>
                    <form-step>
                        <label>Room</label>
                        <div class="form-step__input">
                            <input class="btn" type="button" id="new" value="Room nueva" required>

                            <input type="hidden" name="room_selection" id="room-selection-state" required>

                            <input class="btn" type="button" id="existing" value="Room existente" required>
                            <input class="form-step__input-text" type="text" id="existing-room-field" style="display: none;" placeholder="ID Room" autocomplete="off" required>
                        </div>
                    </form-step>

                    <button class="next">Siguiente</button>
                </custom-form>
            </div>

            <style>
                .home__container {
                    min-height: 100vh;
                    min-width: 100vw;
                    font-family: var(--roboto-font);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: var(--primary-color);
                }

                h1{
                    font-size: var(--title-size);
                    margin: 0;
                    margin: 50px 0;
                }

                custom-form{
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    max-width: 450px;
                    align-items: center;
                    justify-content: center;
                    gap: 50px;
                    flex: 1;
                    padding-bottom: 130px;
                }

                form-step{
                    flex-direction: column;
                    width: 90%;
                    gap: 30px;
                    font-size: 25px;
                }

                .form-step__input-text{
                    border: none;
                    border-bottom: 1px dashed var(--text-secondary);
                    font-size: 20px;
                    padding: 10px 0;
                    background: none;
                    color: var(--text-primary);
                    transition: all .5s ease-in-out;
                }

                .form-step__input-text:focus{
                    outline: none;
                    border-bottom: 1px solid var(--primary-color);
                }

                .form-step__input{
                    display: flex;
                    gap: 10px;
                }

                .form-step__input .btn{
                    flex: 1;
                    background-color: var(--secondary-color);
                    color: var(--text-primary);
                    border: 1px solid var(--primary-color);
                    padding: 20px;
                    border-radius: 2px;
                    font-size: 18px;
                }

                .form-step__input #existing-room-field{
                    flex: 1;
                    min-width: 0;
                    background-color: var(--secondary-color);
                    color: var(--text-on-primary);
                    border: 1px solid var(--primary-color);
                    padding: 20px;
                    border-radius: 2px;
                    font-size: 18px;
                }

                #existing-room-field::placeholder{
                    color: var(--text-primary);
                }

                .form-step__input .btn:hover{
                    cursor: pointer;
                }

                .next{
                    border: none;
                    padding: 15px;
                    border-radius: 5px;
                    width: 90%;
                    font-size: 23px;
                    background-color: var(--primary-color);
                    color: var(--text-primary);
                    transition: all .3s ease-in-out;
                    font-weight: 600;
                }

                .next:hover{
                    background-color: var(--secondary-color);
                    cursor: pointer;
                }
            </style>
        `;
    }
}

customElements.define('home-page', Home);