// src/AiAssistantContext.jsx

import { createContext, useContext } from 'react';

const AiAssistantContext = createContext();

export const useAiAssistant = () => {
    const context = useContext(AiAssistantContext);
    if (context === undefined) {
        throw new Error(
            "The 'useAiAssistant' must be used within an 'AiAssistantProvider'.",
        );
    }
    return context;
};

export default AiAssistantContext;
