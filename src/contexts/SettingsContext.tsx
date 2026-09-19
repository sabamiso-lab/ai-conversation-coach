import React, { createContext, useState, ReactNode } from 'react';
import { Situation } from '../types';

const STORAGE_KEY = 'gemini_api_key_speakflow';
const STORAGE_MODEL_KEY = 'gemini_model_speakflow';

export interface SettingsContextType {
  apiKey: string;
  model: string;
  selectedSituation: Situation | null;
  setSelectedSituation: (sit: Situation | null) => void;
  isApiKeyModalOpen: boolean;
  saveApiKey: (newKey: string) => void;
  saveModel: (newModel: string) => void;
  openApiKeyModal: () => void;
  closeApiKeyModal: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);
export { SettingsContext };

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState(() => {
    return typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) || '') : '';
  });
  const [model, setModel] = useState(() => {
    return typeof localStorage !== 'undefined' ? (localStorage.getItem(STORAGE_MODEL_KEY) || 'gemini-3.5-flash-lite') : 'gemini-3.5-flash-lite';
  });
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(() => {
    return typeof localStorage !== 'undefined' ? !localStorage.getItem(STORAGE_KEY) : false;
  });

  const saveApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newKey);
    }
  };

  const saveModel = (newModel: string) => {
    setModel(newModel);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_MODEL_KEY, newModel);
    }
  };

  const openApiKeyModal = () => setIsApiKeyModalOpen(true);
  const closeApiKeyModal = () => setIsApiKeyModalOpen(false);

  const value: SettingsContextType = {
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
