import { Page } from "puppeteer";
import { Selectors } from './_constans'

/**
 * Check if user is logged in.
 * Evaluates on page if the image container with the QRCode exists.
 * If exists, returns false -> not logged in.
 * @param page 
 */
export default async function checkLoggedIn (page: Page): Promise<boolean> {
    const imageParentSelector = Selectors.QRCODE_IMG_PARENT_CLASS
    const isQRCodePage = await page.evaluate((imageParentSelector) => {
        let elementParentExists = document.querySelector(imageParentSelector) !== null
        return Promise.resolve(elementParentExists)
    }, imageParentSelector)
    return !isQRCodePage
} 
