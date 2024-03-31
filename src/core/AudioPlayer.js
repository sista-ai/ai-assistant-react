// src/core/AudioManager.js

import EventEmitter from './EventEmitter';

const startProcessingAudioFileUrl = 'https://vuic-assets.s3.us-west-1.amazonaws.com/sdk-assets/audio/start.mp3';
const endProcessingAudioFileUrl = 'https://vuic-assets.s3.us-west-1.amazonaws.com/sdk-assets/audio/end.mp3';

class AudioPlayer {

    constructor() {

        this.eventEmitter = new EventEmitter();

        try {
            // Preload the start and end sounds
            this.startSound = new Audio(startProcessingAudioFileUrl);
            this.endSound = new Audio(endProcessingAudioFileUrl);
        } catch (error) {
            console.error('Failed to load audio files:', error);
        }
    }

    playRecordingTone(audioObj, volume = 0.20) {
        console.log('--[VUIC]-- playRecordingTone');

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
        if (!window.Audio) {
            this.eventEmitter.emitStateChange(EventEmitter.STATE_IDLE);
            console.error('This browser does not support the Audio API');
            return;
        }

        let audio;
        try {
            audio = this.playRecordingTone(new Audio(audioFileUrl), 1.0);
        } catch (error) {
            this.eventEmitter.emitStateChange(EventEmitter.STATE_IDLE);
            console.error('Failed to load and play audio file:', error);
            return;
        }

        this._handleAudioEvents(audio);
    };


    _handleAudioEvents = (audio) => {
        // Emit AUDIO_START state when the audio starts
        audio.onplay = () => {
            this.eventEmitter.emitStateChange(EventEmitter.STATE_SPEAKING_START);
        };
        // Emit AUDIO_END state when the audio ends
        audio.onended = () => {
            this.eventEmitter.emitStateChange(EventEmitter.STATE_IDLE);
        };
        // Handle errors when loading the audio file
        audio.onerror = () => {
            this.eventEmitter.emitStateChange(EventEmitter.STATE_IDLE);
            console.error('An error occurred while trying to load the audio file:', audio.src);
        };
        // Handle errors when trying to play the audio
        audio.play().catch((error) => {
            console.error('An error occurred while trying to play the audio:', error);
        });
    }

}

export default AudioPlayer;

