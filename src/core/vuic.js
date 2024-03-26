// src/core/vuic.js
const config = require('./config');
import EventEmitter from './EventEmitter';

class Vuic extends EventEmitter {
    constructor(key) {
        super();
        console.log('--[VUIC]-- constructor (v1)');
        if (!key) {
            console.log('A client_key must be provided');
            throw new Error('A client_key must be provided');
        }
        this.key = key;
        console.log('--[VUIC]-- Registered KEY:', key);
        this.functionSignatures = [];
        console.log('--[VUIC]-- Registered function Signatures:', this.functionSignatures);
        this.functionReferences = {};
        console.log('--[VUIC]-- Registered function References:', this.functionReferences);
    }

    registerFunctions(functionSignatures, functionReferences) {
        console.log('--[VUIC]-- registerFunctions');
        this.functionSignatures = functionSignatures;
        this.functionReferences = functionReferences;
    }

    startVoiceRecording = async () => {
        console.log('--[VUIC]-- startVoiceRecording');
        this.emit(EventEmitter.STATE_CHANGE, EventEmitter.RECORDING);

        if (!window.MediaRecorder) {
            console.error('MediaRecorder is not supported by this browser.');
            this.emit(EventEmitter.STATE_CHANGE, EventEmitter.IDLE);

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
                this.emit(EventEmitter.STATE_CHANGE, EventEmitter.PROCESSING);
                const audioBlob = new Blob(audioChunks, { type: mimeType });
                await this._processVoiceCommand(audioBlob);
                // Stop all tracks in the stream to turn off the microphone
                stream.getTracks().forEach((track) => track.stop());
                this.emit(EventEmitter.STATE_CHANGE, EventEmitter.IDLE);

                resolveRecordingPromise();
            };

            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), 3000);
        } catch (err) {
            console.error('Error getting media stream:', err);
            // If an error occurs, stop all tracks in the stream
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            resolveRecordingPromise();
        }

        return recordingPromise;
    };

    _processVoiceCommand = async (audioBlob) => {
        console.log('--[VUIC]-- _processVoiceCommand');
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append(
            'functionsSignatures',
            JSON.stringify(this.functionSignatures),
        );

        await fetch(`${config.vuicBaseURL}/processor/run`, {
            method: 'POST',
            headers: {
                'x-api-key': this.key,
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => this._handleProcessedVoiceCommandResponse(data))
            .catch((error) => console.error('Error:', error));
    };

    _handleProcessedVoiceCommandResponse = (response) => {
        console.log('--[VUIC]-- _handleProcessedVoiceCommandResponse');
        console.log('@ RAW RESPONSE:', response);

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
        }

        if (message.tool_calls) {
            this._executeFunctions(message);
        } else if (message.content !== null) {
            this._executeTextReply(message.content);
        } else {
            console.error('Response does not match expected formats:', response);
        }
    };

    _executeAudioReply = (audioFileUrl) => {
        // Check if the browser supports the Audio API
        if (!window.Audio) {
            console.error('This browser does not support the Audio API');
            return;
        }

        const audio = new Audio(audioFileUrl);
        // Emit AUDIO_START state when the audio starts
        audio.onplay = () => {
            this.emit(EventEmitter.STATE_CHANGE, EventEmitter.AUDIO_START);
        };
        // Emit AUDIO_END state when the audio ends
        audio.onended = () => {
            this.emit(EventEmitter.STATE_CHANGE, EventEmitter.AUDIO_END);
        };
        // Handle errors when loading the audio file
        audio.onerror = function () {
            console.error('An error occurred while trying to load the audio file:', audioFileUrl);
        };

        // Handle errors when trying to play the audio
        audio.play().catch(function (error) {
            console.error('An error occurred while trying to play the audio:', error);
        });
    };

    _executeFunctions = (message) => {
        console.log('--[VUIC]-- _executeFunctions');

        if (!message || !message.tool_calls) {
            console.error('Invalid message format:', message);
            return;
        }

        message.tool_calls.forEach((toolCall) => {
            if (!toolCall.function || !toolCall.function.name) {
                console.error('Invalid tool call format:', toolCall);
                return;
            }

            const functionName = toolCall.function.name;
            const functionToCall = this.functionReferences[functionName];

            if (!functionToCall) {
                console.error('No function found for name:', functionName);
                return;
            }

            let functionArgs = {};
            try {
                functionArgs = JSON.parse(toolCall.function.arguments);
            } catch (error) {
                console.error('Failed to parse function arguments:', error);
                return;
            }

            const functionArgsArray = Object.values(functionArgs);
            try {
                functionToCall(...functionArgsArray);
            } catch (error) {
                console.error(`Error executing function ${functionName}:`, error);
            }
        });
    };

    _executeTextReply = (content) => {
        console.log('YOW:', content);
    };

    static init(key) {
        return new Vuic(key);
    }
}

export default Vuic;
