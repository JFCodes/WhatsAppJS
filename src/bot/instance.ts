import * as fs from 'fs'
import * as puppeteer from 'puppeteer'
import CONFIG from '../config'

const SESSION_FILE_STORAGE = './src/bot/session/localStorage.json'

class Bot {
    readonly headless: boolean
    readonly devTools: boolean
    readonly width: number
    readonly height: number

    private initialized: boolean
    public browser: puppeteer.Browser
    public page: puppeteer.Page | null

    constructor() {
        this.headless = CONFIG.BOT.HEADLESS
        this.devTools = CONFIG.BOT.DEVTOOLS
        this.width = CONFIG.BOT.WIDTH
        this.height = CONFIG.BOT.HEIGHT
        this.initialized = false
        this.browser = null
        this.page = null
    }

    public async initialize (): Promise<void> {
        if (this.initialized === true) return

        this.browser = await puppeteer.launch({
            headless: this.headless,
            devtools: this.devTools,
            args: [
                `--window-size=${this.width},${this.height}`,
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows'
            ]
        })
        this.page = (await this.browser.pages())[0]

        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36')
        await this.page.setViewport({ width: this.width, height: this.height })

        this.initialized = true
    }

    public goTo ({ url }: { url: string }): Promise<puppeteer.HTTPResponse> {
        if (!this.initialized) throw new Error('Bot instance must be initialized before any navigation command.')

        return this.page.goto(url, { waitUntil: 'networkidle2' })
    }

    public async saveSession(): Promise<void> {
        if (!this.page) return

        const data = await this.page.evaluate(() => {
            const data = {}
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              data[key] = localStorage.getItem(key)
            }

            return Promise.resolve(data)
        })

        fs.writeFileSync(SESSION_FILE_STORAGE, JSON.stringify(data, null, 4))
    }

    public async recoverSession(): Promise<boolean> {
        let storage: null | { [indes: string]: any }
        try {
            storage = JSON.parse(fs.readFileSync(SESSION_FILE_STORAGE, 'utf-8'))
        } catch(e) {
            storage = null
        }

        // No previous cookies or storage items
        if (!storage) return false

        // Recover local storage
        await this.page.evaluate((storage) => {
            Object.keys(storage).forEach((key) => {
                window.localStorage.setItem(key, storage[key])
            })
        }, storage)

        // Reload webs app
        await this.page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
        return true
    }
}

export default Bot

