import * as puppeteer from 'puppeteer'
// Message page functions
import clickConversarion from '../utils/PageFunctions/SendMessage/clickConversarion'
import injectMessage from '../utils/PageFunctions/SendMessage/injectMessage'
import pressSend from '../utils/PageFunctions/SendMessage/pressSend'

export interface MessageToSend {
    target: string,
    message: string
}

const PACE_TIMING: number = 1000
const delay = (time) => { return new Promise(resolve => setTimeout(resolve, time))}

interface ConstructorOptions {
    page: puppeteer.Page
    message: string
    target: string
}

class SendMessage {
    private page: puppeteer.Page 
    private message: string
    private target: string

    constructor({ page, message, target }: ConstructorOptions) {
        this.page = page
        this.message = message
        this.target = target
    }

    public async send (): Promise<void> {
        // Click the target to trigger its chat
        // Inject the content on the message textarea
        // Click the send button
        await clickConversarion(this.page, this.target).catch((error) => { throw error })
        await delay(PACE_TIMING)
        await injectMessage(this.page, this.message).catch((error) => { throw error })
        await delay(PACE_TIMING)
        await pressSend(this.page).catch((error) => { throw error })
        await delay(PACE_TIMING)
        console.log(`Your message to ${this.target} was sent.`)
    }
}

export default SendMessage