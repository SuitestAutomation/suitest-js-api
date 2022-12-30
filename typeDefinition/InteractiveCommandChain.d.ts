import { REPLServer } from "repl";

export type ReplOptions = {
    cwd?: string,
    repeater?: string|Function,
    watch?: string|Array<string>,
    ignored?: string,
    vars?: REPLServer["context"],
}
