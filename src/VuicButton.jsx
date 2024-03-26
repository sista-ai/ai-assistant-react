import React, { useState, useEffect } from 'react';
import { useVuic } from './VuicContext';
import { FaMicrophone } from 'react-icons/fa';

const VuicButton = ({ buttonText = 'Record', ...props }) => {
    const vuic = useVuic();
    const [recordingState, setRecordingState] = useState('idle'); // 'idle', 'recording', 'processing'

    useEffect(() => {
        if (vuic) {
            const handleStateChange = (newState) => {
                setRecordingState(newState);
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

    // Define a mapping from state to button background color
    const stateToColor = {
        idle: '#ff0000',
        recording: '#00ff00',
        processing: '#0000ff',
    };

    return (
        <button
            onClick={handleButtonClick}
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
