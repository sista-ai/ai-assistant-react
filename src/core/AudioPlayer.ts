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

    playAiReply = (audioFileUrl: string, callback?: SoundCallback): void => {
        Logger.log('--[SISTA]-- playAiReply');
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