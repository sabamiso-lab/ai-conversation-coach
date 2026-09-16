import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejsLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigw2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as path from 'path';

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

    // Grant DynamoDB Read permission to Lambda
    situationsTable.grantReadData(getSituationsFunction);

    // 3. API Gateway (HTTP API)
    const httpApi = new apigw2.HttpApi(this, 'SpeakFlowHttpApi', {
      apiName: 'SpeakFlowAPI',
      description: 'API Gateway for SpeakFlow AI Conversation Coach',
      corsPreflight: {
        allowOrigins: allowedOrigins,
        allowHeaders: ['Content-Type', 'x-speakflow-api-key'],
        allowMethods: [
          apigw2.CorsHttpMethod.GET,
          apigw2.CorsHttpMethod.OPTIONS,
        ],
      },
    });

    // Integration
    const lambdaIntegration = new apigw2Integrations.HttpLambdaIntegration(
      'GetSituationsIntegration',
      getSituationsFunction
    );

    // Add Route GET /situations
    httpApi.addRoutes({
      path: '/situations',
      methods: [apigw2.HttpMethod.GET],
      integration: lambdaIntegration,
    });

    this.apiUrl = httpApi.apiEndpoint;

    // 4. Custom Resource to Seed Initial Situations into DynamoDB on deploy
    const seedData = [
      {
        id: { S: 'cafe-order' },
        title: { S: 'Cafe Coffee Order' },
        titleJa: { S: 'カフェでの注文' },
        category: { S: 'Daily' },
        icon: { S: 'Coffee' },
        difficulty: { S: 'Beginner' },
        systemRole: { S: 'Friendly Barista at "Green Mountain Coffee"' },
        userRole: { S: 'Customer wanting to order a coffee and a pastry' },
        description: { S: 'Order your favorite drink, specify size/milk preference, and pay.' },
        descriptionJa: { S: 'お気に入りのドリンクの注文、ミルクやサイズの指定、会計を行います。' },
        initialMessage: { S: 'Hi there! Welcome to Green Mountain Coffee. What can I get started for you today?' },
        goals: { SS: ['Order a drink with specific modifications (e.g. oat milk, extra shot)', 'Order something to eat', 'Ask for the price and pay'] }
      },
      {
        id: { S: 'airport-checkin' },
        title: { S: 'Airport Check-In' },
        titleJa: { S: '空港でのチェックイン' },
        category: { S: 'Travel' },
        icon: { S: 'Plane' },
        difficulty: { S: 'Beginner' },
        systemRole: { S: 'Airline Gate Agent at SkyWay Airlines' },
        userRole: { S: 'Passenger checking in for an international flight to New York' },
        description: { S: 'Show your passport, check your luggage, and request a window seat.' },
        descriptionJa: { S: 'パスポートの提示、受託手荷物の預け入れ、座席（窓側など）のリクエストを行います。' },
        initialMessage: { S: 'Good morning! Welcome to SkyWay Airlines. May I see your passport and booking reference, please?' },
        goals: { SS: ['Present passport and booking details', 'Check in luggage', 'Request seat preference (Window or Aisle)'] }
      },
      {
        id: { S: 'hotel-checkin' },
        title: { S: 'Hotel Check-In & Request' },
        titleJa: { S: 'ホテルチェックインと要望' },
        category: { S: 'Travel' },
        icon: { S: 'Building' },
        difficulty: { S: 'Intermediate' },
        systemRole: { S: 'Front Desk Manager at Grand Horizon Hotel' },
        userRole: { S: 'Guest checking in and requesting a quiet high-floor room with extra towels' },
        description: { S: 'Complete check-in process, ask about breakfast time, and make special requests.' },
        descriptionJa: { S: 'チェックイン手続き、朝食時間・Wi-Fiパスワードの確認、高層階のリクエストを行います。' },
        initialMessage: { S: 'Welcome to the Grand Horizon Hotel. How may I assist you this afternoon?' },
        goals: { SS: ['Give reservation name & check-in', 'Inquire about breakfast hours and Wi-Fi', 'Request a high floor or quiet room'] }
      },
      {
        id: { S: 'business-meeting' },
        title: { S: 'Project Status Update' },
        titleJa: { S: 'ビジネスプロジェクト進捗会議' },
        category: { S: 'Business' },
        icon: { S: 'Briefcase' },
        difficulty: { S: 'Intermediate' },
        systemRole: { S: 'Project Manager (Alex) reviewing quarterly milestone progress' },
        userRole: { S: 'Lead Developer reporting progress and raising a small budget issue' },
        description: { S: 'Give a brief update on your tasks, discuss roadblocks, and negotiate timeline.' },
        descriptionJa: { S: '担当タスクの進捗報告、課題・ボトルネックの共有、スケジュール交渉を行います。' },
        initialMessage: { S: "Thanks for joining, everyone. Let's start with our tech status. Could you give us a quick update on your team's milestone?" },
        goals: { SS: ['Summarize recent accomplishments clearly', 'Explain a current technical issue or delay', 'Propose a practical timeline adjustment'] }
      },
      {
        id: { S: 'job-interview' },
        title: { S: 'Job Interview Simulation' },
        titleJa: { S: '英語ジョブインタビュー（採用面接）' },
        category: { S: 'Business' },
        icon: { S: 'Award' },
        difficulty: { S: 'Advanced' },
        systemRole: { S: 'Senior Hiring Manager evaluating a candidate for a Global Marketing/Tech Role' },
        userRole: { S: 'Job Applicant highlighting experience, strengths, and handling behavioral questions' },
        description: { S: 'Answer background questions, explain a past challenge, and ask smart questions.' },
        descriptionJa: { S: '自己紹介、過去の困難の克服経験（STAR法）、逆質問に応答します。' },
        initialMessage: { S: "Thank you for coming in today. To kick things off, could you tell me a little bit about yourself and why you're interested in this position?" },
        goals: { SS: ['Give a concise 1-minute self-introduction', 'Describe a past challenge and how you solved it', 'Ask 1-2 insightful questions about team culture or strategy'] }
      },
      {
        id: { S: 'free-talk' },
        title: { S: 'Free Talk & Friendly Chat' },
        titleJa: { S: '自由なフリートーク' },
        category: { S: 'Casual' },
        icon: { S: 'MessageSquare' },
        difficulty: { S: 'Casual' },
        systemRole: { S: 'Friendly, encouraging conversational partner who loves travel, technology, movies, and food' },
        userRole: { S: 'Conversationalist sharing thoughts and asking questions' },
        description: { S: 'Enjoy open-ended conversation about your hobbies, weekend plans, or any topic.' },
        descriptionJa: { S: '趣味や旅行、映画、日常の出来事について自由にディスカッションします。' },
        initialMessage: { S: 'Hey there! Great to chat with you today. How has your week been going so far?' },
        goals: { SS: ['Share what you did recently or your weekend plans', 'Ask the AI a question about a favorite topic', 'Keep the conversation flowing smoothly'] }
      }
    ];

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
