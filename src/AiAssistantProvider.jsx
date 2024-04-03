// src/AiAssistantProvider.jsx
import React, { useState, useEffect } from 'react';
import MainProcessor from './core/MainProcessor';
import AiAssistantContext from './AiAssistantContext';

export const AiAssistantProvider = ({ children, apiKey, apiUrl, debug }) => {
    const [aiAssistant, setAiAssistant] = useState(null);

    useEffect(() => {
        const sdkInstance = MainProcessor.init(apiKey, apiUrl, debug);
        setAiAssistant(sdkInstance);
    }, [apiKey, apiUrl, debug]);

    return (
        <AiAssistantContext.Provider value={aiAssistant}>
            {children}
        </AiAssistantContext.Provider>
    );
};
