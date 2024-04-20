import { createContext, useContext } from 'react';
import AiAssistantEngine from './core/AiAssistantEngine';
import { VoiceFunction } from './core/commonTypes';

export interface AiAssistantContextType {
    aiAssistant?: AiAssistantEngine;
    on?: (event: string, listener: (...args: any[]) => void) => void;
    off?: (event: string, listener: (...args: any[]) => void) => void;
    registerFunctions?: (voiceFunctions: VoiceFunction[]) => void;
}

const AiAssistantContext = createContext<AiAssistantContextType | undefined>(
    undefined,
);

export const useAiAssistant = (): AiAssistantContextType => {
    const context = useContext(AiAssistantContext);
    if (context === undefined) {
        throw new Error(
            'useAiAssistant must be used within an AiAssistantProvider',
        );
    }
    return context;
};

export default AiAssistantContext;
