import * as fs from 'fs'

export const WriteToFile = ({ fileName, content, enconding }: { fileName: string, content: string, enconding: string }): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, content, enconding, (error) => {
            error ? reject(error) : resolve(true)
        })
    })
}

export const ReadFromFile = ({ fileName }: { fileName: string }): Promise<string> => {
    return new Promise( (resolve, reject) => {
        fs.readFile(fileName, 'utf8', (error, contents) => {
            error ? reject(error) : resolve(contents.toString())
        })
    })
}

export const ReadFromFileAsync = ({fileName}) => {
    return fs.readFileSync(fileName, 'utf8');
}
