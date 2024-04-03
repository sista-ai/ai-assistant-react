// src/core/EventEmitter.js
import Logger from './Logger';
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

    emitStateChange(eventName, ...args) {
        Logger.log('--[SISTA]-- emitStateChange: ', eventName, ...args);
        this.emit('stateChange', eventName, ...args);
    }

    static get STATE_IDLE() {
        return 'STATE_IDLE';
    }

    static get STATE_LISTENING_START() {
        return 'STATE_LISTENING_START';
    }

    static get STATE_THINKING_START() {
        return 'STATE_THINKING_START';
    }

    static get STATE_SPEAKING_START() {
        return 'STATE_SPEAKING_START';
    }

}

export default EventEmitter;