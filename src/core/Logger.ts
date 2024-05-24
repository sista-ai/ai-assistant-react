// src/core/Logger.ts

type LogArgs = [message?: any, ...optionalParams: any[]];

class Logger {
    private static instance: Logger | null = null;
    private debug: boolean = false;

    private constructor() {
        if (Logger.instance == null) {
            Logger.instance = this;
        }
    }

    static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    setDebugMode(debug: boolean): void {
        this.debug = debug;
    }

    log(...args: LogArgs): void {
        if (this.debug) {
            console.log('--[SISTA]-- ', ...args);
        }
    }

    error(...args: LogArgs): void {
        console.error('--[SISTA]-- ', ...args);
    }
}

const logger = Logger.getInstance();

export default logger;
