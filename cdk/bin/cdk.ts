#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SpeakFlowBackendStack } from '../lib/speakflow-backend-stack';

const app = new cdk.App();

new SpeakFlowBackendStack(app, 'SpeakFlowBackendStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
  },
  description: 'Backend infrastructure for SpeakFlow AI Conversation Coach (DynamoDB, Lambda, API Gateway)',
});
