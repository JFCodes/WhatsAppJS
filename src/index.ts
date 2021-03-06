import Whatsapp from './whastapp/instance'

const app = new Whatsapp

const execution = async () => {
    await app.initialize()
    app.showQrCode()
    await app.waitLogin()
}

execution()
