// src/AiAssistantProvider.jsx

import React, { useState, useEffect } from 'react';
import AiAssistantEngine from './core/AiAssistantEngine';
import AiAssistantContext from './AiAssistantContext';

export const AiAssistantProvider = ({
    children,
    apiKey,
    apiUrl,
    userId,
    scrapeContent,
    debug,
}) => {
    const [aiAssistant, setAiAssistant] = useState(null);

    useEffect(() => {
        const sdkInstance = new AiAssistantEngine(
            apiKey,
            apiUrl,
            userId,
            scrapeContent,
            debug,
        );
        setAiAssistant(sdkInstance);
    }, [apiKey, apiUrl, userId, scrapeContent, debug]);

    return (
        <AiAssistantContext.Provider value={aiAssistant}>
            {children}
        </AiAssistantContext.Provider>
    );
};
