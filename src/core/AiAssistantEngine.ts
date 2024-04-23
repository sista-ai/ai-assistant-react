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

interface ApiResponse {
    warningMessage?: string;
    statusCode?: number;
    message?: string;
    executableFunctions?: any;
    audioFile?: string;
}

class AiAssistantEngine extends EventEmitter {
    private readonly apiKey: string;
    private readonly apiUrl: string;
    private readonly scrapeContent: boolean;
    private readonly sdkVersion: string;
    private readonly audioPlayer: AudioPlayer;
    private readonly audioRecorder: AudioRecorder;
    private readonly functionExecutor: FunctionExecutor;
    private readonly scraper: Scraper;
    private readonly user: User;
    private readonly pageContent: Record<string, string[]> | null;

    constructor(
        apiKey: string,
        apiUrl: string = config.apiUrl,
        userId: string | null = null,
        scrapeContent: boolean = true,
        debugMode: boolean = false,
    ) {
        super();

        if (!apiKey) {
            throw new Error(
                'Missing API Key for AiAssistantProvider. Get your FREE Key from https://admin.sista.ai/applications',
            );
        }

        Logger.setDebugMode(debugMode);
        this.sdkVersion = pkg.version;
        Logger.log(
            `--[SISTA]-- Initializing AiAssistantEngine Version: ${this.sdkVersion}`,
        );
        this.scrapeContent = scrapeContent;
        this.apiKey = apiKey;
        Logger.log(
            '--[SISTA]-- Using Access Key:',
            '...' + this.apiKey.slice(-8),
        );
        this.apiUrl = apiUrl;
        Logger.log('--[SISTA]-- Using Base URL:', this.apiUrl);

        this.audioPlayer = new AudioPlayer();
        this.audioRecorder = new AudioRecorder();
        this.functionExecutor = new FunctionExecutor();
        this.scraper = new Scraper();
        this.pageContent = this.scrapeContent ? this.scraper.getText() : null;
        this.user = new User(userId);
    }

    registerFunctions(voiceFunctions: VoiceFunction[]): void {
        this.functionExecutor.registerFunctions(voiceFunctions);
    }

    startProcessing = async (): Promise<void> => {
        Logger.log('--[SISTA]-- startProcessing');

        this.emitStateChange(EventEmitter.STATE_LISTENING_START);

        this.audioPlayer.playStartTone();

        let userAudioCommand: Blob | undefined;

        try {
            userAudioCommand = await this.audioRecorder.startRecording();
        } catch (err) {
            Logger.error('Error accessing the microphone:', err);
            this.emitStateChange(EventEmitter.STATE_IDLE);
            return;
        }

        if (userAudioCommand) {
            try {
                await this._makeAPIRequest(userAudioCommand);
            } catch (err) {
                Logger.error('Error making API request:', err);
                this.emitStateChange(EventEmitter.STATE_IDLE);
            }
        }
    };

    private _makeAPIRequest = async (audioBlob: Blob): Promise<void> => {
        Logger.log('--[SISTA]-- _makeAPIRequest');
        this.emitStateChange(EventEmitter.STATE_THINKING_START);

        const formData = new FormData();
        formData.append('sdkVersion', this.sdkVersion);
        formData.append(
            'endUser',
            JSON.stringify(this.user.getEndUserDetails()),
        );
        formData.append('audio', audioBlob);
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

        if (response.warningMessage) {
            Logger.error('API Warning:', response.warningMessage);
            this.emitStateChange(EventEmitter.STATE_IDLE);
            return;
        }

        if (response.statusCode === 401) {
            Logger.error('API Error:', response.message);
            this.emitStateChange(EventEmitter.STATE_IDLE);
            return;
        }

        if (!response.executableFunctions) {
            Logger.error('Invalid response format:', response);
            this.emitStateChange(EventEmitter.STATE_IDLE);
            return;
        }

        const message = response.executableFunctions;

        if (!message) {
            Logger.error('Response does not contain a message:', response);
            this.emitStateChange(EventEmitter.STATE_IDLE);
            return;
        }

        if (response.audioFile) {
            this._handleAudioResponse(response.audioFile);
        } else {
            if (message.functions) {
                this._handleExecutableFunctionsResponse(message);
            }
            if (message.content !== null) {
                this._handleTextResponse(message.content);
            }
        }
    };

    private _handleAudioResponse = (audioFile: string): void => {
        this.emitStateChange(EventEmitter.STATE_SPEAKING_START);
        this.audioPlayer.playAiReply(audioFile, () => {
            Logger.log('--[SISTA]-- Audio reply has finished playing.');
            this.emitStateChange(EventEmitter.STATE_IDLE);
        });
    };

    private _handleExecutableFunctionsResponse = (message: any): void => {
        this.functionExecutor.executeFunctions(message);
        this.emitStateChange(EventEmitter.STATE_IDLE);
        this.audioPlayer.playEndTone();
    };

    private _handleTextResponse = (content: string): void => {
        Logger.log('--[SISTA]-- AI Response As Text:', content);
    };
}

export default AiAssistantEngine;
