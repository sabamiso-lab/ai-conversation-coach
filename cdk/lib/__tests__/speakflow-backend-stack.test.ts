import { describe, it, expect } from 'vitest';
import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { SpeakFlowBackendStack } from '../speakflow-backend-stack';

describe('SpeakFlowBackendStack CDK Infrastructure', () => {
  const app = new cdk.App();
  const stack = new SpeakFlowBackendStack(app, 'TestSpeakFlowStack', {
    apiKeyValue: 'test_secret_key_123',
    allowedOrigins: ['https://example.com'],
  });
  const template = Template.fromStack(stack);

  it('synthesizes DynamoDB table with PAY_PER_REQUEST, partitionKey, and TTL', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'SpeakFlowSituations',
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
      TimeToLiveSpecification: {
        AttributeName: 'expiresAt',
        Enabled: true,
      },
    });
  });

  it('creates GetSituations Lambda function with correct runtime and environment variables', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'SpeakFlowGetSituations',
      Runtime: 'nodejs24.x',
      Handler: 'index.handler',
      Timeout: 10,
      Environment: {
        Variables: {
          API_KEY_VALUE: 'test_secret_key_123',
          ALLOWED_ORIGINS: 'https://example.com',
        },
      },
    });
  });

  it('creates CreateSituation Lambda function with correct runtime and environment variables', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'SpeakFlowCreateSituation',
      Runtime: 'nodejs24.x',
      Handler: 'index.handler',
      Timeout: 10,
      Environment: {
        Variables: {
          API_KEY_VALUE: 'test_secret_key_123',
          ALLOWED_ORIGINS: 'https://example.com',
        },
      },
    });
  });

  it('creates HTTP API Gateway with configured CORS preflight', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      Name: 'SpeakFlowAPI',
      CorsConfiguration: {
        AllowOrigins: ['https://example.com'],
        AllowHeaders: Match.arrayWith(['Content-Type', 'x-speakflow-api-key']),
        AllowMethods: Match.arrayWith(['GET', 'POST', 'OPTIONS']),
      },
    });
  });

  it('creates GET and POST /situations routes on API Gateway', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'GET /situations',
    });

    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'POST /situations',
    });
  });

  it('grants appropriate DynamoDB permissions via IAM policies to Lambda functions', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              'dynamodb:BatchGetItem',
              'dynamodb:GetItem',
              'dynamodb:Scan',
            ]),
            Effect: 'Allow',
          }),
        ]),
      },
    });

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith([
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
            ]),
            Effect: 'Allow',
          }),
        ]),
      },
    });
  });
});
