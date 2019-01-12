import * as puppeteer from 'puppeteer'

interface BrowserOptions {
    headless: boolean
    devTools: boolean
}

class Browser {
    initiated: boolean
    headless: boolean
    devTools: boolean
    width: number
    height: number
    browser: any
    page: puppeteer.Page | null

    constructor (options: BrowserOptions) {
        this.initiated = false
        this.headless = options.headless
        this.devTools = options.devTools
        this.width = 1800
        this.height = 800
        this.browser = null
        this.page = null
    }

    public async initiate () {
        this.browser = await puppeteer.launch({
            headless: this.headless,
            devtools: this.devTools,
            args: [`--window-size=${this.width},${this.height}`]
        });
        this.page = (await this.browser.pages())[0]
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36')
        await this.page.setViewport({ width: this.width, height: this.height })
        this.initiated = true
    }
    async waitFor (time: number) {
        await this.page.waitFor(time)
    }
    async close () {
        this.browser.close()
    }
    async goTo (url) {
        await this.page.goto(url, {waitUntil: 'networkidle2'})
    }
}

export default Browser
