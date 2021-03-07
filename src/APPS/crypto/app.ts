import App from '../_app'

class App_Crypto extends App {
    constructor () {
        super({
            id: 'crypto'
        })
    }

    async install() {
        console.log('crypto app installation')
    }
    
    async execute (command, options) {
        console.log({ command, options })
        return 'executing command on crypto app'
    }
}

export default new App_Crypto
