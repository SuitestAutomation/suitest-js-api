export type ReplOptions = {
    cwd?:string,
    repeater?: string|Function,
    watch?: string|Array<string>,
    vars?: {
        [key: string]: any,
    },
    ignored?:string
}
