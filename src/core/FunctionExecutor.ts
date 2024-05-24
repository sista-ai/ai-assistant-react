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
    private functionHandlers: Map<Symbol, Function>;

    constructor() {
        this.functionSignatures = [];
        this.functionHandlers = new Map();
    }

    registerFunctions(voiceFunctions: VoiceFunction[]): void {
        Logger.log('F: registerFunctions');

        voiceFunctions.forEach(({ function: func }) => {
            const { handler, ...rest } = func;
            const name = handler.name;
            const symbol = Symbol(name);
            this.functionHandlers.set(symbol, handler);

            this.functionSignatures.push({
                type: 'function',
                function: { name, ...rest },
            });
        });

        Logger.log(
            'Registered Function References:',
            this.functionHandlers,
        );
        Logger.log(
            'Registered Function Signatures:',
            this.functionSignatures,
        );
    }

    executeFunctions(executableFunctions: ExecutableFunction[]): void {
        Logger.log('F: executeFunctions');

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
            let functionToCall;

            for (let [key, value] of this.functionHandlers.entries()) {
                if (key.description === functionName) {
                    functionToCall = value;
                    break;
                }
            }

            if (!functionToCall) {
                Logger.error(
                    `Function '${functionName}' not found. Ensure you've registered the function in 'registerFunctions'. See docs https://docs.sista.ai`,
                );
                return;
            }

            const functionArgs = func.args || {};
            try {
                Logger.log(
                    `Calling function ${functionName} with arguments:`,
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
