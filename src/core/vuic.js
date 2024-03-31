// src/core/vuic.js

import EventEmitter from './EventEmitter';
import pkg from '../../package.json';
import AudioPlayer from './AudioPlayer';
import AudioRecorder from './AudioRecorder';
import FunctionExecutor from './FunctionExecutor';

const config = require('./config');

// This is the main Processor. The only public inerface.
class Vuic extends EventEmitter {

    constructor(key, apiUrl = config.apiUrl) {

        console.log(`--[VUIC]-- Initializing VUIC Version: ${pkg.version}`);

        super();

        this.audioManager = new AudioPlayer();
        this.audioRecorder = new AudioRecorder();
        this.functionExecutor = new FunctionExecutor();

        if (!key) {
            console.error('Missing API Key for VuicProvider.');
            throw new Error('Missing API Key for VuicProvider. Get your FREE Key from https://admin.sista.ai/applications');
        }

        this.apiUrl = apiUrl;
        console.log('--[VUIC]-- Registered VUIC Base URL:', this.apiUrl);

        this.key = key;
        console.log('--[VUIC]-- Registered KEY:', this.key);
    }


    static init(key, apiUrl) {
        return new Vuic(key, apiUrl);
    }

    /**
     * Registers the given voice activated functions.
     *
     * @param {Object[]} voiceFunctions - An array of voice functions to register.
     */
    registerFunctions(voiceFunctions) {
        this.functionExecutor.registerFunctions(voiceFunctions);
    }

    /**
     * Handle the full voice interaction process from start to finish.
     *
     * @async
     * @throws Will throw an error if there's an issue accessing the microphone.
     */
    startProcessing = async () => {
        console.log('--[VUIC]-- startProcessing');

        this.emitStateChange(EventEmitter.STATE_LISTENING_START);

        this.audioManager.playRecordingTone(this.audioManager.startSound);

        try {
            const userAudioCommand = await this.audioRecorder.startRecording();

            await this._makeAPIRequest(userAudioCommand);
        } catch (err) {
            console.error('Error accessing the microphone:', err);
            this.emitStateChange(EventEmitter.STATE_IDLE);
        }
    };

    _makeAPIRequest = async (audioBlob) => {
        console.log('--[VUIC]-- _makeAPIRequest');
        this.emitStateChange(EventEmitter.STATE_THINKING_START);

        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append(
            'functionsSignatures',
            JSON.stringify(this.functionExecutor.functionSignatures),
        );

        try {
            const response = await fetch(`${this.apiUrl}/processor/run`, {
                method: 'POST',
                headers: {
                    'x-api-key': this.key,
                },
                body: formData,
            });

            const data = await response.json();

            this._handleApiResponse(data);

            this.emitStateChange(EventEmitter.STATE_IDLE);
        } catch (error) {
            console.error('API Error:', error);
            this.emitStateChange(EventEmitter.STATE_IDLE);
        }
    };

    _handleApiResponse = (response) => {
        console.log('--[VUIC]-- _handleApiResponse:', response);

        // Check if the response is valid
        if (!response || !response.executableFunctions) {
            console.error('Invalid response format:', response);
            return;
        }

        const { message } = response.executableFunctions;

        // Check if the message exists
        if (!message) {
            console.error('Response does not contain a message:', response);
            return;
        }

        // Handle audio response if it exists
        if (response.audioFile) {
            this._handleAudioResponse(response.audioFile);
        }

        // Handle executable functions if they exist
        if (message.tool_calls) {
            this._handleExecutableFunctionsResponse(message);
        }

        // If no audio or executable functions, handle text response
        if (message.content !== null) {
            this._handleTextResponse(message.content);
        }
    };

    _handleAudioResponse = (audioFile) => {
        this.audioManager.playAiReply(audioFile);
    };

    _handleExecutableFunctionsResponse = (message) => {
        this.functionExecutor.executeFunctions(message);
    };

    _handleTextResponse = (content) => {
        console.log('--[VUIC]-- AI Response As Text: In Case You Wanna Display This Somewhere:', content);
    };

}

export default Vuic;
