// src/core/FunctionExecutor.ts

import Logger from './Logger';
import { VoiceFunction } from './commonTypes';

export interface FunctionSignature {
    type: string;
    function: { name: string; description: string; parameters?: unknown };
}

interface AiMessage {
    functions: { function: { name: string; arguments: string } }[];
}

export default class FunctionExecutor {
    public functionSignatures: FunctionSignature[];
    private functionHandlers: Map<string, Function>;

    constructor() {
        this.functionSignatures = [];
        this.functionHandlers = new Map();
    }

    registerFunctions(voiceFunctions: VoiceFunction[]): void {
        Logger.log('--[SISTA]-- registerFunctions');

        voiceFunctions.forEach(({ function: func }) => {
            const { handler, ...rest } = func;
            const name = handler.name;
            this.functionHandlers.set(name, handler);
            this.functionSignatures.push({
                type: 'function',
                function: { name, ...rest },
            });
        });

        Logger.log('--[SISTA]-- Function References:', this.functionHandlers);
        Logger.log('--[SISTA]-- Function Signatures:', this.functionSignatures);
    }

    executeFunctions(message: AiMessage): void {
        Logger.log('--[SISTA]-- executeFunctions');

        console.dir(this.functionHandlers, { depth: null });

        if (!this.functionSignatures || this.functionSignatures.length === 0) {
            throw new Error(
                'functionSignatures is empty. Please register your voice activated functions. See docs https://docs.sista.ai',
            );
        }

        if (!this.functionHandlers || this.functionHandlers.size === 0) {
            throw new Error(
                'functionHandlers is empty. Please register your voice activated functions. See docs https://docs.sista.ai',
            );
        }

        if (!message || !message.functions) {
            Logger.error('E1: Invalid API response:', message);
            return;
        }

        message.functions.forEach((func) => {
            if (!func.function || !func.function.name) {
                Logger.error('E2: Invalid API response:', func);
                return;
            }

            const functionName = func.function.name;
            const functionToCall = this.functionHandlers.get(functionName);

            if (!functionToCall) {
                Logger.error(
                    `Function '${functionName}' not found. Ensure you've registered the function in 'registerFunctions'. See docs https://docs.sista.ai`,
                );
                return;
            }

            let functionArgs: Record<string, unknown> = {};
            try {
                functionArgs = JSON.parse(func.function.arguments);
            } catch (error) {
                Logger.error('E3: Invalid API response:', error);
                return;
            }

            const functionArgsArray = Object.values(functionArgs);
            try {
                Logger.log(
                    `--[SISTA]-- Calling function ${functionName} with arguments:`,
                    functionArgsArray,
                );
                functionToCall(...functionArgsArray);
            } catch (error) {
                Logger.error(
                    `Error calling function ${functionName}:`,
                    error as Error,
                );
            }
        });
    }
}
