import * as puppeteer from 'puppeteer'
import SELECTORS from '../_selectors'

interface EvaluatorInputs {
    page: puppeteer.Page,
    dataId: string
}

export default async function (inputs: EvaluatorInputs): Promise<string> {
    return inputs.page.evaluate((dataId, MESSAGE_CONTENT) => {
        const element = document.querySelector(`[data-id='${dataId}']`)
        if (!element) return Promise.resolve('')

        const content = element.querySelector(MESSAGE_CONTENT)
        if (!content) return Promise.resolve('')

        return Promise.resolve(content.textContent)
    }, inputs.dataId, SELECTORS.MESSAGE_CONTENT)
}
