import { Page } from "puppeteer";
import { Selectors } from '../_constans'
import _getXPath from '../_getXPath'

/**
 * Finding and clicking the converstation div from the left side converstaion listing.
 * 1. Navigate and find the conversation container containing a title with text equal to the target.
 * 2. Generate its XPath.
 * 3. Click it.
 * Error out if
 *  - no matching conversation.
 *  - Found conversation but could not generate XPath (should not happen)
 *  - Generated XPath but puppeeter could not find element using it (should not happen) 
 * @param page 
 * @param targetString 
 */
export default async function clickConversarion (page: Page, targetString: string): Promise<boolean> {
    const containerSelector = Selectors.CONVERSATIONS_PARENT_CLASS
    const titleSelector = Selectors.CONVERSATION_TARGET_ELEMENT

    const targetXPath = await page.evaluate((containerSelector, titleSelector, targetString) => {
        const _getXPath = (element) => { 
            const idx = (sib, name) => sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
            const segs = elm => !elm || elm.nodeType !== 1 ? [''] : elm.id && document.querySelector(`#${elm.id}`) === elm ? [`id("${elm.id}")`] : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm, undefined)}]`];
            return segs(element).join('/');
        }
        let xPath = ''
        const  container = document.querySelector(containerSelector)
        for(let element of container.children) {
            const titleSpanElement = element.querySelector(titleSelector)
            if (!titleSpanElement) continue
            const spanElement = titleSpanElement.querySelector('span')
            if (spanElement.innerText === targetString) {
                // Remember our target element is the child of the conversarion container
                // not the span element with the conversation target
                xPath = _getXPath(element)
                return Promise.resolve(xPath)
            }
        }
        // Return XPath
        return Promise.resolve(xPath)
    }, containerSelector, titleSelector, targetString)

    // Error out if XPath is empty
    if (targetXPath === '') {
        throw new Error('Could not find target element')
    }
    // Find and click element with retrieved XPath
    const targetElement: any = await page.$x(targetXPath)
    if (targetElement.length > 0) {
        await targetElement[0].click()
        return true
    } else {
        throw new Error('Found target element but xPath is invalid.')
    }
} 
