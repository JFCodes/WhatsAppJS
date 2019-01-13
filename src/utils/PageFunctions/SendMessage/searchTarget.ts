import { Page } from "puppeteer";
import { Selectors } from '../_constans'
import _getXPath from '../_getXPath'

/**
 * Inject target into the contact search input
 * This allows to search all contacts and not only the active conversations list.
 * @param page 
 * @param message 
 */
export default async function searchTarget (page: Page, target: string): Promise<boolean> {
    const inputSearchSelector = Selectors.CONVERSATION_SEARCH_INPUT_ELEMENT
    await page.type(inputSearchSelector, target, { delay: 40 })
    return true
} 
