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

  it('rejects request with 403 when origin is not allowed even without referer', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {
        'x-speakflow-api-key': defaultApiKey,
        'origin': 'https://malicious-site.com',
      },
      body: JSON.stringify({ title: 'Test' }),
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).error).toContain('Forbidden: Origin or Referer not allowed');
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

  it('rejects request with 403 when origin or referer is not in allowed origins', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {
        'x-speakflow-api-key': defaultApiKey,
        origin: 'https://malicious-site.com',
        referer: 'https://malicious-site.com',
      },
      body: JSON.stringify(validPayload),
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(403);
    expect(JSON.parse(response.body).error).toContain('Forbidden: Origin or Referer not allowed');
  });

  it('returns 400 Bad Request when body contains invalid JSON syntax', async () => {
    const event = {
      httpMethod: 'POST',
      headers: { 'x-speakflow-api-key': defaultApiKey },
      body: '{ title: broken json without quotes }',
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toContain('Invalid JSON body');
  });

  it('parses string goals separated by newlines and markdown bullet points', async () => {
    vi.spyOn(DynamoDBDocumentClient.prototype, 'send').mockResolvedValueOnce({} as never);

    const payloadWithStringGoals = {
      ...validPayload,
      goals: '- Goal A\n• Goal B\n* Goal C\nGoal D',
    };

    const event = {
      httpMethod: 'POST',
      headers: { 'x-speakflow-api-key': defaultApiKey },
      body: JSON.stringify(payloadWithStringGoals),
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.situation.goals).toEqual(['Goal A', 'Goal B', 'Goal C', 'Goal D']);
  });

  it('returns 400 Bad Request when goals array is empty', async () => {
    const payloadWithEmptyGoals = {
      ...validPayload,
      goals: [],
    };

    const event = {
      httpMethod: 'POST',
      headers: { 'x-speakflow-api-key': defaultApiKey },
      body: JSON.stringify(payloadWithEmptyGoals),
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toContain('At least one goal is required');
  });

  it('returns 500 Internal Server Error when DynamoDB PutCommand fails', async () => {
    vi.spyOn(DynamoDBDocumentClient.prototype, 'send').mockRejectedValueOnce(new Error('DynamoDB write error'));

    const event = {
      httpMethod: 'POST',
      headers: { 'x-speakflow-api-key': defaultApiKey },
      body: JSON.stringify(validPayload),
    };

    const response = await handler(event);
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toBe('Failed to create situation in database');
  });
});
