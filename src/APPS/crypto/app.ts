import axios from 'axios'
import App from '../_app'
import { formatMoney } from './utils/formatMoney'

enum COMMANDS {
    PRICE = 'price'
}

class App_Crypto extends App {
    constructor () {
        super({ id: 'crypto' })
    }

    public async install() {}

    public async execute (command: string, options: Array<string>): Promise<string> {
        const options_1 = options[0]

        switch (command) {
            case COMMANDS.PRICE:
                if (!options_1) throw `Please provide a symbol in the command. Example: 'crypto price BTCEUR'`
                return this.getSymbolPrice(options_1.toUpperCase())
        }

        throw `Sorry, I do not that command for '${this.id}' :/`
    }

    // COMMANDS
    private getSymbolPrice(symbol: string): Promise<string> {
        const failedMessage = `Sorry. I could not get the price for symbol '${symbol}'`
        return axios
            .get('https://api1.binance.com/api/v3/avgPrice', { params: { symbol }})
            .then((response) => {
                const data = response.data
                if (!data) return failedMessage

                return `Current average price for '${symbol}' is ${formatMoney(response.data.price)} `
            })
            .catch(() => failedMessage)
    }
}

export default new App_Crypto
