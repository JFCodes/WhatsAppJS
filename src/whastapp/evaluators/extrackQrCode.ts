import * as puppeteer from 'puppeteer'
import SELECTORS from '../_selectors'

interface EvaluatorInputs {
    page: puppeteer.Page
}

export default async function (inputs: EvaluatorInputs): Promise<string> {
    return inputs.page.evaluate((LOGIN_QRCODE) => {
        const qrCanvas = document.querySelector(LOGIN_QRCODE)
        if (!qrCanvas) return Promise.resolve('')

        const imageSource = qrCanvas.toDataURL()
        return Promise.resolve(imageSource)
    }, SELECTORS.LOGIN_QRCODE)
}
