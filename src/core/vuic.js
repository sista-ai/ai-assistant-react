// src/core/vuic.js

import EventEmitter from './EventEmitter';
import pkg from '../../package.json';
import Recorder from 'recorder-js';
import AudioManager from './AudioManager';
const config = require('./config');

class Vuic extends EventEmitter {

    constructor(key, vuicBaseURL = config.vuicBaseURL) {

        console.log(`--[VUIC]-- Initializing VUIC Version: ${pkg.version}`);

        super();


        this.audioManager = new AudioManager();

        if (!key) {
            console.error('Missing API Key for VuicProvider.');
            throw new Error('Missing API Key for VuicProvider. Get your FREE Key from https://admin.sista.ai/applications');
        }

        this.vuicBaseURL = vuicBaseURL;
        console.log('--[VUIC]-- Registered VUIC Base URL:', this.vuicBaseURL);

        this.key = key;
        console.log('--[VUIC]-- Registered KEY:', this.key);

        this.functionSignatures = [];
        this.functionHandlers = new Map();


    }

    // The first step in the voice interaction process is to start recording the user's voice
    // TODO: rename to start executib or something
    startVoiceRecording = async () => {
        console.log('--[VUIC]-- startVoiceRecording');
        this.audioManager._playSound(this.audioManager.startSound);
        this.emitStateChange(EventEmitter.STATE_LISTENING_START);

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


    registerFunctions(voiceFunctions) {
        console.log('--[VUIC]-- registerFunctions');

        // 1) extract the name and handler to build functionHandlersMap
        // 2) edit functionSignatures by removing the handler and adding the type
        voiceFunctions.forEach(({ function: func }) => {
            const { name, handler, ...rest } = func;
            this.functionHandlers.set(Symbol(name), handler);
            this.functionSignatures.push({
                type: "function",
                function: { name, ...rest }
            });
        });

        console.log('--[VUIC]-- Function References:', this.functionHandlers);
        console.log('--[VUIC]-- Function Signatures:', this.functionSignatures);
    }

    _executeFunctions = (message) => {
        console.log('--[VUIC]-- _executeFunctions');

        console.dir(this.functionHandlers, { depth: null });

        if (!this.functionSignatures || this.functionSignatures.length === 0) {
            throw new Error('functionSignatures is empty. Please register your voice activated functions. See docs https://docs.sista.ai');
        }

        if (!this.functionHandlers || this.functionHandlers.size === 0) {
            throw new Error('functionHandlers is empty. Please register your voice activated functions. See docs https://docs.sista.ai');
        }

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
            let functionToCall;

            // Iterate over Map to find the function by its name
            for (let [key, value] of this.functionHandlers.entries()) {
                if (key.description === functionName) {
                    functionToCall = value;
                    break;
                }
            }

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
                console.log(`--[VUIC]-- Calling function ${functionName} with arguments:`, functionArgsArray);
                functionToCall(...functionArgsArray);
            } catch (error) {
                console.error(`Error calling function ${functionName}:`, error);
            }
        });


    };

    _processVoiceCommand = async (audioBlob) => {
        console.log('--[VUIC]-- _processVoiceCommand');

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
            this.audioManager._executeAudioReply(response.audioFile);
        } else {
            // Play the end sound, only when no audio will be returned and just actions to be executed 
            this.audioManager._playSound(this.audioManager.endSound);
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

    _executeTextReply = (content) => {
        console.log('--[VUIC]-- _executeTextReply:', content);
    };

    
    static init(key, vuicBaseURL) {
        return new Vuic(key, vuicBaseURL);
    }
}

export default Vuic;
