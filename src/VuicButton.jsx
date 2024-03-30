// src/VuicButton.jsx
import React, { useState, useEffect } from 'react';
import { useVuic } from './VuicContext';
import { FaMicrophone } from 'react-icons/fa';
import { FaVolumeUp } from 'react-icons/fa';
import { FaSatelliteDish } from 'react-icons/fa';
import styled, { keyframes, css } from 'styled-components';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.6);
  }
  100% {
    box-shadow: 0 0 0 30px rgba(255, 255, 255, 0);
  }
`;

const PulseAnimation = css`
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
`;
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: scale(0.7);
  }
  50% {
    transform: scale(1.2);
  }
`;

const Button = styled.button`
    position: fixed;
    bottom: 100px;
    right: 100px;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    font-size: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;
    border: none;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.7);
    transition: background-color 0.3s ease-in-out;
    background-color: ${(props) => props.color};
    z-index: 9999;

    &:hover {
        border: 1.5px solid #fff;
    }

    &.STATE_LISTENING_START {
        animation: ${spin} 2s infinite;
    }

    &.STATE_THINKING_START {
        animation: ${bounce} 2s infinite linear;
    }

    &.STATE_SPEAKING_START {
        animation: ${pulse} 1.5s infinite;
    }
`;

const VuicButton = ({ buttonText = 'Record', buttonColors = {}, ...props }) => {
    const vuic = useVuic();
    const [recordingState, setRecordingState] = useState('STATE_IDLE');
    const [isButtonDisabled, setButtonDisabled] = useState(false);

    // Default buttonColors object
    const defaultButtonColors = {
        STATE_IDLE: '#4a6cf6', // Original color
        STATE_LISTENING_START: '#F64A7B', // Red
        STATE_THINKING_START: '#015589', // Blue
        STATE_SPEAKING_START: '#019a9a', // Green
    };

    // Merge the provided buttonColors prop with the default colors
    const colors = { ...defaultButtonColors, ...buttonColors };

    const handleButtonClick = () => {
        if (vuic) {
            vuic.startVoiceRecording();
        }
    };
    useEffect(() => {
        if (vuic) {
            const handleStateChange = (newState) => {
                setRecordingState(newState);
                setButtonDisabled(newState !== 'STATE_IDLE');
            };

            vuic.on('stateChange', handleStateChange);

            return () => {
                vuic.off('stateChange', handleStateChange);
            };
        }
    }, [vuic]);

    return (
        <Button
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
            className={recordingState}
            color={colors[recordingState]}
            {...props}
        >
            {recordingState === 'STATE_THINKING_START' ? (
                <FaSatelliteDish />
            ) : recordingState === 'STATE_SPEAKING_START' ? (
                <FaVolumeUp />
            ) : (
                <FaMicrophone />
            )}
        </Button>
    );
};

export { VuicButton };
