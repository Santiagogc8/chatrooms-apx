class Navbar extends HTMLElement{
    shadow: ShadowRoot;
    constructor(){
        super()
        this.shadow = this.attachShadow({'mode': 'open'});
    }

    connectedCallback() {
        this.render();
    }

    render(){
        this.shadow.innerHTML = `
            <div>
                <p>${this.textContent || ''}</p>
            </div>

            <style>
                div{
                    width: 100%;
                    min-height: 60px;
                    background-color: var(--secondary-color);
                    border: 2px solid var(--primary-color);
                    border-top: none;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    border-radius: 0 0 5px 5px;
                    justify-content: center;
                }

                p{
                    margin: 0;
                    font-size: clamp(2vw, 1rem, 4vw);
                    font-family: var(--roboto-font);
                    font-weight: 700;
                    margin: 0 10px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-align: center;
                }
            </style>
        `
    }
}

customElements.define('nav-el', Navbar)