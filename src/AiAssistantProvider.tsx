import React, { useState, useEffect, ReactNode } from 'react';
import AiAssistantEngine from './core/AiAssistantEngine';
import AiAssistantContext, {
    AiAssistantContextType,
} from './AiAssistantContext';

interface AiAssistantProviderProps {
    children: ReactNode;
    apiKey: string;
    apiUrl?: string;
    userId?: string;
    scrapeContent?: boolean;
    debug?: boolean;
}

export const AiAssistantProvider: React.FC<AiAssistantProviderProps> = ({
    children,
    apiKey,
    apiUrl,
    userId,
    scrapeContent,
    debug,
}) => {
    const [aiAssistant, setAiAssistant] = useState<
        AiAssistantEngine | undefined
    >();

    useEffect(() => {
        const aiAssistantInstance = new AiAssistantEngine(
            apiKey,
            apiUrl,
            userId,
            scrapeContent,
            debug,
        );
        setAiAssistant(aiAssistantInstance);
    }, [apiKey, apiUrl, userId, scrapeContent, debug]);

    const contextValue: AiAssistantContextType = {
        aiAssistant,
        on: aiAssistant?.on.bind(aiAssistant),
        off: aiAssistant?.off.bind(aiAssistant),
        registerFunctions: aiAssistant?.registerFunctions.bind(aiAssistant),
    };

    return (
        <AiAssistantContext.Provider value={contextValue}>
            {children}
        </AiAssistantContext.Provider>
    );
};

export default AiAssistantProvider;
