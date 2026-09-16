import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSend = vi.fn();

vi.mock('@aws-sdk/lib-dynamodb', async () => {
  const actual = await vi.importActual('@aws-sdk/lib-dynamodb');
  return {
    ...actual,
    DynamoDBDocumentClient: {
      from: vi.fn().mockReturnValue({
        send: (...args: any[]) => mockSend(...args),
      }),
    },
  };
});

import { handler } from '../getSituations';

describe('getSituations Lambda Handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSend.mockReset();
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

    mockSend.mockResolvedValueOnce({
      Items: mockItems,
      Count: 1,
    });

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
});
