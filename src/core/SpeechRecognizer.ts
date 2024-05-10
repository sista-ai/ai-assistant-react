// src/core/SpeechToText.ts

import Logger from './Logger';

interface SpeechRecognitionEvent {
    results: Array<{
        [index: number]: { transcript: string };
        isFinal: boolean;
    }>;
    resultIndex: number;
    error?: string;
}

interface SpeechRecognitionObject {
    new (): SpeechRecognitionObject;
    prototype: SpeechRecognitionObject;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult?: (event: SpeechRecognitionEvent) => void;
    onerror?: (event: SpeechRecognitionEvent) => void;
    onend?: () => void;
    start: () => void;
    stop: () => void;
}

class SpeechRecognizer {
    private recognition: SpeechRecognitionObject;
    private finalTranscript: string = '';
    private isListening: boolean = false;

    constructor() {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            throw new Error(
                'Speech recognition API not supported in this browser.',
            );
        }
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = navigator.language || 'en-US';

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const result = event.results[i];
                if (result.isFinal) {
                    this.finalTranscript += result[0].transcript.trim();
                }
            }
            Logger.log(`--[SISTA]-- Final result: ${this.finalTranscript}`);
        };

        this.recognition.onerror = (event: SpeechRecognitionEvent) => {
            Logger.error(
                `--[SISTA]-- Speech recognition error: ${event.error}`,
            );
            this.isListening = false;
        };

        this.recognition.onend = () => {
            Logger.log('--[SISTA]-- Speech recognition stopped.');
            this.isListening = false;
        };
    }

    public async startListening(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.recognition.continuous) {
                reject('Recognition is already in progress');
                return;
            }

            this.finalTranscript = '';

            this.recognition.onend = () => {
                Logger.log('--[SISTA]-- Speech recognition service has ended.');
                resolve(this.finalTranscript);
                this.isListening = false;
            };

            this.recognition.onerror = (event: SpeechRecognitionEvent) => {
                Logger.error(
                    `--[SISTA]-- Speech recognition error: ${event.error}`,
                );
                reject(new Error(event.error));
                this.isListening = false;
            };

            this.recognition.start();
            Logger.log('--[SISTA]-- Speech recognition started.');
        });
    }
}

export default SpeechRecognizer;
