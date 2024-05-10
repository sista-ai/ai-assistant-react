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
import SpeechToText from './SpeechToText';

interface ApiResponse {
    data: {
        inputVoiceCommandAsText?: string;
        outputTextReply?: string;
        outputAudioReply?: string;
        outputExecutableFunctions?: any;
    };
    statusCode: number;
    message: string;
}

enum UserInputMethod {
    AUDIO = 'AUDIO',
    TEXT = 'TEXT',
}

class AiAssistantEngine extends EventEmitter {
    private readonly apiKey: string;
    private readonly apiUrl: string;
    private readonly scrapeContent: boolean;
    private readonly sdkVersion: string;
    private readonly audioPlayer: AudioPlayer;
    private readonly audioRecorder: AudioRecorder;
    private readonly speechToText: SpeechToText;
    private readonly functionExecutor: FunctionExecutor;
    private readonly scraper: Scraper;
    private readonly user: User;
    private readonly pageContent: Record<string, string[]> | null;
    private userInputMethod: UserInputMethod;

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

        // Control the user input method. TEXT = try to convert speech to text using
        // browser's SpeechRecognition API first and fallback to Audio recording if it fails.
        this.userInputMethod = UserInputMethod.TEXT;
        this.sdkVersion = pkg.version;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.scrapeContent = scrapeContent;
        this.user = new User(userId);
        this.speechToText = new SpeechToText();
        this.audioRecorder = new AudioRecorder();
        this.audioPlayer = new AudioPlayer();
        this.functionExecutor = new FunctionExecutor();
        this.scraper = new Scraper();
        this.pageContent = this.scrapeContent ? this.scraper.getText() : null;

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
            inputUserCommand = await this.getUserInput();
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

    private async getUserInput(): Promise<string | Blob> {
        try {
            if (this.userInputMethod === UserInputMethod.AUDIO) {
                return await this.audioRecorder.startRecording();
            } else if (this.userInputMethod === UserInputMethod.TEXT) {
                return await this.speechToText.convertSpeechToText();
            } else {
                throw new Error('Invalid user input method!');
            }
        } catch (err) {
            Logger.error('Error getting user input, switching method:', err);
            this.userInputMethod =
                this.userInputMethod === UserInputMethod.AUDIO
                    ? UserInputMethod.TEXT
                    : UserInputMethod.AUDIO;
            Logger.log(
                `--[SISTA]-- FALLBACK: Switchig "User Input Method" To = ${this.userInputMethod}`,
            );
            return this.getUserInput();
        }
    }

    private _makeAPIRequest = async (
        userInput: Blob | string,
    ): Promise<void> => {
        Logger.log('--[SISTA]-- _makeAPIRequest');
        this.emitStateChange(EventEmitter.STATE_THINKING_START);

        const formData = new FormData();

        if (this.userInputMethod === UserInputMethod.AUDIO) {
            formData.append('userInputAsAudio', userInput as Blob);
        } else if (this.userInputMethod === UserInputMethod.TEXT) {
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

            this._handleApiResponse(data);
        } catch (error) {
            Logger.error('Error Calling Sista API:', error);
            this.emitStateChange(EventEmitter.STATE_IDLE);
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
        // Handle audio response if available
        if (response.data.outputAudioReply) {
            this._handleAudioResponse(response.data.outputAudioReply);
        }
    };

    private _handleAudioResponse = (audioFile: string): void => {
        this.emitStateChange(EventEmitter.STATE_SPEAKING_START);
        this.audioPlayer.playAiReply(audioFile, () => {
            Logger.log('--[SISTA]-- Audio reply has finished playing.');
            this.emitStateChange(EventEmitter.STATE_IDLE);
        });
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
