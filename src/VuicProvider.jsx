// src/VuicProvider.jsx
import React, { useState, useEffect } from 'react';
import Vuic from './core/vuic';
import VuicContext from './VuicContext';

export const VuicProvider = ({ children, apiKey, vuicBaseURL }) => {
  const [vuiSdk, setVuiSdk] = useState(null);

  useEffect(() => {
    const sdkInstance = Vuic.init(apiKey, vuicBaseURL);
    // Ensure sdkInstance has 'on' and 'off' methods from EventEmitter
    if (sdkInstance && typeof sdkInstance.on === 'function' && typeof sdkInstance.off === 'function') {
      setVuiSdk(sdkInstance);
    } else {
      console.error('Vuic instance is missing required event methods. Check Vuic class implementation.');
    }
  }, [apiKey, vuicBaseURL]);

  return (
    <VuicContext.Provider value={vuiSdk}>
      {children}
    </VuicContext.Provider>
  );
};
