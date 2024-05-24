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
    private recognition: SpeechRecognitionObject =
        {} as SpeechRecognitionObject;
    private finalTranscript: string = '';
    private isListening: boolean = false;
    private isInitialized: boolean = false;

    private initializeSpeechRecognizer() {
        Logger.log('F: initializeSpeechRecognizer');

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
            Logger.log(`Final result: ${this.finalTranscript}`);
        };

        this.recognition.onerror = (event: SpeechRecognitionEvent) => {
            Logger.error(`Speech recognition error: ${event.error}`);
            this.isListening = false;
        };

        this.recognition.onend = () => {
            Logger.log('Speech recognition stopped.');
            this.isListening = false;
        };

        this.isInitialized = true;
    }

    public async test_startListening(): Promise<string> {
        return new Promise((resolve, reject) => {
            reject(new Error('TEST Error starting listening...'));
        });
    }

    public async startListening(): Promise<string> {
        Logger.log('F: startListening');

        if (!this.isInitialized) {
            this.initializeSpeechRecognizer();
        }

        try {
            return new Promise((resolve, reject) => {
                if (this.recognition.continuous) {
                    Logger.error('Recognition is already in progress');
                    throw new Error('Recognition is already in progress');
                }

                this.finalTranscript = '';

                this.recognition.onend = () => {
                    Logger.log('Speech recognition service has ended.');
                    resolve(this.finalTranscript);
                    this.isListening = false;
                };

                this.recognition.onerror = (event: SpeechRecognitionEvent) => {
                    Logger.error(`Speech recognition error: ${event.error}`);
                    throw new Error(event.error);
                };

                this.recognition.start();
                Logger.log('Speech recognition started.');
            });
        } catch (error) {
            Logger.error('SpeechRecognizer Error starting listening:', error);
            throw new Error('Error starting listening');
        }
    }
}

export default SpeechRecognizer;
