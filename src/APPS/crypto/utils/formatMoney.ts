interface OptionsNumberFormting {
    amount: number
    DECIMAL_COUNT: number
    DECIMAL_SEPARATOR: string
    THOUSANDS_SEPARATOR: string
    TAIL_SYMBOL?: string
}

function GenericFormat (options: OptionsNumberFormting): string {
    const {
        amount,
        DECIMAL_COUNT,
        DECIMAL_SEPARATOR,
        THOUSANDS_SEPARATOR,
        TAIL_SYMBOL
    } = options

    let absolute = Math.abs(options.amount || 0).toFixed(DECIMAL_COUNT)
    let i: string = parseInt(absolute).toString()
    let j: number = (i.length > 3) ? i.length % 3 : 0
    let decimal: number = amount - Number(i)

    const prefix = amount < 0 ? "-" : ""
    const leadingThousands = j ? i.substr(0, j) + THOUSANDS_SEPARATOR : ''
    const numberBody = i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + THOUSANDS_SEPARATOR)
    const decimalTail = DECIMAL_SEPARATOR + Math.abs(decimal).toFixed(DECIMAL_COUNT).slice(2)
    const tail = TAIL_SYMBOL ? ` ${TAIL_SYMBOL}` : ''

    return `${prefix}${leadingThousands}${numberBody}${decimalTail}${tail}`
}

export function formatMoney(amount: number) {
    const DECIMAL_COUNT = 4
    const DECIMAL_SEPARATOR = "."
    const THOUSANDS_SEPARATOR = "  "
    
    return GenericFormat({ amount, DECIMAL_COUNT, DECIMAL_SEPARATOR, THOUSANDS_SEPARATOR, TAIL_SYMBOL: '' })
}
