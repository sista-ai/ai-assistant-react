// src/core/FunctionExecutor.ts

import Logger from './Logger';
import { VoiceFunction } from './commonTypes';

export interface FunctionSignature {
    type: string;
    function: { name: string; description: string; parameters?: unknown };
}

interface ExecutableFunction {
    name: string;
    args: Record<string, unknown>;
    id: string;
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

        // 1) extract the name and handler to build functionHandlers
        // 2) removing the handler from functionSignatures
        // 3) adding the type as 'function' to functionSignatures
        // 4) adding the function name to functionSignatures from the handler
        voiceFunctions.forEach(({ function: func }) => {
            const { handler, ...rest } = func;
            const name = handler.name;
            this.functionHandlers.set(name, handler);

            // Ensure no duplicate function signatures
            const functionExists = this.functionSignatures.some(
                (funcSig) => funcSig.function.name === name,
            );

            if (!functionExists) {
                this.functionSignatures.push({
                    type: 'function',
                    function: { name, ...rest },
                });
            }
        });

        Logger.log(
            '--[SISTA]-- Registered Function References:',
            this.functionHandlers,
        );
        Logger.log(
            '--[SISTA]-- Registered Function Signatures:',
            this.functionSignatures,
        );
    }

    executeFunctions(executableFunctions: ExecutableFunction[]): void {
        Logger.log('--[SISTA]-- executeFunctions');

        if (!executableFunctions || executableFunctions.length === 0) {
            Logger.error('E1: Invalid API response:', executableFunctions);
            return;
        }

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

        executableFunctions.forEach((func) => {
            const functionName = func.name;
            const functionToCall = this.functionHandlers.get(functionName);

            if (!functionToCall) {
                Logger.error(
                    `Function '${functionName}' not found. Ensure you've registered the function in 'registerFunctions'. See docs https://docs.sista.ai`,
                );
                return;
            }

            const functionArgs = func.args || {};
            try {
                Logger.log(
                    `--[SISTA]-- Calling function ${functionName} with arguments:`,
                    functionArgs,
                );
                functionToCall(functionArgs);
            } catch (error) {
                Logger.error(
                    `Error calling function ${functionName}:`,
                    error as Error,
                );
            }
        });
    }
}
