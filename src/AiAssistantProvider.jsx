// src/AiAssistantProvider.jsx

import React, { useState, useEffect } from 'react';
import AiAssistantEngine from './core/AiAssistantEngine';
import AiAssistantContext from './AiAssistantContext';

export const AiAssistantProvider = ({ children, apiKey, apiUrl, debug }) => {
    const [aiAssistant, setAiAssistant] = useState(null);

    useEffect(() => {
        const sdkInstance = AiAssistantEngine.init(apiKey, apiUrl, debug);
        setAiAssistant(sdkInstance);
    }, [apiKey, apiUrl, debug]);

    return (
        <AiAssistantContext.Provider value={aiAssistant}>
            {children}
        </AiAssistantContext.Provider>
    );
};
