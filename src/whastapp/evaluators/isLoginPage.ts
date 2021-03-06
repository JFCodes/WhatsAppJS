import * as puppeteer from 'puppeteer'
import SELECTORS from '../_selectors'

interface EvaluatorInputs {
    page: puppeteer.Page
}

export default async function (inputs: EvaluatorInputs): Promise<boolean> {
    return inputs.page.evaluate((LOGIN_CHECK) => {
        const checkElement = document.querySelector(LOGIN_CHECK)
        return Promise.resolve(checkElement !== null)
    }, SELECTORS.LOGIN_CHECK)
}
