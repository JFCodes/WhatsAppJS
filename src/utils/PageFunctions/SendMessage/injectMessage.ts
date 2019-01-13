import { Page } from "puppeteer";
import { Selectors } from '../_constans'
import _getXPath from '../_getXPath'

/**
 * Inject message into the message input element
 * @param page 
 * @param message 
 */
export default async function injectMessage (page: Page, message: string): Promise<boolean> {
    const textareaSelector = Selectors.CHAT_MESSAGE_FIELD_SELECTOR

    let targetXPath = await page.evaluate((textareaSelector, message) => {
        const _getXPath = (element) => { 
            const idx = (sib, name) => sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
            const segs = elm => !elm || elm.nodeType !== 1 ? [''] : elm.id && document.querySelector(`#${elm.id}`) === elm ? [`id("${elm.id}")`] : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm, undefined)}]`];
            return segs(element).join('/');
        }
        // Find and inject message into div behaving like the text input
        const textareaElement = document.querySelector(textareaSelector)
        if (textareaElement === null) return Promise.resolve(false)
        // Return the div XPath
        return Promise.resolve(_getXPath(textareaElement))
    }, textareaSelector, message)

    // Error out if falsy or empty XPath
    if (!targetXPath || targetXPath === '') {
        throw new Error('Could not inject message into chat field')
    }
    // Find and press backspace on target element
    const targetElement: any[] = await page.$x(targetXPath)
    if (targetElement.length > 0) {
        await targetElement[0].type(message, { delay: 26 })
        return true
    } else {
        throw new Error('Found target element but xPath is invalid.')
    }
} 
