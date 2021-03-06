import * as fs from 'fs'

export default function (path: string, base64: string): void {
    const cleanString = base64.split(';base64,').pop()
    fs.writeFileSync(path, cleanString, { encoding: 'base64'} )
}