import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SITUATIONS } from '../../data/situations';
import { createSituation, fetchSituations } from '../api';

describe('api service (fetchSituations & createSituation)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('fetchSituations', () => {
    it('returns local fallback situations if VITE_API_BASE_URL is not set', async () => {
      const result = await fetchSituations();
      expect(result.isFallback).toBe(true);
      expect(result.data).toEqual(SITUATIONS);
    });

    it('fetches and formats situations successfully when API responds with 200', async () => {
      const mockRawSituations = [
        {
          id: 'test-1',
          title: 'Test Situation',
          titleJa: 'テストシチュエーション',
          category: 'business',
          icon: '💼',
          difficulty: 'intermediate',
          systemRole: 'System role',
          userRole: 'User role',
          description: 'Desc',
          descriptionJa: '説明',
          initialMessage: 'Hello!',
          goals: ['Goal 1', 'Goal 2'],
        },
        {
          id: 'test-2',
          title: 'Test 2',
          goals: { SS: ['Goal A', 'Goal B'] },
        }
      ];

      // Mock import.meta.env by stubbing fetch response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ situations: mockRawSituations }),
      });

      // Temporarily mock API_BASE_URL via vi.stubEnv if supported or simulation
      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/situations');

      const result = await fetchSituations();
      expect(result.isFallback).toBe(false);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('test-1');
      expect(result.data[0].goals).toEqual(['Goal 1', 'Goal 2']);
      expect(result.data[1].goals).toEqual(['Goal A', 'Goal B']);

      vi.unstubAllEnvs();
    });

    it('falls back to local SITUATIONS on API HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/situations');

      const result = await fetchSituations();
      expect(result.isFallback).toBe(true);
      expect(result.data).toEqual(SITUATIONS);
      expect(result.error).toContain('API returned HTTP 500');

      vi.unstubAllEnvs();
    });

    it('falls back to local SITUATIONS on network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network connection failed'));

      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/situations');

      const result = await fetchSituations();
      expect(result.isFallback).toBe(true);
      expect(result.data).toEqual(SITUATIONS);
      expect(result.error).toBe('Network connection failed');

      vi.unstubAllEnvs();
    });
  });

  describe('createSituation', () => {
    it('returns local mock success when VITE_API_BASE_URL is not configured', async () => {
      const newSituation = {
        title: 'New Custom Situation',
        titleJa: '新規カスタムシチュエーション',
        goals: 'Goal A\nGoal B',
      };

      const result = await createSituation(newSituation);
      expect(result.success).toBe(true);
      expect(result.isFallback).toBe(true);
      expect(result.situation.title).toBe('New Custom Situation');
      expect(result.situation.goals).toEqual(['Goal A', 'Goal B']);
    });

    it('posts data to API and returns created situation on API success', async () => {
      const newSituation = {
        title: 'New Custom Situation',
        goals: ['Goal 1'],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ situation: { ...newSituation, id: 'custom-123' } }),
      });

      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/situations');

      const result = await createSituation(newSituation);
      expect(result.success).toBe(true);
      expect(result.isFallback).toBe(false);
      expect(result.situation.id).toBe('custom-123');

      vi.unstubAllEnvs();
    });

    it('handles API error when posting new situation', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Missing title' }),
      });

      vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/situations');

      const result = await createSituation({ goals: [] });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing title');

      vi.unstubAllEnvs();
    });
  });
});
