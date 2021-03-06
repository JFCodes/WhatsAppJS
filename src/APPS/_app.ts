interface AppOptions {
    id: string
}

abstract class App {
    id: string

    constructor (options: AppOptions) {
        this.id = options.id
    }

    abstract execute(command: string, options: Array<string>): Promise<string>
}

export default App
