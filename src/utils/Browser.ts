import * as puppeteer from 'puppeteer'

interface BrowserOptions {
    headless: boolean
    devTools: boolean
}

/**
 * A Class to wrapp the puppeeter instance so we can abstract it on WhatsAppJS class.
 * Note that we don't wrap the page.evaluate and other page methods used in the utils/PageFunctions.
 * They are case specific and very simple to be worth abstracting them here. Those functions
 * receive the .page pointer and operate directly over it.
 * Two paths apply:
 * WhatsAppJS.page -> passes .page to a page function
 * WhasAppJS.page -> passes to sendMessage.page -> passes .page to a page function
 */
class Browser {
    initiated: boolean              // The puppeeter instance is initiated
    headless: boolean               // Run on headless mode
    devTools: boolean               // Open devTools (if headless is false)
    width: number                   // Window width (if headless is false)
    height: number                  // Window height (if headless is false)
    browser: any                    // The Browser instance
    page: puppeteer.Page | null     // A pointer to the Browser.page for direct access

    constructor (options: BrowserOptions) {
        this.initiated = false
        this.headless = options.headless
        this.devTools = options.devTools
        this.width = 1000
        this.height = 1000
        this.browser = null
        this.page = null
    }

    /**
     * Initiate the puppeeter instance and link browser and page objects
     */
    public async initiate () {
        // Set browser options
        this.browser = await puppeteer.launch({
            headless: this.headless,
            devtools: this.devTools,
            args: [`--window-size=${this.width},${this.height}`]
        })
        // Access browser pages and retrieve the first. Is the only one we need.
        this.page = (await this.browser.pages())[0]
        // Set user agent and view port size
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36')
        await this.page.setViewport({ width: this.width, height: this.height })
        this.initiated = true
    }
    /**
     * Make page wait for a time period
     * @param time
     */
    async waitFor (time: number) {
        await this.page.waitFor(time)
    }
    /**
     * Close the browser instance
     */
    async close () {
        this.browser.close()
    }
    /**
     * Go to an url
     * @param url
     */
    async goTo (url) {
        await this.page.goto(url, {waitUntil: 'networkidle2'})
    }
}

export default Browser
