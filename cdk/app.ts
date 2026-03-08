#!/usr/bin/env node
// CDK app entry point

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HealthOmicsAITroubleshooterStack } from '../src/infrastructure/CDKStack';

const app = new cdk.App();

// Get parameters from context or use defaults
const environment = app.node.tryGetContext('environment') || 'dev';
const notificationEmail = app.node.tryGetContext('notificationEmail');
const manifestLogsBucketName = app.node.tryGetContext('manifestLogsBucketName');

new HealthOmicsAITroubleshooterStack(app, 'HealthOmicsAITroubleshooterStack', {
  environment: environment as 'dev' | 'staging' | 'production',
  notificationEmail,
  manifestLogsBucketName,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});

app.synth();
