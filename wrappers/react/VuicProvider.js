import React, { useState, useEffect } from 'react';
import Vuic from '../../vuic';
import { VuicContext } from './VuicContext';

const VuicProvider = ({ apiKey, children }) => {
    const [vuiSdk, setVuiSdk] = useState({
        registerFunctions: () => {}, // Placeholder function
        startVoiceRecording: () => {}, // Placeholder function
    });

    useEffect(() => {
        if (apiKey) {
            const sdkInstance = Vuic.init(apiKey);
            setVuiSdk(sdkInstance);
        }
    }, [apiKey]);

    return (
        <VuicContext.Provider value={vuiSdk}>{children}</VuicContext.Provider>
    );
};

export default VuicProvider;
