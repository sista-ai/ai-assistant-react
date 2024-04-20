export interface VoiceFunction {
    function: {
        handler: Function;
        description: string;
        parameters?: {
            type: string;
            properties?: {
                [key: string]: {
                    type: string;
                    description: string;
                };
            };
            required?: string[];
        };
    };
}

