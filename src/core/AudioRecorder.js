// src/core/AudioRecorder.js
import Logger from './Logger';
import Recorder from 'recorder-js';
class AudioRecorder {

    startRecording = async () => {

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            Logger.error('Microphone access is required for recording. Please update your browser or enable microphone access.');
            return;
        }

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error) {
            const errorMessages = {
                'NotAllowedError': 'Microphone access was denied. Please allow access to your microphone to start recording.',
                'NotFoundError': 'No microphone was found. Please connect a microphone to start recording.',
                'default': 'An unexpected error occurred: ' + error.message
            };

            const message = errorMessages[error.name] || errorMessages['default'];
            throw new Error(message);
        }

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const recorder = new Recorder(audioContext);
        recorder.init(stream);

        await recorder.start();

        return new Promise((resolve) => {
            setTimeout(() => {
                recorder.stop()
                    .then(({ blob, buffer }) => {
                        stream.getTracks().forEach(track => track.stop());
                        resolve(blob);
                    });
            }, 3500); // Stop recording after 3.5 seconds
        });
    };

}

export default AudioRecorder;