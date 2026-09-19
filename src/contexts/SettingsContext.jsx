import React, { createContext, useState } from 'react';

const STORAGE_KEY = 'gemini_api_key_speakflow';
const STORAGE_MODEL_KEY = 'gemini_model_speakflow';

const SettingsContext = createContext(null);
export { SettingsContext };

export function SettingsProvider({ children }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [model, setModel] = useState(() => localStorage.getItem(STORAGE_MODEL_KEY) || 'gemini-3.5-flash-lite');
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(() => !localStorage.getItem(STORAGE_KEY));

  const saveApiKey = (newKey) => {
    setApiKey(newKey);
    localStorage.setItem(STORAGE_KEY, newKey);
  };

  const saveModel = (newModel) => {
    setModel(newModel);
    localStorage.setItem(STORAGE_MODEL_KEY, newModel);
  };

  const openApiKeyModal = () => setIsApiKeyModalOpen(true);
  const closeApiKeyModal = () => setIsApiKeyModalOpen(false);

  const value = {
    apiKey,
    model,
    selectedSituation,
    setSelectedSituation,
    isApiKeyModalOpen,
    saveApiKey,
    saveModel,
    openApiKeyModal,
    closeApiKeyModal
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
