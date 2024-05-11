// src/core/AiAssistantEngine.ts

import pkg from '../../package.json';
import EventEmitter from './EventEmitter';
import AudioPlayer from './AudioPlayer';
import AudioRecorder from './AudioRecorder';
import FunctionExecutor from './FunctionExecutor';
import Logger from './Logger';
import Scraper from './Scraper';
import config from './config';
import { VoiceFunction } from './commonTypes';
import User from './User';
import SpeechRecognizer from './SpeechRecognizer';

interface ApiResponse {
    data: {
        inputVoiceCommandAsText?: string;
        outputExecutableFunctions?: any;
        outputTextReply?: string;
        outputAudioUrlReply?: string;
        shouldStreamAudioReply?: boolean;
    };
    statusCode: number;
    message: string;
}

enum UserInputMethod {
    AUDIO_RECORDER = 'AUDIO_RECORDER',
    SPEECH_RECOGNIZER = 'SPEECH_RECOGNIZER',
}

class AiAssistantEngine extends EventEmitter {
    private readonly apiKey: string;
    private readonly apiUrl: string;
    private readonly scrapeContent: boolean;
    private readonly sdkVersion: string;
    private readonly audioPlayer: AudioPlayer;
    private readonly audioRecorder: AudioRecorder;
    private readonly speechToText: SpeechRecognizer;
    private readonly functionExecutor: FunctionExecutor;
    private readonly scraper: Scraper;
    private readonly user: User;
    private readonly pageContent: Record<string, string[]> | null;
    private userInputMethod: UserInputMethod;
    private getingtUserInput: boolean;
    private makeingAPIRequest: boolean;

    constructor(
        apiKey: string,
        apiUrl: string = config.apiUrl,
        userId: string | null = null,
        scrapeContent: boolean = true,
        debugMode: boolean = false,
    ) {
        super();
        Logger.setDebugMode(debugMode);

        if (!apiKey) {
            throw new Error(
                'Missing API Key for AiAssistantProvider. Get your FREE Key from https://admin.sista.ai/applications',
            );
        }

        // Control the primary user input method, if one fails it will fallback to the others and retry
        this.userInputMethod = UserInputMethod.SPEECH_RECOGNIZER;
        this.sdkVersion = pkg.version;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.scrapeContent = scrapeContent;
        this.user = new User(userId);
        this.speechToText = new SpeechRecognizer();
        this.audioRecorder = new AudioRecorder();
        this.audioPlayer = new AudioPlayer();
        this.functionExecutor = new FunctionExecutor();
        this.scraper = new Scraper();
        this.pageContent = this.scrapeContent ? this.scraper.getText() : null;
        this.getingtUserInput = false;
        this.makeingAPIRequest = false;
        // Log the custom object
        Logger.log(
            '--[SISTA]-- Initialize Ai Assistant Engine:',
            JSON.stringify(
                {
                    Version: this.sdkVersion,
                    APIKey: '...' + this.apiKey.slice(-8),
                    APIUrl: this.apiUrl,
                    AutoScrapeContent: this.scrapeContent,
                    ConfiguredUserInputMethod: this.userInputMethod,
                    User: this.user,
                },
                null,
                2,
            ),
        );
    }

    registerFunctions(voiceFunctions: VoiceFunction[]): void {
        this.functionExecutor.registerFunctions(voiceFunctions);
    }

    startProcessing = async (): Promise<void> => {
        Logger.log('--[SISTA]-- startProcessing');

        this.emitStateChange(EventEmitter.STATE_LISTENING_START);
        this.audioPlayer.playStartTone();

        let inputUserCommand: string | Blob;

        try {
            inputUserCommand = await this._getUserAudioInput();
            Logger.log(
                `--[SISTA]-- Used "User Input Method" = ${this.userInputMethod}`,
            );
        } catch (err) {
            Logger.error('Error getting user input:', err);
            this.emitStateChange(EventEmitter.STATE_IDLE);
            return;
        }

        if (inputUserCommand) {
            try {
                await this._makeAPIRequest(inputUserCommand);
            } catch (err) {
                Logger.error('Error making API request:', err);
                this.emitStateChange(EventEmitter.STATE_IDLE);
            }
        }
    };

    /**
     * Get the user input.
     * Falls back to alternate method and retries up to 2 times if errors occur.
     */
    private async _getUserAudioInput(retries = 0): Promise<string | Blob> {
        Logger.log('--[SISTA]-- _getUserAudioInput');
        try {
            this.getingtUserInput = true;
            return this.userInputMethod === UserInputMethod.AUDIO_RECORDER
                ? await this.audioRecorder.startRecording()
                : await this.speechToText.startListening();
        } catch (err) {
            this.getingtUserInput = false;
            if (retries >= 2) {
                throw new Error('Failed to get user input after 2 retries');
            }
            Logger.error('Error getting user input, switching method:', err);
            this.userInputMethod =
                this.userInputMethod === UserInputMethod.AUDIO_RECORDER
                    ? UserInputMethod.SPEECH_RECOGNIZER
                    : UserInputMethod.AUDIO_RECORDER;
            Logger.log(
                `--[SISTA]-- FALLBACK: Switching "User Input Method" To = ${this.userInputMethod}`,
            );
            return this._getUserAudioInput(retries + 1);
        }
    }

