import { createContext, useContext } from 'react';

const VuicContext = createContext(null);

const useVuic = () => useContext(VuicContext);

export { VuicContext, useVuic };
