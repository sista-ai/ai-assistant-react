// src/core/AudioPlayer.js
import config from './config';
import Logger from './Logger';

class AudioPlayer {
    constructor() {
        this._setupAudioContext();
        this._loadSounds();
    }

    playAiReply = (audioFileUrl, callback) => {
        Logger.log('--[SISTA]-- playAiReply');
        this._fetchAudio(audioFileUrl)
            .then(audioBuffer => {
                this._playAudioBuffer(audioBuffer, callback, 1.0);
            });
    };

    playStartTone() {
        this._playAudioElement(this.startSound, 0.25);
    }

    playEndTone() {
        this._playAudioElement(this.endSound, 0.25);
    }

    _playAudioBuffer = (audioBuffer, callback, volume) => {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.value = volume;

        source.onended = () => {
            if (callback) callback();
        };

        source.start(0);
    };

    _playAudioElement(audioElement, volume) {
        try {
            audioElement.volume = volume;
            audioElement.play();
        } catch (error) {
            Logger.error('Failed to play sound:', error);
        }
    }

    _setupAudioContext() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (window.AudioContext) {
            this.audioContext = new AudioContext();
            document.documentElement.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
        }
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
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load audio file');
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer));
    };
}

export default AudioPlayer;