import React, { useState, useEffect } from 'react';
import { useVuic } from './VuicContext';
import { FaMicrophone } from 'react-icons/fa';

const VuicButton = ({ buttonText = 'Record', ...props }) => {
    const vuic = useVuic();
    const [recordingState, setRecordingState] = useState('idle'); // 'idle', 'recording', 'processing'
    const [isButtonDisabled, setButtonDisabled] = useState(false); // New state variable

    useEffect(() => {
        if (vuic) {
            const handleStateChange = (newState) => {
                setRecordingState((prevState) => {
                    if (newState === 'audioEnd') {
                        newState = 'idle'; // Reset state to 'idle' when audio ends
                    }
                    setButtonDisabled(newState !== 'idle'); // Enable button if state is 'idle'
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

    // Define a mapping from state to button background color
    const stateToColor = {
        idle: '#ff0000',
        recording: '#008000',
        processing: '#007cff',
        audioStart: '#ff6801',
        audioEnd: '#ff0000',
    };

    return (
        <button
            onClick={handleButtonClick}
            disabled={isButtonDisabled} // Disable button based on state
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
                    'scale(1.5) rotate(360deg)'; // Scale up and rotate icon on hover
            }}
            onMouseOut={(e) =>
                (e.currentTarget.children[0].style.transform =
                    'scale(1) rotate(0deg)')
            } // Scale down and reset rotation when hover ends
            {...props}
        >
            <FaMicrophone
                style={{
                    transition: 'transform 0.3s ease-in-out', // Add transition for smooth scaling
                }}
            />
        </button>
    );
};

export { VuicButton };
