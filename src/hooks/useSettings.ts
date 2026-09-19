import { useContext } from 'react';
import { SettingsContext, SettingsContextType } from '../contexts/SettingsContext';

const defaultSettings: SettingsContextType = {
  apiKey: '',
  model: 'gemini-3.5-flash-lite',
  selectedSituation: null,
  setSelectedSituation: () => {},
  isApiKeyModalOpen: false,
  saveApiKey: () => {},
  saveModel: () => {},
  openApiKeyModal: () => {},
  closeApiKeyModal: () => {}
};

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  return context || defaultSettings;
}
