import React, { useState, useEffect } from 'react';
import Vuic from './core/vuic';
import { VuicContext } from './VuicContext';

const VuicProvider = ({ apiKey, vuicBaseURL, children }) => {
    const [vuiSdk, setVuiSdk] = useState(null);

    useEffect(() => {
        const sdkInstance = Vuic.init(apiKey, vuicBaseURL);
        setVuiSdk(sdkInstance);
    }, [apiKey, vuicBaseURL]);

    return (
        <VuicContext.Provider value={vuiSdk}>{children}</VuicContext.Provider>
    );
};

export { VuicProvider };
