// src/core/AudioPlayer.js
import config from './config';
import Logger from './Logger';

class AudioPlayer {
    constructor() {
        this._setupAudioContext();
        this._loadSounds();
        this.volume = 1.0; // Default volume
    }

    playStartTone() {
        this._playRecordingTone(this.startSound);
    }

    playEndTone() {
        this._playRecordingTone(this.endSound);
    }

    playAiReply = (audioFileUrl, callback) => {
        Logger.log('--[SISTA]-- playAiReply');
        this.volume = 1.0; // Set volume to 100%
        this._checkAudioSupportAndPlayReply(audioFileUrl, callback);
    };

    _playRecordingTone(audioObj) {
        Logger.log('--[SISTA]-- playRecordingTone');
        this.volume = 0.25; // Set volume to 25%
        this._resumeAudioContextIfSuspended();
        this._playAudioObject(audioObj);
    }


    _playAudio = (audioBuffer, callback) => {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.value = this.volume;

        source.onended = () => {
            if (callback) callback();
        };

        source.start(0);
    };

    _playAudioObject(audioObj) {
        try {
            audioObj.volume = this.volume;
            audioObj.play();
        } catch (error) {
            Logger.error('Failed to play sound:', error);
        }
    }

    _setupAudioContext() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (window.AudioContext) {
            this.audioContext = new AudioContext();
            this._unlockAudioContextOnFirstInteraction();
        }
    }

    _unlockAudioContextOnFirstInteraction() {
        document.documentElement.addEventListener('click', () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });
    }

    _loadSounds() {
        try {
            this.startSound = new Audio(config.startSoundFileUrl);
            this.endSound = new Audio(config.endSoundFileUrl);
        } catch (error) {
            Logger.error('Failed to load audio files:', error);
        }
    }

    _fetchAudio = (audioFileUrl) => {
        return fetch(audioFileUrl)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer));
    };

    _resumeAudioContextIfSuspended() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    _checkAudioSupportAndPlayReply(audioFileUrl, callback) {
        if (!window.Audio || !this.audioContext) {
            Logger.error('This browser does not support the Audio API');
            if (callback) callback(new Error('Audio API not supported'));
            return;
        }

        this._fetchAudio(audioFileUrl)
            .then(audioBuffer => {
                this._playAudio(audioBuffer, callback);
            })
            .catch(error => {
                Logger.error('Failed to load and play audio file:', error);
                if (callback) callback(error);
            });
    }

}

export default AudioPlayer;