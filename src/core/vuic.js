// src/core/vuic.js
const config = require('./config');

class Vuic {
    constructor(key) {
        console.log('--[VUIC]-- constructor');
        if (!key) {
            console.log('A client_key must be provided');
            throw new Error('A client_key must be provided');
        }
        this.key = key;
        this.functionSignatures = [];
        this.functionReferences = {};
    }

    registerFunctions(functionSignatures, functionReferences) {
        console.log('--[VUIC]-- registerFunctions');
        this.functionSignatures = functionSignatures;
        this.functionReferences = functionReferences;
    }

    startVoiceRecording = async () => {
        console.log('--[VUIC]-- startVoiceRecording');
        if (!window.MediaRecorder) {
            console.error('MediaRecorder is not supported by this browser.');
            return;
        }
    
        let stream;
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
                const audioBlob = new Blob(audioChunks, { type: mimeType });
                await this._processVoiceCommand(audioBlob);
                // Stop all tracks in the stream to turn off the microphone
                stream.getTracks().forEach((track) => track.stop());
            };
    
            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), 3000);
        } catch (err) {
            console.error('Error getting media stream:', err);
            // If an error occurs, stop all tracks in the stream
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        }
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
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => this._handleProcessedVoiceCommandResponse(data))
            .catch((error) => console.error('Error:', error));
    };

    _handleProcessedVoiceCommandResponse = (response) => {
        console.log('--[VUIC]-- _handleProcessedVoiceCommandResponse');
        console.log('@ RAW RESPONSE:', response);

        if (response && response.executableFunctions && Array.isArray(response.executableFunctions)) {
            const firstChoice = response.executableFunctions[0];
            if (firstChoice.message && firstChoice.message.tool_calls) {
                this._executeFunctions(firstChoice.message);
            } else if (
                firstChoice.message &&
                firstChoice.message.content !== null
            ) {
                this._executeTextReply(firstChoice.message.content);
            } else {
                console.error(
                    'Response does not match expected formats:',
                    response,
                );
            }
        } else {
            console.error('Invalid response format:', response);
        }
    };

    _executeTextReply = (content) => {
        console.log('YOW:', content);
    };

    _executeFunctions = (message) => {
        console.log('--[VUIC]-- _executeFunctions');
        const toolCalls = message.tool_calls;
        toolCalls.forEach((toolCall) => {
            const functionName = toolCall.function.name;
            const functionToCall = this.functionReferences[functionName];
            if (functionToCall) {
                const functionArgs = JSON.parse(toolCall.function.arguments);
                const functionArgsArray = Object.values(functionArgs);
                functionToCall(...functionArgsArray);
            } else {
                console.error('No function found for name:', functionName);
            }
        });
    };

    static init(key) {
        return new Vuic(key);
    }
}

export default Vuic;
