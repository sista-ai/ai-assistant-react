// src/core/AudioPlayer.js
import config from './config';

class AudioPlayer {
    constructor() {
        this._setupAudioContext();
        this._loadSounds();
        this.volume = 1.0; // Default volume
    }

    playRecordingTone(audioObj) {
        console.log('--[VUIC]-- playRecordingTone');
        this.volume = 0.25; // Set volume to 25%
        this._resumeAudioContextIfSuspended();
        this._playAudioObject(audioObj);
    }

    playAiReply = (audioFileUrl, callback) => {
        console.log('--[VUIC]-- playAiReply');
        this.volume = 1.0; // Set volume to 100%
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


}

export default AudioPlayer;