import { Page } from "puppeteer";
import { Selectors } from './_constans'

export default async function checkLoggedIn (page: Page): Promise<boolean> {
    const imageParentSelector = Selectors.QRCODE_IMG_PARENT_CLASS
    const isQRCodePage = await page.evaluate((imageParentSelector) => {
        console.log(imageParentSelector)
        let elementParentExists = document.querySelector(imageParentSelector) !== null
        return Promise.resolve(elementParentExists)
    }, imageParentSelector)
    return !isQRCodePage
} 
