// src/core/vuic.js

import EventEmitter from './EventEmitter';
import pkg from '../../package.json';
const config = require('./config');
const startProcessingAudioFileUrl = 'https://vuic-assets.s3.us-west-1.amazonaws.com/sdk-assets/audio/start.mp3';
const endProcessingAudioFileUrl = 'https://vuic-assets.s3.us-west-1.amazonaws.com/sdk-assets/audio/end.mp3';

class Vuic extends EventEmitter {
    constructor(key, vuicBaseURL = config.vuicBaseURL) {
        console.log(`--[VUIC]-- Initializing VUIC Version: ${pkg.version}`);
        super();

        if (!key) {
            console.error('Missing API Key for VuicProvider.');
            throw new Error('Missing API Key for VuicProvider. Get your FREE Key from https://admin.sista.ai/applications');
        }

        this.vuicBaseURL = vuicBaseURL;
        console.log('--[VUIC]-- Registered VUIC Base URL:', this.vuicBaseURL);

        this.key = key;
        console.log('--[VUIC]-- Registered KEY:', this.key);

        this.functionSignatures = [];


        this.functionReferences = {};


        try {
            // Preload the start and end sounds
            this.startSound = new Audio(startProcessingAudioFileUrl);
            this.endSound = new Audio(endProcessingAudioFileUrl);
        } catch (error) {
            console.error('Failed to load audio files:', error);
        }
    }

    registerFunctions(functionSignatures, functionReferences) {
        console.log('--[VUIC]-- registerFunctions');

        this.functionSignatures = functionSignatures;
        console.log('--[VUIC]-- Function Signatures:', this.functionSignatures);

        // Convert array to object
        this.functionReferences = functionReferences.reduce((obj, func) => {
            obj[func.name] = func;
            return obj;
        }, {});
        console.log('--[VUIC]-- Function References:', this.functionReferences);
    }

