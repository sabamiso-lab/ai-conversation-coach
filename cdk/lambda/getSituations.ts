import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

export function getDocClient() {
  const client = new DynamoDBClient({});
  return DynamoDBDocumentClient.from(client);
}

function parseGoals(goals: any): string[] {
  if (Array.isArray(goals)) return goals;
  if (goals instanceof Set) return Array.from(goals);
  if (goals && typeof goals === 'object') {
    if (Array.isArray(goals.SS)) return goals.SS;
    if (Array.isArray(goals.values)) return goals.values;
    return Object.values(goals).flat() as string[];
  }
  return [];
}

const TABLE_NAME = process.env.TABLE_NAME || 'SpeakFlowSituations';
const API_KEY_VALUE = process.env.API_KEY_VALUE || 'sf_secret_key_default';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://sabamiso-lab.github.io,http://localhost:5173')
  .split(',')
  .map(o => o.trim());

interface APIGatewayEvent {
  headers?: Record<string, string | undefined>;
  httpMethod?: string;
  requestContext?: {
    http?: {
      method?: string;
    };
  };
}

export const handler = async (event: APIGatewayEvent) => {
  const headers = event.headers || {};
  
  // Normalize header keys to lowercase
  const normalizedHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      normalizedHeaders[key.toLowerCase()] = value;
    }
  }

  const origin = normalizedHeaders['origin'] || '';
  const referer = normalizedHeaders['referer'] || '';
  const apiKey = normalizedHeaders['x-speakflow-api-key'] || '';

  // Determine CORS Origin header
  const matchedOrigin = ALLOWED_ORIGINS.find(o => origin.startsWith(o) || referer.startsWith(o));
  const corsOriginHeader = matchedOrigin || ALLOWED_ORIGINS[0];

  const defaultResponseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': corsOriginHeader,
    'Access-Control-Allow-Headers': 'Content-Type,x-speakflow-api-key',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
  };

  const method = event.httpMethod || event.requestContext?.http?.method;
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: defaultResponseHeaders,
      body: JSON.stringify({ message: 'OK' }),
    };
  }

  // 1. API Key Check (Security Rule #3)
  if (!apiKey || apiKey !== API_KEY_VALUE) {
    return {
      statusCode: 403,
      headers: defaultResponseHeaders,
      body: JSON.stringify({ error: 'Forbidden: Invalid API Key' }),
    };
  }

  // 2. Origin / Referer Validation (Security Rule #2)
  const isAllowedOrigin = ALLOWED_ORIGINS.some(allowed => 
    origin.startsWith(allowed) || referer.startsWith(allowed)
  );

  if (!isAllowedOrigin && origin !== '' && referer !== '') {
    return {
      statusCode: 403,
      headers: defaultResponseHeaders,
      body: JSON.stringify({ error: 'Forbidden: Origin or Referer not allowed' }),
    };
  }

  try {
    const docClient = getDocClient();
    const command = new ScanCommand({ TableName: TABLE_NAME });
    const result = await docClient.send(command);

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const validItems = (result.Items || [])
      .filter((item) => !item.expiresAt || item.expiresAt > nowInSeconds)
      .map((item) => ({
        ...item,
        goals: parseGoals(item.goals),
      }));

    return {
      statusCode: 200,
      headers: defaultResponseHeaders,
      body: JSON.stringify({
        situations: validItems,
        count: validItems.length,
      }),
    };
  } catch (error) {
    console.error('Error fetching situations from DynamoDB:', error);
    return {
      statusCode: 500,
      headers: defaultResponseHeaders,
      body: JSON.stringify({ error: 'Failed to fetch situations from database' }),
    };
  }
};
