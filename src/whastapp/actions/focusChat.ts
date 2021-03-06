import * as puppeteer from 'puppeteer'
import CONFIG from '../../config'
import SELECTORS from '../_selectors'

export default async function ({ page }: { page: puppeteer.Page }) {
    await page.type(SELECTORS.SEARCH, CONFIG.WAHTSAPP.TARGET_CHAT)
    await page.waitForTimeout(CONFIG.WAHTSAPP.TIME_PAD.DOM_UPDATE)

    await page.click(SELECTORS.FIRST_CHAT)
    await page.waitForTimeout(CONFIG.WAHTSAPP.TIME_PAD.DOM_UPDATE)
}
