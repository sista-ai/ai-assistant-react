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

    emitStateChange(eventName, ...args) {
        this.emit('stateChange', eventName, ...args);
    }
  
    
    static get STATE_IDLE() {
        return 'STATE_IDLE';
    }

    static get STATE_RECORDING_START() {
        return 'STATE_RECORDING_START';
    }

    static get STATE_RECORDING_END() {
        return 'STATE_RECORDING_END';
    }

    static get STATE_PROCESSING_START() {
        return 'STATE_PROCESSING_START';
    }

    static get STATE_PROCESSING_END() {
        return 'STATE_PROCESSING_END';
    }

    static get STATE_AUDIO_START() {
        return 'STATE_AUDIO_START';
    }

    static get STATE_AUDIO_END() {
        return 'STATE_AUDIO_END';
    }
}

export default EventEmitter;