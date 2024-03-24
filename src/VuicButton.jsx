import React, { useState } from 'react';
import { useVuic } from './VuicContext';
import { FaMicrophone } from 'react-icons/fa';

const VuicButton = ({ buttonText = 'Record', ...props }) => {
    const vuic = useVuic();
    const [isRecording, setIsRecording] = useState(false);

    const handleButtonClick = async () => {
        if (vuic) {
            setIsRecording(true);
            try {
                await vuic.startVoiceRecording();
            } finally {
                setIsRecording(false);
            }
        }
    };

    return (
        <button
            onClick={handleButtonClick}
            disabled={isRecording} // Disable the button while recording
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
                backgroundColor: isRecording ? '#a50000' : '#ff0000',
                color: isRecording ? '#888888' : '#ffffff',
                border: 'none',
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.7)', // Enhanced shadow
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
