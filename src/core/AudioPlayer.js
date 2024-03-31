// src/core/AudioPlayer.js
import config from './config';

class AudioPlayer {
    constructor() {
        this._setupAudioContext();
        this._loadSounds();
    }

    playRecordingTone(audioObj, volume = 0.20) {
        console.log('--[VUIC]-- playRecordingTone');
        this._resumeAudioContextIfSuspended();
        this._playAudioObject(audioObj, volume);
    }

    playAiReply = (audioFileUrl, callback) => {
        console.log('--[VUIC]-- playAiReply');
        this._checkAudioSupportAndPlayReply(audioFileUrl, callback);
    };

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
            console.error('Failed to load audio files:', error);
        }
    }

    _resumeAudioContextIfSuspended() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    _playAudioObject(audioObj, volume) {
        try {
            audioObj.volume = volume;
            audioObj.play();
        } catch (error) {
            console.error('Failed to play sound:', error);
        }
    }

    _checkAudioSupportAndPlayReply(audioFileUrl, callback) {
        if (!window.Audio || !this.audioContext) {
            console.error('This browser does not support the Audio API');
            if (callback) callback(new Error('Audio API not supported'));
            return;
        }
    
        this._loadAudio(audioFileUrl)
            .then(audioBuffer => {
                this._playAudio(audioBuffer, callback);
            })
            .catch(error => {
                console.error('Failed to load and play audio file:', error);
                if (callback) callback(error);
            });
    }
    

    _loadAudio = (audioFileUrl) => {
        return fetch(audioFileUrl)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer));
    };

    _playAudio = (audioBuffer, callback) => {
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        source.onended = () => {
            if (callback) callback();
        };
        source.start(0);
    };
}

export default AudioPlayer;