// src/core/vuic.js

import EventEmitter from './EventEmitter';
import pkg from '../../package.json';
import Recorder from 'recorder-js';
import AudioPlayer from './AudioPlayer';
import AudioRecorder from './AudioRecorder';
import FunctionExecutor from './FunctionExecutor';

const config = require('./config');

// This is the main Processor. The only public inerface.
class Vuic extends EventEmitter { // TODO: do not extend 

    constructor(key, vuicBaseURL = config.vuicBaseURL) {

        console.log(`--[VUIC]-- Initializing VUIC Version: ${pkg.version}`);

        super();

        this.audioManager = new AudioPlayer();
        this.audioRecorder = new AudioRecorder();
        this.functionExecutor = new FunctionExecutor();

        if (!key) {
            console.error('Missing API Key for VuicProvider.');
            throw new Error('Missing API Key for VuicProvider. Get your FREE Key from https://admin.sista.ai/applications');
        }

        this.vuicBaseURL = vuicBaseURL;
        console.log('--[VUIC]-- Registered VUIC Base URL:', this.vuicBaseURL);

        this.key = key;
        console.log('--[VUIC]-- Registered KEY:', this.key);
    }

    // The first step in the voice interaction process is to start recording the user's voice
    // TODO: rename to startProcessing
    startVoiceRecording = async () => {
        console.log('--[VUIC]-- startVoiceRecording');

        this.audioManager.playRecordingTone(this.audioManager.startSound);
        this.emitStateChange(EventEmitter.STATE_LISTENING_START);

        // TODO: this audio related stuff should be in the AudioRecorder
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('getUserMedia is not supported by this browser.');
            this.emitStateChange(EventEmitter.STATE_IDLE);
            return;
        }

        let stream = null;
        let recorder = null;

        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            recorder = new Recorder(audioContext);
            recorder.init(stream);

            recorder.start()
                .then(() => {
                    // Consider making the recording duration configurable or adaptive
                    setTimeout(() => {
                        recorder.stop()
                            .then(({ blob, buffer }) => {
                                this.emitStateChange(EventEmitter.STATE_THINKING_START);

                                // Process the audio blob here
                                this._processVoiceCommand(blob);

                                stream.getTracks().forEach(track => track.stop());

                            });
                    }, 3500); // Stop recording after 3.5 seconds
                });
        } catch (err) {
            console.error('Error accessing the microphone:', err);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            this.emitStateChange(EventEmitter.STATE_IDLE);
        }
    };

    // proxy: to register voice functions 
    registerFunctions(voiceFunctions) {
        console.log('sdsdsds');
        this.functionExecutor.registerFunctions(voiceFunctions);
    }

    // TODO this should go in voice command processor
    _processVoiceCommand = async (audioBlob) => {
        console.log('--[VUIC]-- _processVoiceCommand');

        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append(
            'functionsSignatures',
            JSON.stringify(this.functionExecutor.functionSignatures),
        );

        // TODO: this should remain on this class but as its own method for making the API calls. should be named something like _makeAPIRequest
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

    // TODO: this should be renamed to _handle API Response
    _handleProcessedVoiceCommandResponse = (response) => {
        console.log('--[VUIC]-- _handleProcessedVoiceCommandResponse:', response);

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
            this.audioManager.playAiReply(response.audioFile);
        } else {
            // Play the end sound, only when no audio will be returned and just actions to be executed 
            this.audioManager.playRecordingTone(this.audioManager.endSound);
        }

        if (message.tool_calls) {
            this.functionExecutor.executeFunctions(message);
        } else if (message.content !== null) {
            console.log('--[VUIC]-- AI Response As Text: In Case You Wanna Display This Somewhere:', message.content);
        } else {
            this.emitStateChange(EventEmitter.STATE_IDLE);
            console.error('Response does not match expected formats:', response);
        }
    };


    static init(key, vuicBaseURL) {
        return new Vuic(key, vuicBaseURL);
    }
}

export default Vuic;
