import Browser from './utils/Browser'
import { WriteToFile } from './utils/FSPromises'
import { exec } from 'child_process'
import SendMessage, { MessageToSend } from './utils/SendMessage'
import * as path from 'path'
// Page functions
import getQrCode from './utils/PageFunctions/getQRCode'
import checkLoggedIn from './utils/PageFunctions/checkLoggedIn'

interface WhatsAppJsOptions {
    headless?: boolean // If the puppetter window will be headless (true means window not vidible)
    devTools?: boolean // If the window is visible, does it open devTools by default. Usefull for development.
}

// Define class defaults
const defaultOptions: WhatsAppJsOptions = {
    headless: true,
    devTools: false,
} 

// Some timing constants
const LOGIN_CHECK_INTERVAL: number = 2000           // Interval to check if user has logged in.
const LOGIN_LOAD_TIME: number = 3000                // Interval to let the login load settle.

class WhatsAppJs {
    browser: Browser                                // The puppetter browser/page instance.
    initiated: boolean                              // If puppetter is initialized, thus this class also is
    loggedIn: boolean                               // If the user is logged in whatsapp web
    baseUrl: string                                 // The base url for whatsapp web
    tempFilePath: string                            // Path to QRCode image file
    onLoginFunction: null | Function                // Callback placeholder for when the login is detected
    onMessageReceivedFunction: null | Function      // Callback placeholder for when a new message is received
    stopListeners: boolean                          // Forces listeners recursive calls to stop

    constructor (options?: WhatsAppJsOptions) {
        options = { ...defaultOptions, ...options } // Merge defaults with user defined options
        this.browser = new Browser({                // Link puppetter object to class property
            headless: options.headless,
            devTools: options.devTools
        })
        this.baseUrl = 'https://web.whatsapp.com/'  // Whatsapp web URL
        this.initiated = false                      // Default initiated to false
        this.tempFilePath = 'src/temp/qrcode.png'   // Default qrcode image relative to module file path
        this.onLoginFunction = null                 // Default onLoginFunction to null. Must be set by user
        this.onMessageReceivedFunction = null       // Default onMessageFunction to null. Must be set by user
        this.stopListeners = true                   // Default to blocking listeners. Will set true on initiate
    }

    /**
     * Initiate WhatAppJS object.
     * This is not triggered on construct so the developer can decide where and when
     * the object is initiated. This launches a pupperter instance so it can take a few moments.
     */
    public async initiate () {
        if (this.initiated) return
        await this.browser.initiate()
        this.initiated = true
    }

    /**
     * Stop Whatsapp.
     * Revert to constructor defaults.
     * Flags listeners to stop and close puppeeter instance
     * The user might pass keepCallbacks as true to perseve the callbacks set on onLogin/onMessage
     */
    public async stop (keepCallbacks?: boolean): Promise<void> {
        this.initiated = false
        this.loggedIn = false
        // keepCallbacks must be explicitly set to true. By default we clear them 
        if (keepCallbacks) {
            this.onLoginFunction = null
            this.onMessageReceivedFunction = null
        }
        this.stopListeners = true
        await this.browser.close()
    }

    /**
     * Goes to the base url target and fetches the QRCode from the browser.page instance.
     * Some conditions apply: must be initiated but not logged in.
     * The user can automatically open the image in a image program with the option openImage set to true.
     * @param options 
     */
    public async getQrCode ({ openImage = false }: { openImage: boolean} ): Promise<string> {
        const isLoggedInError = 'WhatsAppJS is already logged in. Cannot generate QRCode.'
        // Throw error if not initiated or already logged in. 
        if (!this.initiated) throw new Error('WhatsAppJS object is not initiated. Please call .initiate before getting the QRCode')
        if (this.loggedIn) {
            this.callOnLogInFunction()
            throw new Error(isLoggedInError)
        }
        // Wait for browser instance to navigate to target page
        // No internet connection will throw an error here. Throw it to the main thread.
        await this.browser.goTo(this.baseUrl).catch(async (error) => {
            await this.stop()
            throw new Error(error)
        })
        // Check if user is logged in.
        // This should never happen because WhatSApp ties your web session with cookies.
        // Since puppetter does not keep cookies from instance to instance, then will always be logged off
        this.loggedIn = await checkLoggedIn(this.browser.page)
        // If logged in, cannot retrieve QRCode, throw error
        if (this.loggedIn) {
            this.callOnLogInFunction()
            throw new Error(isLoggedInError)
        }
        // Fetch qrCodeString (its a base64 image string)
        let qrCodeString = await getQrCode(this.browser.page)
        // Check if somehow the string is empty or undefined. Should not happen.
        if (qrCodeString === '' || qrCodeString === undefined) {
            throw new Error('An error occured while trying to fetch the QRCode.')
        }
        // Save to temp folder converted to png
        const cleanQrCodeString = qrCodeString.replace(/^data:image\/png;base64,/, "")
        await WriteToFile({ fileName: this.tempFilePath, content: cleanQrCodeString, enconding: 'base64' })
        // If option openImage, use a command to launch it in the user predefined image program
        if (openImage) exec(path.resolve(__dirname, this.tempFilePath.replace('src/', '')))
        // Initiate login listener that triggers when it detects that the user scanned the qrCode
        this.loginListener()
        return qrCodeString
    }

    /**
     * Sends a message using a SendMessage object
     * TODO: maybe make message return true on sucess to ease logic on the thread side?
     * @param message
     */
    public async sendMessage (message: MessageToSend): Promise<void> {
        if (!message.target) throw new Error('Undefined target to send message to.')
        if (!message.message) throw new Error('Undefined message to send.')
        // Create new SendMesasge object and trigger .send()
        const newMessage = new SendMessage({ page: this.browser.page, ...message })
        await newMessage.send().catch((error) => { throw new Error('Failed to send message') })
    }

    /**
     * Sets the callback to when the app detects that the user has read the QRCode
     * @param callback
     */
    public onLogin (callback: Function): void {
        this.onLoginFunction = callback
    }
    
    /**
     * Sets the callback to then the we detect a new message(s)
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
        // Listener stop gate to stop this listener
        if (this.stopListeners) return
        // Check login status
        this.loggedIn = await checkLoggedIn(this.browser.page).catch(() => {
            // FIXME: if an error occurs this listerner will cease. SHould it tho?
            // Maybe just a console.warn and return false to keep the listerner alive...
            throw new Error('Could not check for login')
        })
        // If not logged in, print message saying it will re-check in X seconds and return.
        if (!this.loggedIn) {
            const seconds = LOGIN_CHECK_INTERVAL / 1000
            console.log(`WhatsAppJS: Waiting for user to read QRCode. Rechecking in ${seconds} seconds`)
            setTimeout(() => { this.loginListener() }, LOGIN_CHECK_INTERVAL)
            return
        }
        // The user has read the QRCode and is now logged in. Call the user defined callback
        this.callOnLogInFunction()
    }

    /**
     * A wrapper to control the user defined onLogin callback
     */
    private async callOnLogInFunction (): Promise<void> {
        // If the user has not defined a onLogin callback, we cannot trigger it
        // otherwise do so
        if (!this.onLoginFunction) {
            console.warn('WhatsAppJS: login detected but no onLogin callback is set.')
        } else {
            // Just a save wait to make sure the login page loads properly since the user might be triggering stuff right away
            await this.browser.waitFor(LOGIN_LOAD_TIME)
            this.onLoginFunction()
        }
        // TODO: Initiate on message listener. This runs indefenitly
    }
}

export default WhatsAppJs
