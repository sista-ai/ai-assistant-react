import { Howl } from 'howler';
import config from './config';
import Logger from './Logger';

class AudioPlayer {
    constructor() {
        // Specify volume at 50% for start and end tones (0.5 = 50%)
        this.startSound = this._initializeSound(config.startSoundFileUrl, 0.5);
        this.endSound = this._initializeSound(config.endSoundFileUrl, 0.5);
    }

    playAiReply = (audioFileUrl, callback) => {
        Logger.log('--[SISTA]-- playAiReply');
        // Play AI reply at 100% volume (1.0 = 100%)
        this._playSound(audioFileUrl, callback, 1.0);
    };

    playStartTone = () => {
        this.startSound.play();
    };

    playEndTone = () => {
        this.endSound.play();
    };

    _initializeSound = (soundFileUrl, volume = 1.0) => {
        return new Howl({
            src: [soundFileUrl],
            volume: volume,
            onloaderror: (id, error) => Logger.error(`Failed to load sound: ${soundFileUrl}`, error),
            onplayerror: (id, error) => Logger.error(`Failed to play sound: ${soundFileUrl}`, error)
        });
    };

    _playSound = (soundFileUrl, callback, volume) => {
        const sound = new Howl({
            src: [soundFileUrl],
            volume: volume,
            onend: () => {
                if (callback) callback();
            },
            onloaderror: (id, error) => Logger.error(`Failed to load sound: ${soundFileUrl}`, error),
            onplayerror: (id, error) => Logger.error(`Failed to play sound: ${soundFileUrl}`, error)
        });

        sound.play();
    };
}

export default AudioPlayer;
