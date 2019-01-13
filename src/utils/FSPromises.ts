/**
 * Simple utility class to read/write and other ops for fileSystem while making them promise based.
 */
import * as fs from 'fs'

/**
 * Function to promise base write a file to disk
 * Enconding defaults to 'utf8'
 * @param param0 
 */
export const WriteToFile = ({ fileName, content, enconding = 'utf8' }: { fileName: string, content: string, enconding?: string }): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, content, enconding, (error) => {
            error ? reject(error) : resolve(true)
        })
    })
}
/**
 * Function to promised base read a file from disk
 * @param param0 
 */
export const ReadFromFile = ({ fileName }: { fileName: string }): Promise<string> => {
    return new Promise( (resolve, reject) => {
        fs.readFile(fileName, 'utf8', (error, contents) => {
            error ? reject(error) : resolve(contents.toString())
        })
    })
}
/**
 * Function read a file from disk, just to avoid importing 'fs' and just reuse this module
 * @param param0 
 */
export const ReadFromFileAsync = ({fileName}): any => {
    return fs.readFileSync(fileName, 'utf8');
}
