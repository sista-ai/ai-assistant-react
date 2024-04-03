// src/core/FunctionExecutor.js
import Logger from './Logger';

export default class FunctionExecutor {
    constructor() {
        this.functionSignatures = [];
        this.functionHandlers = new Map();
    }

    registerFunctions(voiceFunctions) {
        Logger.log('--[SISTA]-- registerFunctions');

        // 1) extract the name and handler to build functionHandlers
        // 2) removing the handler from functionSignatures
        // 3) adding the type as 'function' to functionSignatures
        // 4) adding the function name to functionSignatures from the handler
        voiceFunctions.forEach(({ function: func }) => {
            const { handler, ...rest } = func;
            const name = handler.name;
            this.functionHandlers.set(Symbol(name), handler);
            this.functionSignatures.push({
                type: "function",
                function: { name, ...rest }
            });
        });

        Logger.log('--[SISTA]-- Function References:', this.functionHandlers);
        Logger.log('--[SISTA]-- Function Signatures:', this.functionSignatures);
    }

    executeFunctions = (message) => {
        Logger.log('--[SISTA]-- executeFunctions');

        console.dir(this.functionHandlers, { depth: null });

        if (!this.functionSignatures || this.functionSignatures.length === 0) {
            throw new Error('functionSignatures is empty. Please register your voice activated functions. See docs https://docs.sista.ai');
        }

        if (!this.functionHandlers || this.functionHandlers.size === 0) {
            throw new Error('functionHandlers is empty. Please register your voice activated functions. See docs https://docs.sista.ai');
        }

        if (!message || !message.tool_calls) {
            Logger.error('E1: Invalid API response:', message);
            return;
        }


        message.tool_calls.forEach((toolCall) => {
            if (!toolCall.function || !toolCall.function.name) {
                Logger.error('E2: Invalid API response:', toolCall);
                return;
            }

            const functionName = toolCall.function.name;
            let functionToCall;

            // Iterate over Map to find the function by its name
            for (let [key, value] of this.functionHandlers.entries()) {
                if (key.description === functionName) {
                    functionToCall = value;
                    break;
                }
            }

            if (!functionToCall) {
                Logger.error(`Function '${functionName}' not found. Ensure you've registered the function in 'registerFunctions'. See docs https://docs.sista.ai`);
                return;
            }

            let functionArgs = {};
            try {
                functionArgs = JSON.parse(toolCall.function.arguments);
            } catch (error) {
                Logger.error('E3: Invalid API response:', error);
                return;
            }

            const functionArgsArray = Object.values(functionArgs);
            try {
                Logger.log(`--[SISTA]-- Calling function ${functionName} with arguments:`, functionArgsArray);
                functionToCall(...functionArgsArray);
            } catch (error) {
                Logger.error(`Error calling function ${functionName}:`, error);
            }
        });


    };

}