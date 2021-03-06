import * as puppeteer from 'puppeteer'
import SELECTORS from '../_selectors'

interface EvaluatorInputs {
    page: puppeteer.Page
}

export default async function (inputs: EvaluatorInputs): Promise<string> {
    return inputs.page.evaluate((INPUTS) => {
        const messages = document.querySelectorAll(INPUTS)
        if (messages.length === 0) return Promise.resolve('')

        const lastElement = messages[messages.length - 1]
        return Promise.resolve(lastElement.getAttribute('data-id'))
    }, SELECTORS.INPUTS)
}
