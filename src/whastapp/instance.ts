import * as fs from 'fs'
import Bot from '../bot/instance'
import CONFIG from '../config'
import utilSleep from '../utils/sleep'
import utilSaveImage from '../utils/saveImage'
// Base Apps
import App from '../APPS/_app'
import AppCrypto from '../APPS/crypto/app'
// Evaluators
import EvaluatorIsLoginPage from './evaluators/isLoginPage'
import EvaluatorExtrackQrCode from './evaluators/extrackQrCode'
import EvaluatorLastInput from './evaluators/lastInput'
import EvaluatorExtractMessage from './evaluators/extractMessage'
// Actions
import ActionFocusChat from './actions/focusChat'
import ActionSendMessage from './actions/sendMessage'

const open = require('open')
const QR_CODE_FILE_PATH = './src/files/qrcode.png'
const LAST_INPUT_ID_PATH = './src/files/lastId.txt'

class Whatsapp {
    private initialized: boolean
    private bot: Bot
    private login: { done: boolean, image: string }
    private active: boolean
    private lastInputId: string
    private apps: {
        installed: { [index: string]: App }
    }

    constructor () {
        this.initialized = false
        this.bot = new Bot()
        this.login = { done: false, image: '' }
        this.apps = { installed: {} }

        try {
            this.lastInputId = fs.readFileSync(LAST_INPUT_ID_PATH, 'utf-8')
        } catch (e) {
            this.lastInputId = ''
        }
    }

    get loginQrCode(): string {
        return this.login.image
    }

    public async initialize (): Promise<void> {
        if (this.initialized) return

        this.installBaseApps()
        await this.bot.initialize()
        await this.bot.goTo({ url: CONFIG.WAHTSAPP.ROOTURL })
        await this.checkLogin()

        if (CONFIG.WAHTSAPP.PERSIST_SESSION) {
            const recoved = await this.bot.recoverSession()
            if (!recoved) return

            await utilSleep(CONFIG.WAHTSAPP.TIME_PAD.AFTER_SESSION_RECOVER)
            this.checkLogin()
        }
    }

    public installApp (app: App) {
        this.apps.installed[app.id] = app
    }

    public async waitLogin(): Promise<void> {
        while (!this.login.done) {
            await utilSleep(CONFIG.WAHTSAPP.TICKS.LOGIN_CHECK)
            this.checkLogin()
        }

        await utilSleep(CONFIG.WAHTSAPP.TIME_PAD.STANDARD)
        await this.bot.saveSession()
        await ActionFocusChat({ page: this.bot.page })
        await ActionSendMessage({ page: this.bot.page, message: 'Hi! I am online.' })

        this.listen()
        return
    }

    private installBaseApps(): void {
        this.apps.installed[AppCrypto.id] = AppCrypto
    }

    private async checkLogin () {
        const isLoginPage = await EvaluatorIsLoginPage({ page: this.bot.page })
        this.login.done = !isLoginPage

        if (!isLoginPage) {
            try {
                fs.unlinkSync(QR_CODE_FILE_PATH)
            } catch(e) { /* we don't care */ }
            return
        }

        this.login.image = await EvaluatorExtrackQrCode({ page: this.bot.page })
        utilSaveImage(QR_CODE_FILE_PATH, this.login.image)
        return
    }

    public showQrCode(): void {
        try {
            open(QR_CODE_FILE_PATH)
        } catch(e) { /* we don't care */ }
    }

    public async listen() {
        this.active = true
        while (this.active) {
            // Capture the last id
            const lastInputId = await EvaluatorLastInput({ page: this.bot.page })
            console.log({ lastInputId })

            if (this.lastInputId !== lastInputId) {
                this.lastInputId = lastInputId
                fs.writeFileSync(LAST_INPUT_ID_PATH, this.lastInputId)

                // Perform command
                const command = await EvaluatorExtractMessage({ page: this.bot.page, dataId: this.lastInputId })
                this.performCommand(command)
            }

            await utilSleep(CONFIG.WAHTSAPP.TICKS.INPUTS_LISTENER)
        }
    }

    private performCommand(commandString: string) {
        // Command anatomy:
        // [app] [command?] [...args?]
        // Ex: crypto list all coins
        //          app         -> crypto
        //          command     -> list
        //          args        -> [all, coins]
        const commandPieces = commandString.split(' ')
        const app = commandPieces[0]
        if (!this.apps.installed[app]) {
            ActionSendMessage({ page: this.bot.page, message: `Sorry, the app '${app}' is not recognized` })
            return
        }

        const command = commandPieces[1] || ''
        let options
        if (commandPieces.length > 2) {
            commandPieces.shift()
            commandPieces.shift()
            options = commandPieces
        } else {
            options = []
        }

        this.apps.installed[app].execute(command, options).then(output => {
            ActionSendMessage({ page: this.bot.page, message: output })
        })
    }
}

export default Whatsapp
