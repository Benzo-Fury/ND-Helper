import type { Logging } from '@sern/handler'

export class Logger implements Logging {
    info(payload: unknown) {
        console.log(payload)
    }
    warning() {}
    error(err: unknown) {
        console.error(err)
    }
    debug() {}
}