// src/core/FunctionExecutor.js

export default class FunctionExecutor {
    constructor() {
        this.functionSignatures = [];
        this.functionHandlers = new Map();
    }

    registerFunctions(voiceFunctions) {
        console.log('--[VUIC]-- registerFunctions');

        voiceFunctions.forEach(({ function: func }) => {
            const { name, handler, ...rest } = func;
            this.functionHandlers.set(Symbol(name), handler);
            this.functionSignatures.push({
                type: "function",
                function: { name, ...rest }
            });
        });

        console.log('--[VUIC]-- Function References:', this.functionHandlers);
        console.log('--[VUIC]-- Function Signatures:', this.functionSignatures);
    }

    executeFunctions = (message) => {
        console.log('--[VUIC]-- executeFunctions');

        console.dir(this.functionHandlers, { depth: null });

        if (!this.functionSignatures || this.functionSignatures.length === 0) {
            throw new Error('functionSignatures is empty. Please register your voice activated functions. See docs https://docs.sista.ai');
        }

        if (!this.functionHandlers || this.functionHandlers.size === 0) {
            throw new Error('functionHandlers is empty. Please register your voice activated functions. See docs https://docs.sista.ai');
        }

        if (!message || !message.tool_calls) {
            console.error('E1: Invalid API response:', message);
            return;
        }


        message.tool_calls.forEach((toolCall) => {
            if (!toolCall.function || !toolCall.function.name) {
                console.error('E2: Invalid API response:', toolCall);
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
                console.error(`Function '${functionName}' not found. Ensure you've registered the function in 'registerFunctions'. See docs https://docs.sista.ai`);
                return;
            }

            let functionArgs = {};
            try {
                functionArgs = JSON.parse(toolCall.function.arguments);
            } catch (error) {
                console.error('E3: Invalid API response:', error);
                return;
            }

            const functionArgsArray = Object.values(functionArgs);
            try {
                console.log(`--[VUIC]-- Calling function ${functionName} with arguments:`, functionArgsArray);
                functionToCall(...functionArgsArray);
            } catch (error) {
                console.error(`Error calling function ${functionName}:`, error);
            }
        });


    };

}