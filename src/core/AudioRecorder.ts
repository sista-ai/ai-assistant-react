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

    async test_startRecording(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            reject(new Error('TEST Error starting recording...'));
        });
    }

    async startRecording(): Promise<Blob> {
        Logger.log('F: startRecording');
        try {
            if (
                this.mediaRecorder &&
                this.mediaRecorder.state === 'recording'
            ) {
                Logger.error('Recording is already in progress');
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
                Logger.error('No supported audio type found');
                throw new Error('No supported audio type found');
            }

            options.mimeType = supportedType;
            Logger.log(`Recording audio file format: ${options.mimeType}`);

            this.mediaRecorder = new MediaRecorder(stream, options);
            this.mediaRecorder.ondataavailable = this.handleDataAvailable;
            this.mediaRecorder.onstop = this.handleStop;
            // VIP: It's essential for mobile browsers to set this to 1000ms timeslice. 
            this.mediaRecorder.start(1000);

            this.setupAudioAnalysis(stream);

            setTimeout(() => {
                if (
                    this.mediaRecorder &&
                    this.mediaRecorder.state === 'recording'
                ) {
                    this._stopRecording();
                }
            }, this.maxRecordingTime);

            return new Promise<Blob>((resolve) => {
                this.resolveRecording = resolve;
            });
        } catch (error) {
            Logger.error('AudioRecorder Error starting recording:', error);
            throw new Error('Error starting recording');
        }
    }

    private async getMediaStream(): Promise<MediaStream> {
        Logger.log('F: getMediaStream');
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
        Logger.log('F: handleDataAvailable');
        if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
        }
    }

    private handleStop(): void {
        Logger.log('F: handleStop');
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioChunks = [];
        if (this.resolveRecording) {
            this.resolveRecording(audioBlob);
        }
        this.cleanup();
    }

    private cleanup(): void {
        Logger.log('F: cleanup');
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
        Logger.log('F: setupAudioAnalysis');
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
                        this._stopRecording();
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

    private _stopRecording(): void {
        Logger.log('F: _stopRecording');
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
    }
}

export default AudioRecorder;
