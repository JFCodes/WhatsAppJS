import * as puppeteer from 'puppeteer'
// Message page functions
import clickConversarion from '../utils/PageFunctions/SendMessage/clickConversarion'
import injectMessage from '../utils/PageFunctions/SendMessage/injectMessage'
import pressSend from '../utils/PageFunctions/SendMessage/pressSend'

// A message must have a target and a message strings
export interface MessageToSend {
    target: string,
    message: string
}

// Defaults and a delay promise to hold execution
const PACE_TIMING: number = 1000
const delay = (time) => { return new Promise(resolve => setTimeout(resolve, time))}

interface ConstructorOptions {
    page: puppeteer.Page
    message: string
    target: string
}

/**
 * Class to send a new message.
 * Receives .page from WhatsApp class which is a direct pointer to puppeeter.browser.page instance.
 * Coordinates the operations to send a message using pageFunctions
 */
class SendMessage {
    private page: puppeteer.Page    // Pointer to puppeeter.browser.page instance
    private message: string         // The message to send
    private target: string          // The target to send the message to.

    constructor({ page, message, target }: ConstructorOptions) {
        this.page = page
        this.message = message
        this.target = target
    }

    /**
     * Send a message.
     * 1. Find and click the target conversation. Error if not found.
     * 2. Inject the message into the text field. Error if text field not found.
     * 3. Press button to send message. Error if button not found.
     * 4. TODO: confirm message was sent (appears on screen and has 1 or 2 check marks)
     */
    public async send (): Promise<void> {
        await clickConversarion(this.page, this.target).catch((error) => { throw error })
        await delay(PACE_TIMING)
        await injectMessage(this.page, this.message).catch((error) => { throw error })
        await delay(PACE_TIMING)
        await pressSend(this.page).catch((error) => { throw error })
        await delay(PACE_TIMING)
    }
}

export default SendMessage