import { Page } from "puppeteer";
import { Selectors } from '../_constans'

/**
 * Presses the send button to send the injected message
 * @param page 
 */
export default async function pressSend (page: Page): Promise<boolean> {
    const sendButtonSelector = Selectors.CHAT_SEND_BUTTON_SELECTOR

    const targetXPath = await page.evaluate((sendButtonSelector) => {
        let xPath = ''
        // TODO: remove this from evaluation script and simply inject it.
        // This is being used in several pageFunctions modules...
        const getXPathForElement = (element) => {
            const idx = (sib, name) => sib 
                ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name)
                : 1;
            const segs = elm => !elm || elm.nodeType !== 1 
                ? ['']
                : elm.id && document.querySelector(`#${elm.id}`) === elm
                    ? [`id("${elm.id}")`]
                    : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm, undefined)}]`];
            return segs(element).join('/');
        }
        // Find button and retrieve its XPath
        const  button = document.querySelector(sendButtonSelector)
        return Promise.resolve(getXPathForElement(button))
    }, sendButtonSelector)

    if (targetXPath === '') {
        throw new Error('Could not find send button element')
    }

    // Find and click target element
    const targetElement: any = await page.$x(targetXPath)
    if (targetElement.length > 0) {
        await targetElement[0].click()
        return true
    } else {
        throw new Error('Found button element but xPath is invalid.')
    }
} 
