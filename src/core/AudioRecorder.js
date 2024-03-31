// src/core/AudioRecorder.js

import Recorder from 'recorder-js';

class AudioRecorder {

    startRecording = async () => {

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error('getUserMedia is not supported by this browser.');
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

