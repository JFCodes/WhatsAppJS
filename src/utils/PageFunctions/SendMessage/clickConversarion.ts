import { Page } from "puppeteer";
import { Selectors } from '../_constans'

export default async function clickConversarion (page: Page, targetString: string): Promise<boolean> {
    const containerSelector = Selectors.CONVERSATIONS_PARENT_CLASS
    const titleSelector = Selectors.CONVERSATION_TARGET_ELEMENT

    const targetXPath = await page.evaluate((containerSelector, titleSelector, targetString) => {
        let xPath = ''
        const  container = document.querySelector(containerSelector)
        // Thanks to https://stackoverflow.com/questions/2661818/javascript-get-xpath-of-a-node
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
        for(let element of container.children) {
            const titleSpanElement = element.querySelector(titleSelector)
            if (!titleSpanElement) continue
            const spanElement = titleSpanElement.querySelector('span')
            if (spanElement.innerText === targetString) {
                // Remember our target element is the child of the conversarion container
                xPath = getXPathForElement(element)
                return Promise.resolve(xPath)
            }
        }
        return Promise.resolve(xPath)
    }, containerSelector, titleSelector, targetString)

    if (targetXPath === '') {
        throw new Error('Could not find target element')
    }
    const targetElement: any = await page.$x(targetXPath)
    if (targetElement.length > 0) {
        await targetElement[0].click()
        return true
    } else {
        throw new Error('Found target element but xPath is invalid.')
    }
} 
