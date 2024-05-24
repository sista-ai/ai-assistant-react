// src/core/AudioPlayer.ts

import { Howl } from 'howler';
import config from './config';
import Logger from './Logger';

interface SoundCallback {
    (): void;
}

class AudioPlayer {
    private readonly startSound: Howl;
    private readonly endSound: Howl;

    constructor() {
        // Specify volume at 50% for start and end tones (0.5 = 50%)
        this.startSound = this.initializeSound(config.startSoundFileUrl, 0.5);
        this.endSound = this.initializeSound(config.endSoundFileUrl, 0.5);
    }

    playAiReplyFromStream = (
        audioStream: ReadableStream<Uint8Array>,
        callback?: SoundCallback,
    ): void => {
        Logger.log('F: playAiReplyFromStream');

        const audioContext = new AudioContext();
        const reader = audioStream.getReader();
        let chunks: Uint8Array[] = [];

        reader
            .read()
            .then(function process({
                done,
                value,
            }: ReadableStreamReadResult<Uint8Array>): Promise<void> {
                if (done) {
                    // Concatenate all chunks into a single ArrayBuffer
                    const length = chunks.reduce(
                        (acc, val) => acc + val.length,
                        0,
                    );
                    const concatenated = new Uint8Array(length);
                    let offset = 0;
                    for (let chunk of chunks) {
                        concatenated.set(chunk, offset);
                        offset += chunk.length;
                    }

                    // Decode and play the audio
                    audioContext
                        .decodeAudioData(concatenated.buffer)
                        .then((buffer) => {
                            const source = audioContext.createBufferSource();
                            source.buffer = buffer;
                            source.connect(audioContext.destination);
                            source.start();

                            if (callback) callback();
                        })
                        .catch((error) => {
                            Logger.error(
                                `Failed to play sound from stream`,
                                error,
                            );
                        });

                    return Promise.resolve();
                }

                chunks.push(value);
                return reader.read().then(process);
            })
            .catch((error) => {
                Logger.error(`Failed to play sound from stream`, error);
            });
    };

    playAiReplyFromUrl = (
        audioFileUrl: string,
        callback?: SoundCallback,
    ): void => {
        Logger.log('F: playAiReplyFromUrl');
        // Play AI reply at 100% volume (1.0 = 100%)
        this.playSound(audioFileUrl, callback, 1.0);
    };

    playStartTone = (): void => {
        this.startSound.play();
    };

    playEndTone = (): void => {
        this.endSound.play();
    };

    private initializeSound = (soundFileUrl: string, volume = 1.0): Howl => {
        return new Howl({
            src: [soundFileUrl],
            volume: volume,
            onloaderror: (id, error) =>
                Logger.error(`Failed to load sound: ${soundFileUrl}`, error),
            onplayerror: (id, error) =>
                Logger.error(`Failed to play sound: ${soundFileUrl}`, error),
        });
    };

    private playSound = (
        soundFileUrl: string,
        callback?: SoundCallback,
        volume?: number,
    ): void => {
        Logger.log('F: playSound');
        const sound = new Howl({
            src: [soundFileUrl],
            volume: volume,
            onend: () => {
                if (callback) callback();
            },
            onloaderror: (id, error) =>
                Logger.error(`Failed to load sound: ${soundFileUrl}`, error),
            onplayerror: (id, error) =>
                Logger.error(`Failed to play sound: ${soundFileUrl}`, error),
        });

        sound.play();
    };
}

export default AudioPlayer;
