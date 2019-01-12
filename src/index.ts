import WhatsAppJs from './WhatsAppJs'

const WAJS = new WhatsAppJs({
    headless: false,
    devTools: false
})

const delay = () => { new Promise(resolve => setTimeout(resolve, 1000))}

const run = async () => {

    WAJS.onLogin(async () => {
        console.log('HEY I AM LOGGED IN!!!')

        // Now we can set the onMessage callback
        WAJS.onMessage(() => {
            console.log('HEY, I RECEIVED A MESSAGE!!!')
        })
        // And send our messages!!!
        await WAJS.sendMessage({ target: 'Bernardo', message: 'Hey, this was a bot!!!' })
        await WAJS.sendMessage({ target: 'Bernardo', message: 'E esta tambem' })
        await WAJS.sendMessage({ target: 'Bernardo', message: 'Isto e brutal!!! lol' })
        await WAJS.sendMessage({ target: 'Bernardo', message: 'Estou a mandar mensagens por codigo automatico hehe' })

        WAJS.stop()
    })

    // Wait for puppeteer to kick in
    await WAJS.initiate()
    // Grab the login QRCode
    await WAJS.getQrCode({ openImage: true })

    // Now I can send and receive messages!!!
    console.log('Will send a message')
}

run()
