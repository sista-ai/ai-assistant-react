// src/core/EventEmitter.ts

import Logger from './Logger';

type Listener = (...args: any[]) => void;

class EventEmitter {
    private events: { [eventName: string]: Listener[] } = {};

    on(eventName: string, listener: Listener): void {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
    }

    off(eventName: string, listener: Listener): void {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter(
            (l) => l !== listener,
        );
    }

    emit(eventName: string, ...args: any[]): void {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach((listener) => listener(...args));
    }

    emitStateChange(eventName: string, ...args: any[]): void {
        Logger.log('--[SISTA]-- emitStateChange: ', eventName, ...args);
        this.emit('stateChange', eventName, ...args);
    }

    static get STATE_IDLE(): string {
        return 'STATE_IDLE';
    }

    static get STATE_LISTENING_START(): string {
        return 'STATE_LISTENING_START';
    }

    static get STATE_THINKING_START(): string {
        return 'STATE_THINKING_START';
    }

    static get STATE_SPEAKING_START(): string {
        return 'STATE_SPEAKING_START';
    }
}

export default EventEmitter;