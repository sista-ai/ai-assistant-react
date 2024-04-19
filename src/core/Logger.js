// src/core/Logger.js

class Logger {
    constructor() {
        if (Logger.instance == null) {
            this.debug = false;
            Logger.instance = this;
        }

        return Logger.instance;
    }

    setDebugMode(debug) {
        this.debug = debug;
    }

    log(...args) {
        if (this.debug) {
            console.log(...args);
        }
    }

    error(...args) {
        console.error(...args);
    }
}

const logger = new Logger();

export default logger;