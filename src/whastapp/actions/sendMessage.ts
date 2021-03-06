import * as puppeteer from 'puppeteer'
import CONFIG from '../../config'
import SELECTORS from '../_selectors'

export default async function ({ page, message }: { page: puppeteer.Page, message: string }) {
    await page.type(SELECTORS.TEXT_INPUT, message)
    await page.waitForTimeout(CONFIG.WAHTSAPP.TIME_PAD.DOM_UPDATE)

    // Enter key press
    await page.keyboard.press('Enter')
}
