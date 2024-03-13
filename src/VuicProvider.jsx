import React, { useState, useEffect } from 'react';
import Vuic from './core/vuic';
import { VuicContext } from './VuicContext';

const VuicProvider = ({ apiKey, children }) => {
    const [vuiSdk, setVuiSdk] = useState(null);

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

export { VuicProvider };
