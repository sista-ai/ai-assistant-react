import React from 'react';
import useVuic from './VuicContext';

const VuicButton = ({ buttonText = 'Record', ...props }) => {
    const vuic = useVuic();

    const handleButtonClick = () => {
        if (vuic) {
            vuic.startVoiceRecording();
        }
    };

    return (
        <button onClick={handleButtonClick} {...props}>
            {buttonText}
        </button>
    );
};

export default VuicButton;