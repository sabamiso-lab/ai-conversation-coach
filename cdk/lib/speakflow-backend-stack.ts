import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejsLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigw2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as path from 'path';
import { SITUATIONS, Situation } from '../../src/data/situations';

export interface SpeakFlowBackendStackProps extends cdk.StackProps {
  apiKeyValue?: string;
  allowedOrigins?: string[];
}

export class SpeakFlowBackendStack extends cdk.Stack {
  public readonly apiUrl: string;
  public readonly apiKeyValue: string;

  constructor(scope: Construct, id: string, props?: SpeakFlowBackendStackProps) {
    super(scope, id, props);

    this.apiKeyValue = props?.apiKeyValue || 'sf_secret_key_speakflow_2026';
    const allowedOrigins = props?.allowedOrigins || [
      'https://sabamiso-lab.github.io',
      'http://localhost:5173',
      'http://localhost:4173',
    ];

    // 1. DynamoDB Table for Situations
    const situationsTable = new dynamodb.Table(this, 'SituationsTable', {
      tableName: 'SpeakFlowSituations',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: 'expiresAt',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to RETAIN for production if needed
    });

    // 2. Lambda Function to Get Situations
    const getSituationsFunction = new nodejsLambda.NodejsFunction(this, 'GetSituationsFunction', {
      functionName: 'SpeakFlowGetSituations',
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/getSituations.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: situationsTable.tableName,
        API_KEY_VALUE: this.apiKeyValue,
        ALLOWED_ORIGINS: allowedOrigins.join(','),
      },
      timeout: cdk.Duration.seconds(10),
    });

    // Grant DynamoDB Read permission to GetSituations Lambda
    situationsTable.grantReadData(getSituationsFunction);

    // 2b. Lambda Function to Create a Situation
    const createSituationFunction = new nodejsLambda.NodejsFunction(this, 'CreateSituationFunction', {
      functionName: 'SpeakFlowCreateSituation',
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/createSituation.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: situationsTable.tableName,
        API_KEY_VALUE: this.apiKeyValue,
        ALLOWED_ORIGINS: allowedOrigins.join(','),
      },
      timeout: cdk.Duration.seconds(10),
    });

    // Grant DynamoDB Read/Write permission to CreateSituation Lambda
    situationsTable.grantReadWriteData(createSituationFunction);

    // 3. API Gateway (HTTP API)
    const httpApi = new apigw2.HttpApi(this, 'SpeakFlowHttpApi', {
      apiName: 'SpeakFlowAPI',
      description: 'API Gateway for SpeakFlow AI Conversation Coach',
      corsPreflight: {
        allowOrigins: allowedOrigins,
        allowHeaders: ['Content-Type', 'x-speakflow-api-key'],
        allowMethods: [
          apigw2.CorsHttpMethod.GET,
          apigw2.CorsHttpMethod.POST,
          apigw2.CorsHttpMethod.OPTIONS,
        ],
      },
    });

    // Integrations
    const getLambdaIntegration = new apigw2Integrations.HttpLambdaIntegration(
      'GetSituationsIntegration',
      getSituationsFunction
    );

    const createLambdaIntegration = new apigw2Integrations.HttpLambdaIntegration(
      'CreateSituationIntegration',
      createSituationFunction
    );

    // Add Route GET /situations
    httpApi.addRoutes({
      path: '/situations',
      methods: [apigw2.HttpMethod.GET],
      integration: getLambdaIntegration,
    });

    // Add Route POST /situations
    httpApi.addRoutes({
      path: '/situations',
      methods: [apigw2.HttpMethod.POST],
      integration: createLambdaIntegration,
    });

    this.apiUrl = httpApi.apiEndpoint;

    // 4. Custom Resource to Seed Initial Situations into DynamoDB on deploy
    const seedData = SITUATIONS.map((sit: Situation) => ({
      id: { S: sit.id },
      title: { S: sit.title },
      titleJa: { S: sit.titleJa },
      category: { S: sit.category },
      icon: { S: sit.icon },
      difficulty: { S: sit.difficulty },
      systemRole: { S: sit.systemRole },
      userRole: { S: sit.userRole },
      description: { S: sit.description },
      descriptionJa: { S: sit.descriptionJa },
      initialMessage: { S: sit.initialMessage },
      initialMessageJa: { S: sit.initialMessageJa },
      goals: { SS: sit.goals },
    }));

    const seedCustomResource = new cr.AwsCustomResource(this, 'SeedSituationsData', {
      onCreate: {
        service: 'DynamoDB',
        action: 'batchWriteItem',
        parameters: {
          RequestItems: {
            [situationsTable.tableName]: seedData.map(item => ({
              PutRequest: { Item: item }
            }))
          }
        },
        physicalResourceId: cr.PhysicalResourceId.of('SeedSituationsDataInitial')
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [situationsTable.tableArn]
      })
    });

    seedCustomResource.node.addDependency(situationsTable);

    // 5. Outputs
    new cdk.CfnOutput(this, 'ApiEndpointUrl', {
      value: `${httpApi.apiEndpoint}/situations`,
      description: 'API Gateway Endpoint URL for Situations',
      exportName: 'SpeakFlowApiEndpointUrl',
    });

    new cdk.CfnOutput(this, 'ApiKeyHeaderValue', {
      value: this.apiKeyValue,
      description: 'API Key Value required in x-speakflow-api-key header',
      exportName: 'SpeakFlowApiKeyHeaderValue',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: situationsTable.tableName,
      description: 'DynamoDB Table Name',
      exportName: 'SpeakFlowDynamoDBTableName',
    });
  }
}
