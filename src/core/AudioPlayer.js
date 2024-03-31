// src/core/AudioPlayer.js
import config from './config';
import EventEmitter from './EventEmitter';

class AudioPlayer {

    constructor() {
        this.eventEmitter = new EventEmitter();
        this.audioContext = null; // Add an audio context property

        try {
            // Preload the start and end sounds
            this.startSound = new Audio(config.startSoundFileUrl);
            this.endSound = new Audio(config.endSoundFileUrl);
            this.setupAudioContext(); // Setup audio context on initialization
        } catch (error) {
            console.error('Failed to load audio files:', error);
        }
    }

    setupAudioContext() {
        // Use AudioContext to manage playback
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (window.AudioContext) {
            this.audioContext = new AudioContext();
            // Unlock the audio context on the first user interaction
            document.documentElement.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
        }
    }

    playRecordingTone(audioObj, volume = 0.20) {
        console.log('--[VUIC]-- playRecordingTone');
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume(); // Ensure the audio context is resumed
        }

        try {
            audioObj.volume = volume;
            audioObj.play();
        } catch (error) {
            console.error('Failed to play sound:', error);
        }

        return audioObj;
    }

    playAiReply = (audioFileUrl) => {
        console.log('--[VUIC]-- playAiReply');
        // Check if the browser supports the Audio API
        if (!window.Audio || !this.audioContext) {
            this.eventEmitter.emitStateChange(EventEmitter.STATE_IDLE);
            console.error('This browser does not support the Audio API');
            return;
        }

        let audio;
        try {
            // Instead of creating a new Audio, connect to the existing AudioContext
            const source = this.audioContext.createBufferSource();
            fetch(audioFileUrl)
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    source.buffer = audioBuffer;
                    source.connect(this.audioContext.destination);
                    source.start(0);
                    this._handleAudioEvents(source); // Adjusted to handle events on source
                });
        } catch (error) {
            this.eventEmitter.emitStateChange(EventEmitter.STATE_IDLE);
            console.error('Failed to load and play audio file:', error);
            return;
        }
    };

    _handleAudioEvents = (audio) => {
        // Adjust event handling for AudioBufferSourceNode
        audio.onended = () => {
            this.eventEmitter.emitStateChange(EventEmitter.STATE_IDLE);
        };

        // Note: For AudioBufferSourceNode, 'onplay' and 'onerror' events are not directly available like they are for the HTMLAudioElement.
        // You may need to adjust your event handling logic here based on your application's needs.
    }

}

export default AudioPlayer;
