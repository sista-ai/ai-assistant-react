// src/core/AudioRecorder.ts

import Logger from './Logger';

class AudioRecorder {
    // Stop recording after x seconds as hard limit
    private maxRecordingTime = 7000;
    // Stop recording after x seconds of silence
    private silenceThreshold = 1000;
    private mediaRecorder: MediaRecorder | null = null;
    private stream: MediaStream | null = null;
    private audioChunks: Blob[] = [];
    private resolveRecording:
        | ((value: Blob | PromiseLike<Blob>) => void)
        | null = null;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;

    constructor() {
        this.handleDataAvailable = this.handleDataAvailable.bind(this);
        this.handleStop = this.handleStop.bind(this);
    }

    private async getMediaStream(): Promise<MediaStream> {
        if (!this.stream) {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
            } catch (error) {
                Logger.error('Error getting media stream:', error);
                throw error;
            }
        }
        return this.stream;
    }

    private handleDataAvailable(event: BlobEvent): void {
        if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
        }
    }

    private cleanup(): void {
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.analyser = null;
        this.microphone = null;
        this.mediaRecorder = null;
    }

    private handleStop(): void {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioChunks = [];
        if (this.resolveRecording) {
            this.resolveRecording(audioBlob);
        }
        this.cleanup();
    }

    public async startRecording(): Promise<Blob> {
        const stream = await this.getMediaStream();
        // Try a wide range of MIME types to maximize browser compatibility
        const possibleTypes = [
            'audio/mp4', // Commonly supported in modern browsers
            'audio/ogg; codecs=opus', // Supported in Firefox and Chrome
            'audio/webm; codecs=opus', // Supported in Firefox and Chrome
            'audio/wav', // Universally supported format
            'audio/mpeg', // Common MP3 format
        ];

        let options = { mimeType: 'audio/wav' }; // Changed to 'audio/wav'
        let supportedType = possibleTypes.find((type) =>
            MediaRecorder.isTypeSupported(type),
        );

        if (!supportedType) {
            console.error('No supported audio type found');
            throw new Error('No supported audio type found');
        }

        options.mimeType = supportedType;

        this.mediaRecorder = new MediaRecorder(stream, options);
        this.mediaRecorder.ondataavailable = this.handleDataAvailable;
        this.mediaRecorder.onstop = this.handleStop;
        this.mediaRecorder.start();

        this.setupAudioAnalysis(stream);

        setTimeout(() => {
            if (
                this.mediaRecorder &&
                this.mediaRecorder.state === 'recording'
            ) {
                this.stopRecording();
            }
        }, this.maxRecordingTime);

        return new Promise<Blob>((resolve) => {
            this.resolveRecording = resolve;
        });
    }

    private setupAudioAnalysis(stream: MediaStream) {
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.microphone = this.audioContext.createMediaStreamSource(stream);
        this.microphone.connect(this.analyser);

        if (this.analyser) {
            const bufferLength = this.analyser.fftSize;
            const dataArray = new Uint8Array(bufferLength);
            let silenceStart = performance.now();

            const checkSilence = () => {
                this.analyser?.getByteTimeDomainData(dataArray);
                let sum = 0;

                for (let i = 0; i < bufferLength; i++) {
                    let x = dataArray[i] - 128;
                    sum += x * x;
                }

                let rms = Math.sqrt(sum / bufferLength);

                if (rms < 2) {
                    // Determine threshold based on your needs
                    if (
                        performance.now() - silenceStart >
                        this.silenceThreshold
                    ) {
                        this.stopRecording();
                    }
                } else {
                    silenceStart = performance.now();
                }

                if (
                    this.mediaRecorder &&
                    this.mediaRecorder.state === 'recording'
                ) {
                    requestAnimationFrame(checkSilence);
                }
            };

            checkSilence();
        }
    }

    public stopRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
    }
}

export default AudioRecorder;
