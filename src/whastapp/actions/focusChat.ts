import * as puppeteer from 'puppeteer'
import CONFIG from '../../config'
import SELECTORS from '../_selectors'

const MAX_ATTEMPS = 10

export default async function ({ page }: { page: puppeteer.Page }) {
    const chatSelection = async (attempts: number = 0) => {
        if (attempts >= MAX_ATTEMPS) throw Error('Unable to focus target chat')

        let clicked = await page
            .click(SELECTORS.FIRST_CHAT)
            .then(() => true)
            .catch(() => false)
        
        await page.waitForTimeout(CONFIG.WAHTSAPP.TIME_PAD.DOM_UPDATE)
        if (clicked) return

        return await chatSelection(attempts + 1)
    }

    await page.type(SELECTORS.SEARCH, CONFIG.WAHTSAPP.TARGET_CHAT)
    await page.waitForTimeout(CONFIG.WAHTSAPP.TIME_PAD.DOM_UPDATE)

    return await chatSelection()
}
