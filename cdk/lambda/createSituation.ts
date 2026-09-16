import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

export function getDocClient() {
  const client = new DynamoDBClient({});
  return DynamoDBDocumentClient.from(client);
}

const TABLE_NAME = process.env.TABLE_NAME || 'SpeakFlowSituations';
const API_KEY_VALUE = process.env.API_KEY_VALUE || 'sf_secret_key_default';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://sabamiso-lab.github.io,http://localhost:5173')
  .split(',')
  .map(o => o.trim());

interface APIGatewayEvent {
  headers?: Record<string, string | undefined>;
  httpMethod?: string;
  body?: string | null;
  requestContext?: {
    http?: {
      method?: string;
    };
  };
}

export interface SituationInput {
  id?: string;
  title: string;
  titleJa: string;
  category: string;
  icon?: string;
  difficulty: string;
  systemRole: string;
  userRole: string;
  description: string;
  descriptionJa: string;
  initialMessage: string;
  initialMessageJa?: string;
  goals: string[] | string;
  expiresAt?: number;
  isNews?: boolean;
  newsSource?: { title: string; url: string } | null;
  newsCategory?: string;
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
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };

  const method = event.httpMethod || event.requestContext?.http?.method;
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: defaultResponseHeaders,
      body: JSON.stringify({ message: 'OK' }),
    };
  }

  // 1. API Key Check
  if (!apiKey || apiKey !== API_KEY_VALUE) {
    return {
      statusCode: 403,
      headers: defaultResponseHeaders,
      body: JSON.stringify({ error: 'Forbidden: Invalid API Key' }),
    };
  }

  // 2. Origin / Referer Validation
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

  // 3. Parse Request Body
  if (!event.body) {
    return {
      statusCode: 400,
      headers: defaultResponseHeaders,
      body: JSON.stringify({ error: 'Bad Request: Missing request body' }),
    };
  }

  let data: SituationInput;
  try {
    data = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: defaultResponseHeaders,
      body: JSON.stringify({ error: 'Bad Request: Invalid JSON body' }),
    };
  }

  // 4. Validate Required Fields
  const requiredFields: (keyof SituationInput)[] = [
    'title',
    'titleJa',
    'category',
    'difficulty',
    'systemRole',
    'userRole',
    'description',
    'descriptionJa',
    'initialMessage',
  ];

  const missingFields = requiredFields.filter(field => !data[field] || String(data[field]).trim() === '');
  if (missingFields.length > 0) {
    return {
      statusCode: 400,
      headers: defaultResponseHeaders,
      body: JSON.stringify({
        error: `Bad Request: Missing required field(s): ${missingFields.join(', ')}`,
      }),
    };
  }

  // Parse goals array
  let goalsArray: string[] = [];
  if (Array.isArray(data.goals)) {
    goalsArray = data.goals.map(g => String(g).trim()).filter(Boolean);
  } else if (typeof data.goals === 'string') {
    goalsArray = data.goals.split('\n').map(g => g.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
  }

  if (goalsArray.length === 0) {
    return {
      statusCode: 400,
      headers: defaultResponseHeaders,
      body: JSON.stringify({ error: 'Bad Request: At least one goal is required' }),
    };
  }

  // Format Situation Item
  const situationId = data.id && data.id.trim() !== '' 
    ? data.id.trim() 
    : `custom-${Date.now()}`;

  const item = {
    id: situationId,
    title: data.title.trim(),
    titleJa: data.titleJa.trim(),
    category: data.category.trim(),
    icon: data.icon && data.icon.trim() !== '' ? data.icon.trim() : 'MessageSquare',
    difficulty: data.difficulty.trim(),
    systemRole: data.systemRole.trim(),
    userRole: data.userRole.trim(),
    description: data.description.trim(),
    descriptionJa: data.descriptionJa.trim(),
    initialMessage: data.initialMessage.trim(),
    initialMessageJa: data.initialMessageJa ? data.initialMessageJa.trim() : undefined,
    goals: goalsArray,
    createdAt: new Date().toISOString(),
    expiresAt: typeof data.expiresAt === 'number' ? data.expiresAt : undefined,
    isNews: Boolean(data.isNews),
    newsSource: data.newsSource || undefined,
    newsCategory: data.newsCategory || undefined,
  };

  try {
    const docClient = getDocClient();
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });
    await docClient.send(command);

    return {
      statusCode: 201,
      headers: defaultResponseHeaders,
      body: JSON.stringify({
        message: 'Situation registered successfully',
        situation: item,
      }),
    };
  } catch (error) {
    console.error('Error creating situation in DynamoDB:', error);
    return {
      statusCode: 500,
      headers: defaultResponseHeaders,
      body: JSON.stringify({ error: 'Failed to create situation in database' }),
    };
  }
};
