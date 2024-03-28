// src/VuicContext.jsx
import { createContext, useContext } from 'react';

const VuicContext = createContext();

export const useVuic = () => {
  const context = useContext(VuicContext);
  if (context === undefined) {
    throw new Error('useVuic must be used within a VuicProvider');
  }
  return context;
};

export default VuicContext;
