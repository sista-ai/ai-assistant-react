import React from 'react';
import { useVuic } from './VuicContext';
import { FaMicrophone } from 'react-icons/fa';

const VuicButton = ({ buttonText = 'Record', ...props }) => {
    const vuic = useVuic();

    const handleButtonClick = () => {
        if (vuic) {
            vuic.startVoiceRecording();
        }
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
                backgroundColor: '#ff0000', // Red background
                color: '#ffffff', // White text/icon
                border: 'none',
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)', // Enhanced shadow
                transition: 'transform 0.3s ease-in-out' // Add transition for smooth scaling
            }}
            {...props}
        >
            <FaMicrophone style={{ 
                transition: 'transform 0.3s ease-in-out' // Add transition for smooth scaling
            }} 
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.5) rotate(360deg)'; // Scale up and rotate icon on hover
            }}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'} // Scale down and reset rotation when hover ends
            /> 
        </button>
    );
}

export { VuicButton };