    private _makeAPIRequest = async (
        userInput: Blob | string,
    ): Promise<void> => {
        this.makeingAPIRequest = true;
        Logger.log('--[SISTA]-- _makeAPIRequest');
        this.emitStateChange(EventEmitter.STATE_THINKING_START);

        const formData = new FormData();

        if (this.userInputMethod === UserInputMethod.AUDIO_RECORDER) {
            formData.append('userInputAsAudio', userInput as Blob);
        } else if (this.userInputMethod === UserInputMethod.SPEECH_RECOGNIZER) {
            formData.append('userInputAsText', userInput as string);
        }

        formData.append('sdkVersion', this.sdkVersion);
        formData.append(
            'endUser',
            JSON.stringify(this.user.getEndUserDetails()),
        );
        formData.append(
            'functionsSignatures',
            JSON.stringify(this.functionExecutor.functionSignatures),
        );
        if (this.scrapeContent) {
            formData.append('pageContent', JSON.stringify(this.pageContent));
        }

        try {
            const response = await fetch(`${this.apiUrl}/processor/run`, {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                },
                body: formData,
            });

            const data: ApiResponse = await response.json();
            this.makeingAPIRequest = false;
            this._handleApiResponse(data);
        } catch (error) {
            Logger.error('Error Calling Sista API:', error);
            this.emitStateChange(EventEmitter.STATE_IDLE);
            this.makeingAPIRequest = false;
        }
    };

    private _handleApiResponse = (response: ApiResponse): void => {
        Logger.log('--[SISTA]-- _handleApiResponse:', response);

        // Handle any kind of HTTP error statuses
        if (response.statusCode >= 400) {
            Logger.error(
                `API Error: Status Code - ${response.statusCode}, Message - ${response.message}`,
            );
            this.emitStateChange(EventEmitter.STATE_IDLE);
            return;
        }

        // ----[ Step 1: Display User Input Command ]----
        // Handle user command as text first. This is useful for debugging
        if (response.data.inputVoiceCommandAsText) {
            this._handleInputVoiceCommandAsText(
                response.data.inputVoiceCommandAsText,
            );
        }

        // ----[ Step 2: Display AI Text Reply ]----
        // Handle text response last
        if (response.data.outputTextReply) {
            this._handleTextResponse(response.data.outputTextReply);
        }

        // ----[ Step 3: Execute Functions ]----
        // Process executable functions if they are present, which have the highest priority
        if (
            response.data.outputExecutableFunctions &&
            response.data.outputExecutableFunctions.length > 0
        ) {
            this._handleExecutableFunctionsResponse(
                response.data.outputExecutableFunctions,
            );
            return; // No need to process further if functions are executed
        }

        // ----[ Step 4: Play AI Audio Reply ]----
        // Handle audio response if available as a Stream
        if (response.data.shouldStreamAudioReply) {
            this._handleAudioStreamResponse(response.data.outputTextReply);

            // Handle audio response if available as a URL to an audio file
        } else if (response.data.outputAudioUrlReply) {
            this._handleAudioUrlResponse(response.data.outputAudioUrlReply);
        } else {
            // If no audio response is available, and no executable functions, means something went wrong
            if (response.data.outputExecutableFunctions.length === 0) {
                throw new Error('AI never responded!');
            }
        }
    };

    private _handleAudioUrlResponse = (audioFile: string): void => {
        this.emitStateChange(EventEmitter.STATE_SPEAKING_START);
        this.audioPlayer.playAiReplyFromUrl(audioFile, () => {
            Logger.log('--[SISTA]-- Audio File reply has finished playing.');

            // Check if getting user input or making API request is in progress and if so do not emit idle state
            if (!this.getingtUserInput || !this.makeingAPIRequest) {
                this.emitStateChange(EventEmitter.STATE_IDLE);
            }
        });
    };

    private _handleAudioStreamResponse = async (
        outputAudioStreamReply: string | undefined,
    ): Promise<void> => {
        Logger.log(
            '--[SISTA]-- _handleAudioStreamResponse:',
            outputAudioStreamReply,
        );

        if (!outputAudioStreamReply) {
            Logger.error('No Audio Text To Convert & Stream!');
            this.emitStateChange(EventEmitter.STATE_IDLE);
            return;
        }

        this.emitStateChange(EventEmitter.STATE_SPEAKING_START);

        try {
            const response = await fetch(
                `${this.apiUrl}/processor/audio-stream`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                    },
                    body: JSON.stringify({
                        textMessage: outputAudioStreamReply,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No reader found in the response');
            }

            const playChunk = (
                result: ReadableStreamReadResult<Uint8Array>,
            ) => {
                const { done, value } = result;

                if (done) {
                    this.emitStateChange(EventEmitter.STATE_IDLE);
                    return;
                }

                // Play the chunk
                this.audioPlayer.playAiReplyFromStream(
                    new ReadableStream({
                        start(controller) {
                            controller.enqueue(value);
                            controller.close();
                        },
                    }),
                    () => {
                        Logger.log(
                            '--[SISTA]-- Audio stream chunk has finished playing.',
                        );
                    },
                );

                // Read the next chunk
                reader.read().then(playChunk);
            };

            reader.read().then(playChunk);
        } catch (error) {
            Logger.error('Error Calling Sista API:', error);
            this.emitStateChange(EventEmitter.STATE_IDLE);
        }
    };

    private _handleExecutableFunctionsResponse = (
        executableFunctions: any,
    ): void => {
        this.functionExecutor.executeFunctions(executableFunctions);
        this.emitStateChange(EventEmitter.STATE_IDLE);
        this.audioPlayer.playEndTone();
    };

    private _handleTextResponse = (content: string): void => {
        Logger.log('--[SISTA]-- AI Response:', content);
    };

    private _handleInputVoiceCommandAsText = (content: string): void => {
        Logger.log('--[SISTA]-- User Command:', content);
    };
}

export default AiAssistantEngine;
