import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../useSettings';
import { SettingsProvider } from '../../contexts/SettingsContext';

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default fallback values when outside SettingsProvider', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.apiKey).toBe('');
    expect(result.current.model).toBe('gemini-3.5-flash-lite');
    expect(result.current.selectedSituation).toBeNull();
  });

  it('provides and updates settings when wrapped in SettingsProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.saveApiKey('test-key-12345');
      result.current.saveModel('gemini-1.5-pro');
    });

    expect(result.current.apiKey).toBe('test-key-12345');
    expect(result.current.model).toBe('gemini-1.5-pro');
    expect(localStorage.getItem('gemini_api_key_speakflow')).toBe('test-key-12345');
  });

  it('controls api key modal open/close states', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SettingsProvider>{children}</SettingsProvider>
    );

    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.closeApiKeyModal();
    });
    expect(result.current.isApiKeyModalOpen).toBe(false);

    act(() => {
      result.current.openApiKeyModal();
    });
    expect(result.current.isApiKeyModalOpen).toBe(true);
  });
});
