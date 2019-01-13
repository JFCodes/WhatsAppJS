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
        // Here, we are now loged and able to send messages
        console.log('will send message')
        await WAJS.sendMessage({ target: 'Bernardo', message: 'testing...' })

        // You need to stop the class to kill puppeeter and end the process.
        // Otherwise, Node keeps running. Place it accordingly in your code.
        // If you want to leave it running to handle onMessage events,
        // do not use WAJS.stop().
        // WAJS.stop()
    })

    // We can also set what to do when a message is received:
    // TODO: this is not working yet 
    WAJS.onMessage((message) => {
        console.log('HEY, I RECEIVED A MESSAGE!!!')
    })

    // Wait for puppeteer to kick in.
    // This is contained on a initiate method so the user can control when to kick in
    // since launching puppeeter can take a while.
    await WAJS.initiate()
    // Also takes a while. This navigates and grabs the QRCode.
    // You can fetch the image file from ./src/temp/qrcode.png after .getQrCode is resolved
    await WAJS.getQrCode({})
    // getQrCode also returns the base64 string containing the QRCode if you want to use it:
    // const QRCodeImageString = await WAJS.getQrCode()
    
    // After getting the QRCode the user must read it with their phone.
    // When a successful login is detected, the callback on onLogin, kicks in.
}

run()