    startVoiceRecording = async () => {
        console.log('--[VUIC]-- startVoiceRecording');

        // Play the start sound
        this.playSound(this.startSound);
        this.emitStateChange(EventEmitter.STATE_LISTENING_START);

        if (!window.MediaRecorder) {
            console.error('MediaRecorder is not supported by this browser.');
            this.emitStateChange(EventEmitter.STATE_IDLE);

            return;
        }

        let stream;
        let resolveRecordingPromise;

        const recordingPromise = new Promise(resolve => {
            resolveRecordingPromise = resolve;
        });

        try {
            const getUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
                ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
                : (constraints) => new Promise((resolve, reject) =>
                    navigator.getUserMedia(constraints, resolve, reject));

            stream = await getUserMedia({ audio: true });

            let mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/wav';
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            const audioChunks = [];

            mediaRecorder.ondataavailable = (event) =>
                audioChunks.push(event.data);

            mediaRecorder.onstop = async () => {
                this.emitStateChange(EventEmitter.STATE_THINKING_START);

                const audioBlob = new Blob(audioChunks, { type: mimeType });

                await this._processVoiceCommand(audioBlob);
                // Stop all tracks in the stream to turn off the microphone
                stream.getTracks().forEach((track) => track.stop());

                this.emitStateChange(EventEmitter.STATE_IDLE);

                resolveRecordingPromise();
            };

            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), 3500);
        } catch (err) {
            console.error('Error getting media stream:', err);
            // If an error occurs, stop all tracks in the stream
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }

            this.emitStateChange(EventEmitter.STATE_IDLE);
            resolveRecordingPromise();
        }

        return recordingPromise;
    };

    _processVoiceCommand = async (audioBlob) => {
        console.log('--[VUIC]-- _processVoiceCommand');

        if (!this.functionSignatures || this.functionSignatures.length === 0) {
            throw new Error('functionSignatures array is empty. Please register your voice activated functions. See docs https://docs.sista.ai`');
        }

        if (!this.functionReferences || Object.keys(this.functionReferences).length === 0) {
            throw new Error('functionReferences array is empty. Please register your voice activated functions. See docs https://docs.sista.ai');
        }

        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append(
            'functionsSignatures',
            JSON.stringify(this.functionSignatures),
        );

        await fetch(`${this.vuicBaseURL}/processor/run`, {
            method: 'POST',
            headers: {
                'x-api-key': this.key,
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                this._handleProcessedVoiceCommandResponse(data);
                this.emitStateChange(EventEmitter.STATE_IDLE);
            })
            .catch((error) => {
                console.error('API Error:', error);
                this.emitStateChange(EventEmitter.STATE_IDLE);
            });
    };

    _handleProcessedVoiceCommandResponse = (response) => {
        console.log('--[VUIC]-- _handleProcessedVoiceCommandResponse');
        console.log('--[VUIC]-- RAW RESPONSE:', response);

        if (!response || !response.executableFunctions) {
            console.error('Invalid response format:', response);
            return;
        }

        const { message } = response.executableFunctions;

        if (!message) {
            console.error('Response does not contain a message:', response);
            return;
        }

        if (response.audioFile) {
            this._executeAudioReply(response.audioFile);
        } else {
            // Play the end sound, only when no audio will be returned and just actions to be executed 
            this.playSound(this.endSound);
        }

        if (message.tool_calls) {
            this._executeFunctions(message);
        } else if (message.content !== null) {
            this._executeTextReply(message.content);
        } else {
            this.emitStateChange(EventEmitter.STATE_IDLE);
            console.error('Response does not match expected formats:', response);
        }
    };

    _executeAudioReply = (aiReplyAudioFileUrl) => {
        // Check if the browser supports the Audio API
        if (!window.Audio) {
            this.emitStateChange(EventEmitter.STATE_IDLE);
            console.error('This browser does not support the Audio API');
            return;
        }

        let audio;
        try {
            audio = this.playSound(new Audio(aiReplyAudioFileUrl), 1.0);
        } catch (error) {
            this.emitStateChange(EventEmitter.STATE_IDLE);
            console.error('Failed to load and play audio file:', error);
            return;
        }

        // Emit AUDIO_START state when the audio starts
        audio.onplay = () => {
            this.emitStateChange(EventEmitter.STATE_SPEAKING_START);
        };
        // Emit AUDIO_END state when the audio ends
        audio.onended = () => {
            this.emitStateChange(EventEmitter.STATE_IDLE);
        };
        // Handle errors when loading the audio file
        audio.onerror = function () {
            this.emitStateChange(EventEmitter.STATE_IDLE);
            console.error('An error occurred while trying to load the audio file:', aiReplyAudioFileUrl);
        };

        // Handle errors when trying to play the audio
        audio.play().catch(function (error) {
            console.error('An error occurred while trying to play the audio:', error);
        });
    };

    _executeFunctions = (message) => {
        console.log('--[VUIC]-- _executeFunctions');

        if (!message || !message.tool_calls) {
            console.error('E1: Invalid API response:', message);
            return;
        }

        message.tool_calls.forEach((toolCall) => {

            if (!toolCall.function || !toolCall.function.name) {
                console.error('E2: Invalid API response:', toolCall);
                return;
            }

            const functionName = toolCall.function.name;
            const functionToCall = this.functionReferences[functionName];

            if (!functionToCall) {
                console.error(`Function '${functionName}' not found. Ensure you've registered the function in 'registerFunctions'. See docs https://docs.sista.ai`);
                return;
            }

            let functionArgs = {};
            try {
                functionArgs = JSON.parse(toolCall.function.arguments);
            } catch (error) {
                console.error('E3: Invalid API response:', error);
                return;
            }

            const functionArgsArray = Object.values(functionArgs);
            try {
                functionToCall(...functionArgsArray);
            } catch (error) {
                console.error(`Error calling function ${functionName}:`, error);
            }
        });
    };

    _executeTextReply = (content) => {
        console.log('--[VUIC]-- _executeTextReply');
        console.log('AI Reply:', content);
    };

    playSound(sound, volume = 0.20) {
        console.log('--[VUIC]-- playSound');

        try {
            sound.volume = volume;
            sound.play();
        } catch (error) {
            console.error('Failed to play sound:', error);
        }

        return sound;
    }

    static init(key, vuicBaseURL) {
        return new Vuic(key, vuicBaseURL);
    }
}

export default Vuic;
