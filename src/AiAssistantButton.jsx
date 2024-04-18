// src/AiAssistantButton.jsx

import React, { useState, useEffect } from 'react';
import { useAiAssistant } from './AiAssistantContext';
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';
import { LuBrainCircuit } from 'react-icons/lu';

const injectStyles = (keyframes) => {
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
};

const keyframes = `
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
@keyframes bounce {
    0%, 100% { transform: scale(0.7); }
    50% { transform: scale(1.2); }
}
@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.6); }
    100% { box-shadow: 0 0 0 30px rgba(255, 255, 255, 0); }
}
`;

const AiAssistantButton = ({
    buttonText = 'Record',
    buttonColors = {},
    style = {},
    ...props
}) => {
    const aiAssistant = useAiAssistant();
    const [recordingState, setRecordingState] = useState('STATE_IDLE');
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const [hover, setHover] = useState(false);

    useEffect(() => {
        injectStyles(keyframes);
    }, []);

    // Default buttonColors object
    const defaultButtonColors = {
        STATE_IDLE: '#4a6cf6',
        STATE_LISTENING_START: '#F64A7B',
        STATE_THINKING_START: '#015589',
        STATE_SPEAKING_START: '#019a9a',
    };

    const colors = { ...defaultButtonColors, ...buttonColors };

    const handleButtonClick = () => {
        if (aiAssistant) {
            aiAssistant.startProcessing();
        }
    };

    useEffect(() => {
        if (aiAssistant) {
            const handleStateChange = (newState) => {
                setRecordingState(newState);
                setButtonDisabled(newState !== 'STATE_IDLE');
            };

            aiAssistant.on('stateChange', handleStateChange);

            return () => {
                aiAssistant.off('stateChange', handleStateChange);
            };
        }
    }, [aiAssistant]);

    const baseStyle = {
        width: '75px',
        height: '75px',
        fontSize: '35px',
        color: '#ffffff',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: 'none',
        boxShadow: hover
            ? '0px 0px 10px rgba(255, 255, 255, 0.4)'
            : '0px 0px 15px rgba(0, 0, 0, 0.7)',
        transition:
            'background-color 0.3s ease-in-out, boxShadow 0.3s ease-in-out',
        backgroundColor: colors[recordingState],
        animation:
            recordingState === 'STATE_LISTENING_START'
                ? 'spin 2s infinite'
                : recordingState === 'STATE_THINKING_START'
                ? 'bounce 2s infinite'
                : recordingState === 'STATE_SPEAKING_START'
                ? 'pulse 1.5s infinite'
                : 'none',
        ...style,
        position: style.position || 'fixed',
        bottom: style.bottom || '75px',
        right: style.right || '75px',
        zIndex: style.zIndex || 9999,
    };

    return (
        <button
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
            style={baseStyle}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            {...props}
        >
            {recordingState === 'STATE_THINKING_START' ? (
                <LuBrainCircuit />
            ) : recordingState === 'STATE_SPEAKING_START' ? (
                <FaVolumeUp />
            ) : (
                <FaMicrophone />
            )}
        </button>
    );
};

export { AiAssistantButton };
