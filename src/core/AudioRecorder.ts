// src/core/AudioRecorder.ts

import Logger from './Logger';
import Recorder from 'recorder-js';

interface RecorderResult {
    blob: Blob;
    buffer: ArrayBuffer;
}

interface ErrorMessages {
    [key: string]: string;
}

class AudioRecorder {
    startRecording = async (): Promise<Blob | undefined> => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            Logger.error(
                'Microphone access is required for recording. Please update your browser or enable microphone access.',
            );
            return;
        }

        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (error: unknown) { // Use unknown instead of any
            if (error instanceof Error) { // Type checking
                const errorMessages: ErrorMessages = {
                    NotAllowedError:
                        'Microphone access was denied. Please allow access to your microphone to start recording.',
                    NotFoundError:
                        'No microphone was found. Please connect a microphone to start recording.',
                    default: 'An unexpected error occurred: ' + error.message,
                };

                const message = errorMessages[error.name] || errorMessages['default'];
                throw new Error(message);
            }
            throw error;
        }

        const AudioContext =
            window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        const recorder = new Recorder(audioContext);
        recorder.init(stream);

        await recorder.start();

        return new Promise<Blob>((resolve) => {
            setTimeout(() => {
                recorder.stop().then(({ blob, buffer }: RecorderResult) => {
                    stream.getTracks().forEach((track) => track.stop());
                    resolve(blob);
                });
            }, 3500); // Stop recording after 3.5 seconds
        });
    };
}

export default AudioRecorder;