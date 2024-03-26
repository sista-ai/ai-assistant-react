// src/core/EventEmitter.js

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(eventName, listener) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
    }

    off(eventName, listener) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter(l => l !== listener);
    }

    emit(eventName, ...args) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach(listener => listener(...args));
    }

    static get STATE_CHANGE() {
        return 'stateChange';
    }

    static get IDLE() {
        return 'idle';
    }

    static get RECORDING() {
        return 'recording';
    }

    static get PROCESSING() {
        return 'processing';
    }
}

export default EventEmitter;