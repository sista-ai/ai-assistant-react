import React, { useState, useEffect } from 'react';
import { useVuic } from './VuicContext';
import { FaMicrophone } from 'react-icons/fa';

const VuicButton = ({ buttonText = 'Record', ...props }) => {
    const vuic = useVuic();
    const [recordingState, setRecordingState] = useState('STATE_IDLE');
    const [isButtonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {
        if (vuic) {
            const handleStateChange = (newState) => {
                setRecordingState((prevState) => {
                    if (newState === 'STATE_AUDIO_END') {
                        newState = 'STATE_IDLE';
                    }
                    setButtonDisabled(newState !== 'STATE_IDLE');
                    return newState;
                });
            };

            vuic.on('stateChange', handleStateChange);

            return () => {
                vuic.off('stateChange', handleStateChange);
            };
        }
    }, [vuic]);

    const handleButtonClick = () => {
        if (vuic) {
            vuic.startVoiceRecording();
        }
    };

    const stateToColor = {
        STATE_IDLE: '#ff0000', // Red for idle state
        STATE_RECORDING_START: '#32CD32', // Lime green for recording start
        STATE_RECORDING_END: '#228B22', // Forest green for recording end
        STATE_PROCESSING_START: '#1E90FF', // Dodger blue for processing start
        STATE_PROCESSING_END: '#00008B', // Dark blue for processing end
        STATE_AUDIO_START: '#800080', // Purple for audio start
        STATE_AUDIO_END: '#4B0082', // Indigo for audio end
    };

    return (
        <button
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                fontSize: '24px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: stateToColor[recordingState],
                color: '#ffffff',
                border: 'none',
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.7)',
            }}
            onMouseOver={(e) => {
                e.currentTarget.children[0].style.transform =
                    'scale(1.5) rotate(360deg)';
            }}
            onMouseOut={(e) =>
                (e.currentTarget.children[0].style.transform =
                    'scale(1) rotate(0deg)')
            }
            {...props}
        >
            <FaMicrophone
                style={{
                    transition: 'transform 0.3s ease-in-out',
                }}
            />
        </button>
    );
};

export { VuicButton };
