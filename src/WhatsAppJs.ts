import Browser from './utils/Browser'
import { WriteToFile } from './utils/FSPromises'
import { exec } from 'child_process'
import SendMessage, { MessageToSend } from './utils/SendMessage'
import * as path from 'path'
// Page function
import getQrCode from './utils/PageFunctions/getQRCode'
import checkLoggedIn from './utils/PageFunctions/checkLoggedIn'

interface WhatsAppJsOptions {
    headless?: boolean // If the puppetter window will be headless (true is window not vidible)
    devTools?: boolean // If the window is visible, do we open devTools. This is more for dev porposes
}

const defaultOptions: WhatsAppJsOptions = {
    headless: true,
    devTools: false,
} 

const LOGIN_CHECK_INTERVAL: number = 2000 // 2 seconds
const LOGIN_LOAD_TIME: number = 3000 // 3 seconds

class WhatsAppJs {
    browser: Browser                            // The puppetter browser/page instance
    initiated: boolean                          // If puppetter is initialized, thus this class also is
    loggedIn: boolean                           // If the user is logIn in whatsapp web
    baseUrl: string                             // The base url for whatsapp web
    tempFilePath: string                        // Path to QRCode image file
    onLoginFunction: null | Function            // Callback to when the login is detected
    onMessageReceivedFunction: null | Function  // Callback to when a new message is received
    stopListeners: boolean                      // Makes listeners recursive calls stop

    constructor (options?: WhatsAppJsOptions) {
        // Merge defaults with user defined options
        options = { ...defaultOptions, ...options }
        // Link puppetter object to class property
        this.browser = new Browser({
            headless: options.headless,
            devTools: options.devTools
        })
        this.baseUrl = 'https://web.whatsapp.com/'  // Whatsapp web URL
        this.initiated = false                      // Default initiated to true
        this.tempFilePath = 'src/temp/qrcode.png'   // Default qrcode image relative file path
        this.onLoginFunction = null                 // Default onLoginFunction to null. Must be set by developer
        this.onMessageReceivedFunction = null       // Default onMessageFunction to null. Must be set by developer
        this.stopListeners = false                  // Default to letting listeners be alive and well
    }

    /**
     * Initiate WhatAppJS object.
     * This is not triggered on construct so the developer can decide where and when
     * the object is initiated. This launched a pupperter instance so can take a few moments.
     */
    public async initiate () {
        if (this.initiated) return
        // Initiate Browser instance and set initiate prop to true
        await this.browser.initiate()
        this.initiated = true
    }

    public async stop () {
        this.stopListeners = true
        await this.browser.close()
    }

    /**
     * Goes to the base url target and fetches the QRCode from the browser.page instance.
     * Some conditions apply. Must be initiated but not logged in.
     * The user can automatically open the image in a image program with the option OpenImage set to true.
     * @param options 
     */
    public async getQrCode ({ openImage = false }: { openImage: boolean} ) {
        const isLoggedInError = 'WhatsAppJS is already logged in. Cannot generate QRCode.'
        // Throw error if not initiated or already logged in. 
        if (!this.initiated) throw new Error('WhatsAppJS object is not initiated. Please call .initiate before getting the QRCode')
        if (this.loggedIn) {
            this.callOnLogInFunction()
            throw new Error(isLoggedInError)
        }
        // Wait for browser instance to navigate to target page
        // No internet will throw an error here. Throw it to the main thread.
        await this.browser.goTo(this.baseUrl).catch((error) => {
            this.initiated = false
            throw new Error(error)
        })
        // Check if user is logged in.
        // This should never happen because WhatSApp ties your web session with cookies.
        // Since puppetter does not keep cookies from instance to instance, the will always be logged off
        this.loggedIn = await checkLoggedIn(this.browser.page)
        // If logged in, cannot retrieve QRCode, throw error
        if (this.loggedIn) {
            this.callOnLogInFunction()
            throw new Error(isLoggedInError)
        }
        // Fetch qrCodeString (its a base64 image string)
        let qrCodeString = await getQrCode(this.browser.page)
        // Check if some how the string is empty or undefined. Should not happen.
        if (qrCodeString === '' || qrCodeString === undefined) {
            throw new Error('And error occured while trying to fetch the QRCode.')
        }
        // Save to temp folder converted to png
        qrCodeString = qrCodeString.replace(/^data:image\/png;base64,/, "")
        WriteToFile({ fileName: this.tempFilePath, content: qrCodeString, enconding: 'base64' })
        // If option openImage, use a command to launch it in the user predefined image program
        if (openImage) exec(path.resolve(__dirname, this.tempFilePath.replace('src/', '')))
        // Initiate login listener that triggers when it detects that the user scanned the qrCode
        this.loginListener()
    }

    public async sendMessage (message: MessageToSend) {
        if (!message.target) throw new Error('Undefined target to send message to.')
        if (!message.message) throw new Error('Undefined message to send.')
        const newMessage = new SendMessage({ page: this.browser.page, ...message })
        await newMessage.send().catch((error) => {
            console.log(error)
            throw new Error('Failed to send message')
        })
    }

    /**
     * Sets the callback to when the app detects that the user has read the QRCode
     * @param callback
     */
    public onLogin (callback: Function): void {
        this.onLoginFunction = callback
    }
    
    /**
     * Sets the callback to then the app detects a new message(s)
     * @param callback
     */
    public onMessage (callback: Function): void {
        this.onMessageReceivedFunction = callback
    }

    /**
     * Periodically checks if the user has logged in.
     * If so, iniates messageListner and sets internally values to the new state.
     */
    private async loginListener (): Promise<void> {
        if (this.stopListeners) return
        // Check login status
        this.loggedIn = await checkLoggedIn(this.browser.page).catch(() => {
            throw new Error('Could not check for login')
        })
        // If not logging, print message saying it will re-check in X seconds and return.
        if (!this.loggedIn) {
            const seconds = LOGIN_CHECK_INTERVAL / 1000
            console.log(`WhatsAppJS: not logged in. Rechecking in ${seconds} seconds`)
            setTimeout(() => { this.loginListener() }, LOGIN_CHECK_INTERVAL)
            return
        }
        // The usder has read the QRCode and is now logged in
        this.callOnLogInFunction()
    }
    private async callOnLogInFunction (): Promise<void> {
        // If the user has not defined a onLogin callback, we cannot trigger it
        // otherwise do so
        if (!this.onLoginFunction) {
            console.warn('WhatsAppJS: login detected but no onLogin callback is set.')
        } else {
            // Just a save wait to make sure the login page loads properly
            await this.browser.waitFor(LOGIN_LOAD_TIME)
            this.onLoginFunction()
        }
        // Initiate on message listener. This runs indefenitly
    }
}

export default WhatsAppJs
