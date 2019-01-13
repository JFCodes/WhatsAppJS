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
    const placeholderElementSelector = Selectors.CONVERSATION_PLACEHOLDER_ELEMENT
    const messageResultSelector = Selectors.CONVERSATION_MESSAGE_RESULTS_ELEMENT
    const titleSelector = Selectors.CONVERSATION_TARGET_ELEMENT

    const targetXPath = await page.evaluate((containerSelector, placeholderElementSelector, messageResultSelector, titleSelector, targetString) => {
        const _getXPath = (element) => { 
            const idx = (sib, name) => sib ? idx(sib.previousElementSibling, name || sib.localName) + (sib.localName == name) : 1;
            const segs = elm => !elm || elm.nodeType !== 1 ? [''] : elm.id && document.querySelector(`#${elm.id}`) === elm ? [`id("${elm.id}")`] : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm, undefined)}]`];
            return segs(element).join('/');
        }
        const sanityze = (value) => {
            // Remove spaces and lowerCase the string
            return value.replace(/ /g, '').toLowerCase()
        }
        let xPath = ''
        targetString = sanityze(targetString)
        const  container = document.querySelector(containerSelector)
        for(let element of container.children) {
            // This eliminates placeholders 'CHATS' and 'MESSAGES' elements
            if(element.querySelector(placeholderElementSelector) !== null) continue
            // This eliminates 'MESSAGES' search results
            if(element.querySelector(messageResultSelector) !== null) continue
            // We are left with results for chat elements
            const titleSpanElement = element.querySelector(titleSelector)
            if (!titleSpanElement) continue
            const checkAgaints = sanityze(titleSpanElement.innerText)
            if (checkAgaints === targetString) {
                // Remember our target element is the child of the conversarion container
                // not the span element with the conversation target
                xPath = _getXPath(element)
                return Promise.resolve(xPath)
            }
        }
        // Return empty xPath since no element matched the target
        return Promise.resolve(xPath)
    }, containerSelector, placeholderElementSelector, messageResultSelector, titleSelector, targetString)

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
