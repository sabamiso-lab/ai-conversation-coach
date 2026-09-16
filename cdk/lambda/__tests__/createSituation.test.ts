import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../createSituation';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

describe('createSituation Lambda Handler', () => {
  const defaultApiKey = 'sf_secret_key_default';

  const validPayload = {
    title: 'Custom Situation',
    titleJa: 'カスタムシチュエーション',
    category: 'Business',
    difficulty: 'intermediate',
    systemRole: 'Interviewer',
    userRole: 'Candidate',
    description: 'Job interview practice',
    descriptionJa: '面接の練習',
    initialMessage: 'Welcome to the interview.',
    goals: ['Introduce yourself', 'Ask questions'],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects request with 403 when API key is missing or invalid', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify(validPayload),
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(403);
  });

  it('returns 400 Bad Request when request body is missing', async () => {
    const event = {
      httpMethod: 'POST',
      headers: { 'x-speakflow-api-key': defaultApiKey },
      body: null,
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toContain('Missing request body');
  });

  it('returns 400 Bad Request when required fields are missing', async () => {
    const incompletePayload = { title: 'Only Title' };
    const event = {
      httpMethod: 'POST',
      headers: { 'x-speakflow-api-key': defaultApiKey },
      body: JSON.stringify(incompletePayload),
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toContain('Missing required field(s)');
  });

  it('creates situation successfully and returns 201 Created', async () => {
    vi.spyOn(DynamoDBDocumentClient.prototype, 'send').mockResolvedValueOnce({} as never);

    const event = {
      httpMethod: 'POST',
      headers: { 'x-speakflow-api-key': defaultApiKey },
      body: JSON.stringify(validPayload),
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.message).toBe('Situation registered successfully');
    expect(body.situation.title).toBe('Custom Situation');
    expect(body.situation.goals).toEqual(['Introduce yourself', 'Ask questions']);
  });
});
