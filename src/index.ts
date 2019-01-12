/**
 * A working example of how to use WhatsAppJS class.
 */
import WhatsAppJs from './WhatsAppJs'

// Instaciate your WhatsAppJs object.
// You can set headless and devTools options.
const WAJS = new WhatsAppJs({
    headless: false,
    devTools: false
})

// Containning the code on a function so you can use async/await

const run = async () => {
    
    // The onLogin setter is the most important because it defines what to do
    // after a valid login since we have to wait for the user to read the QRCode.
    WAJS.onLogin(async () => {
        // Here, we are now login and able to send messages

        // And send our messages!!!
        await WAJS.sendMessage({ target: 'Bernardo', message: 'Hey, this was a bot!!!' })
        await WAJS.sendMessage({ target: 'Bernardo', message: 'E esta tambem' })
        await WAJS.sendMessage({ target: 'Bernardo', message: 'Isto e brutal!!! lol' })
        await WAJS.sendMessage({ target: 'Bernardo', message: 'Estou a mandar mensagens por codigo automatico hehe' })

        WAJS.stop()
    })

    // We can also set what to do when a message is received:
    // TODO: this is not working yet 
    WAJS.onMessage((message) => {
        console.log('HEY, I RECEIVED A MESSAGE!!!')
    })

    // Wait for puppeteer to kick in.
    // This is contained on a initiate methods so the user can control when to kick in
    // since launching puppeeter can take a while.
    await WAJS.initiate()
    // Also takes a while. This navigates and grabs the QRCode.
    // You can fetch the image file from ./src/temp/qrcode.png after .getQrCode is resolved
    await WAJS.getQrCode({ openImage: true })

    // After getting the QRCode the user must read it with their phone.
    // When a successful login is detected, the callback on onLogin, kicks in.
}

run()
