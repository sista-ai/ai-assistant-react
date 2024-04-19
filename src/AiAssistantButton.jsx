// src/AiAssistantButton.jsx

import React, { useState, useEffect } from 'react';
import { useAiAssistant } from './AiAssistantContext';
import { FaMicrophone, FaVolumeUp } from 'react-icons/fa';
import { GiBrainFreeze } from 'react-icons/gi';

const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
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
        .ai-assistant-button {
            width: 75px;
            height: 75px;
            font-size: 35px;
            color: #ffffff;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            border: none;
            box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.7);
            transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
            position: fixed;
            bottom: 75px;
            right: 75px;
            z-index: 9999;
        }
        @media (max-width: 768px) {
            .ai-assistant-button {
                width: 65px;
                height: 65px;
                font-size: 30px;
                bottom: 25px;
                right: 25px;
            }
        }
    `;
    document.head.appendChild(style);
};

const AiAssistantButton = ({
    stateColors = {},
    style = {},
    ...props
}) => {
    const aiAssistant = useAiAssistant();
    const [recordingState, setRecordingState] = useState('STATE_IDLE');
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const [hover, setHover] = useState(false);

    useEffect(() => {
        injectStyles();
    }, []);

    const defaultStateColors = {
        STATE_IDLE: '#4a6cf6',
        STATE_LISTENING_START: '#F64A7B',
        STATE_THINKING_START: '#015589',
        STATE_SPEAKING_START: '#019a9a',
    };

    const colors = { ...defaultStateColors, ...stateColors };

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

    return (
        <button
            className="ai-assistant-button"
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                backgroundColor: colors[recordingState],
                boxShadow: hover
                    ? '0px 0px 10px #4a6cf6'
                    : '0px 0px 15px rgba(0, 0, 0, 0.9)',
                animation:
                    recordingState === 'STATE_LISTENING_START'
                        ? 'spin 2s infinite'
                        : recordingState === 'STATE_THINKING_START'
                        ? 'bounce 2s infinite'
                        : recordingState === 'STATE_SPEAKING_START'
                        ? 'pulse 1.5s infinite'
                        : 'none',
                ...style,
            }}
            {...props}
        >
            {recordingState === 'STATE_THINKING_START' ? (
                <GiBrainFreeze />
            ) : recordingState === 'STATE_SPEAKING_START' ? (
                <FaVolumeUp />
            ) : (
                <FaMicrophone />
            )}
        </button>
    );
};

export { AiAssistantButton };
