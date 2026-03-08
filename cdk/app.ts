#!/usr/bin/env node
// CDK app entry point
// To be implemented in Phase 1

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
// import { HealthOmicsAITroubleshooterStack } from '../src/infrastructure/CDKStack';

const app = new cdk.App();

// Stack will be instantiated in Task 2
// new HealthOmicsAITroubleshooterStack(app, 'HealthOmicsAITroubleshooterStack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
//   },
// });

app.synth();
