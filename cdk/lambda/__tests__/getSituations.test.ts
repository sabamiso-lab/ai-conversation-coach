import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../getSituations';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

describe('getSituations Lambda Handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles OPTIONS request for CORS preflight', async () => {
    const event = {
      httpMethod: 'OPTIONS',
      headers: {},
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    expect(response.headers['Access-Control-Allow-Methods']).toContain('GET');
  });

  it('rejects request with 403 when API key is invalid', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {
        'x-speakflow-api-key': 'invalid-key',
      },
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('Forbidden: Invalid API Key');
  });

  it('returns situation list successfully when API key is valid', async () => {
    const defaultApiKey = 'sf_secret_key_default';
    const mockItems = [
      {
        id: 'test-1',
        title: 'Cafe Order',
        goals: ['Order coffee'],
      },
    ];

    vi.spyOn(DynamoDBDocumentClient.prototype, 'send').mockResolvedValueOnce({
      Items: mockItems,
      Count: 1,
    } as never);

    const event = {
      httpMethod: 'GET',
      headers: {
        'x-speakflow-api-key': defaultApiKey,
      },
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.situations).toEqual(mockItems);
    expect(body.count).toBe(1);
  });

  it('filters out expired situations based on expiresAt timestamp', async () => {
    const defaultApiKey = 'sf_secret_key_default';
    const nowInSeconds = Math.floor(Date.now() / 1000);

    const mockItems = [
      {
        id: 'valid-permanent',
        title: 'Permanent Cafe Scenario',
        goals: ['Order coffee'],
      },
      {
        id: 'valid-future-news',
        title: 'Future News Scenario',
        expiresAt: nowInSeconds + 3600, // 1 hour in future
        goals: ['Discuss tech'],
      },
      {
        id: 'expired-news',
        title: 'Yesterday News Scenario',
        expiresAt: nowInSeconds - 3600, // 1 hour in past
        goals: ['Discuss old news'],
      },
    ];

    vi.spyOn(DynamoDBDocumentClient.prototype, 'send').mockResolvedValueOnce({
      Items: mockItems,
      Count: 3,
    } as never);

    const event = {
      httpMethod: 'GET',
      headers: {
        'x-speakflow-api-key': defaultApiKey,
      },
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.count).toBe(2);
    expect(body.situations.map((s: any) => s.id)).toEqual(['valid-permanent', 'valid-future-news']);
  });

  it('rejects request with 403 when origin or referer is not in allowed origins', async () => {
    const defaultApiKey = 'sf_secret_key_default';
    const event = {
      httpMethod: 'GET',
      headers: {
        'x-speakflow-api-key': defaultApiKey,
        origin: 'https://malicious-site.com',
        referer: 'https://malicious-site.com/attack',
      },
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('Forbidden: Origin or Referer not allowed');
  });

  it('returns 500 Internal Server Error when DynamoDB query fails', async () => {
    const defaultApiKey = 'sf_secret_key_default';
    vi.spyOn(DynamoDBDocumentClient.prototype, 'send').mockRejectedValueOnce(new Error('DynamoDB failure'));

    const event = {
      httpMethod: 'GET',
      headers: {
        'x-speakflow-api-key': defaultApiKey,
      },
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Failed to fetch situations from database');
  });
});
