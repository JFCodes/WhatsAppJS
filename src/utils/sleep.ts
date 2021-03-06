export default function (time: number): Promise<void> {
    return new Promise(resolve => {
        return setTimeout(resolve, time)
    })
}
