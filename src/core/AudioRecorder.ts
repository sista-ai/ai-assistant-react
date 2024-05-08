// src/core/AudioRecorder.ts

import Logger from './Logger';

class AudioRecorder {
    // Stop recording after x seconds as hard limit
    private maxRecordingTime = 10000;
    // Stop recording after x seconds of silence
    private silenceThreshold = 1300;
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

    public async startRecording(): Promise<Blob> {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            console.error('Recording is already in progress');
            throw new Error('Recording is already in progress');
        }

        const stream = await this.getMediaStream();
        const possibleTypes = [
            'audio/mp4',
            'audio/ogg; codecs=opus',
            'audio/webm; codecs=opus',
            'audio/wav',
            'audio/mpeg',
        ];

        let options = { mimeType: 'audio/wav' };
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

    private handleStop(): void {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioChunks = [];
        if (this.resolveRecording) {
            this.resolveRecording(audioBlob);
        }
        this.cleanup();
    }

    private cleanup(): void {
        if (this.mediaRecorder) {
            if (this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
            }
            this.mediaRecorder.ondataavailable = null;
            this.mediaRecorder.onstop = null;
            this.mediaRecorder = null;
        }
        if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
        }
        if (this.audioContext) {
            this.audioContext.close().then(() => {
                this.audioContext = null;
                this.analyser = null;
                this.microphone = null;
            });
        } else {
            this.analyser = null;
            this.microphone = null;
        }
        this.audioChunks = [];

        this.resolveRecording = null;
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
