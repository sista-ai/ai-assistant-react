// src/VuicProvider.jsx
import React, { useState, useEffect } from 'react';
import MainProcessor from './core/MainProcessor';
import VuicContext from './VuicContext';

export const AiAssistantProvider = ({ children, apiKey, apiUrl, debug }) => {
  const [vuiSdk, setVuiSdk] = useState(null);

  useEffect(() => {
    const sdkInstance = MainProcessor.init(apiKey, apiUrl, debug);
    // Ensure sdkInstance has 'on' and 'off' methods from EventEmitter
    if (sdkInstance && typeof sdkInstance.on === 'function' && typeof sdkInstance.off === 'function') {
      setVuiSdk(sdkInstance);
    } else {
      console.error('Vuic instance is missing required event methods. Check Vuic class implementation.');
    }
  }, [apiKey, apiUrl, debug]);

  return (
    <VuicContext.Provider value={vuiSdk}>
      {children}
    </VuicContext.Provider>
  );
};