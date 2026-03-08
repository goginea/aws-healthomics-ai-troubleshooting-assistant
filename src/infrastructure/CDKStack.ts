/**
 * HealthOmics AI Troubleshooter CDK Stack
 *
 * Defines infrastructure for the genomic workflow observability system
 */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface HealthOmicsAITroubleshooterStackProps extends cdk.StackProps {
  // Environment configuration
  environment: 'dev' | 'staging' | 'production';
  
  // S3 configuration
  manifestLogsBucketName?: string;
  
  // Notification configuration
  notificationEmail?: string;
  
  // Agent configuration
  agentName?: string;
  agentModelId?: string;
  
  // Tagging
  projectName?: string;
  costCenter?: string;
}

/**
 * Main CDK stack for HealthOmics AI Troubleshooter
 */
export class HealthOmicsAITroubleshooterStack extends cdk.Stack {
  public readonly manifestLogsBucket: cdk.aws_s3.IBucket;
  public readonly agentExecutionRole: cdk.aws_iam.IRole;
  public readonly lambdaExecutionRole: cdk.aws_iam.IRole;
  public readonly failureAlarmTopic: cdk.aws_sns.ITopic;
  private readonly props: HealthOmicsAITroubleshooterStackProps;

  constructor(
    scope: Construct,
    id: string,
    props: HealthOmicsAITroubleshooterStackProps
  ) {
    super(scope, id, props);
    this.props = props;

    // Apply tags to all resources
    this.applyTags(props);

    // Create IAM roles
    this.agentExecutionRole = this.createAgentExecutionRole();
    this.lambdaExecutionRole = this.createLambdaExecutionRole();

    // Create S3 bucket
    this.manifestLogsBucket = this.createPlaceholderBucket();

    // Create placeholder resources (will be implemented in subtasks)
    this.failureAlarmTopic = this.createPlaceholderTopic();

    // Output important values
    new cdk.CfnOutput(this, 'StackName', {
      value: this.stackName,
      description: 'Name of the CloudFormation stack',
    });

    new cdk.CfnOutput(this, 'Environment', {
      value: props.environment,
      description: 'Deployment environment',
    });

    new cdk.CfnOutput(this, 'Region', {
      value: this.region,
      description: 'AWS region',
    });
  }

  /**
   * Apply tags to all resources in the stack
   */
  private applyTags(props: HealthOmicsAITroubleshooterStackProps): void {
    cdk.Tags.of(this).add('Project', props.projectName || 'HealthOmicsAITroubleshooter');
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
    
    if (props.costCenter) {
      cdk.Tags.of(this).add('CostCenter', props.costCenter);
    }
  }

  /**
   * Create S3 bucket for manifest logs
   */
  private createPlaceholderBucket(): cdk.aws_s3.IBucket {
    const bucketName =
      this.props.manifestLogsBucketName ||
      `${this.stackName.toLowerCase()}-manifest-logs-${this.account}`;

    const bucket = new cdk.aws_s3.Bucket(this, 'ManifestLogsBucket', {
      bucketName,
      encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      lifecycleRules: [
        {
          id: 'DeleteOldLogs',
          expiration: cdk.Duration.days(90),
          transitions: [
            {
              storageClass: cdk.aws_s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(30),
            },
          ],
        },
      ],
      removalPolicy:
        this.props.environment === 'production'
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: this.props.environment !== 'production',
    });

    // Grant HealthOmics service access
    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        principals: [new cdk.aws_iam.ServicePrincipal('omics.amazonaws.com')],
        actions: ['s3:PutObject', 's3:PutObjectAcl'],
        resources: [`${bucket.bucketArn}/*`],
      })
    );

    // Grant agent role read access
    bucket.grantRead(this.agentExecutionRole);

    // Output bucket name
    new cdk.CfnOutput(this, 'ManifestLogsBucketName', {
      value: bucket.bucketName,
      description: 'Name of the S3 bucket for manifest logs',
    });

    return bucket;
  }

  /**
   * Create AgentCore agent execution role
   */
  private createAgentExecutionRole(): cdk.aws_iam.IRole {
    const agentRole = new cdk.aws_iam.Role(this, 'AgentExecutionRole', {
      roleName: `${this.stackName}-AgentExecutionRole`,
      assumedBy: new cdk.aws_iam.ServicePrincipal('bedrock.amazonaws.com'),
      description: 'Execution role for HealthOmics AI Troubleshooter agent',
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsReadOnlyAccess'),
      ],
    });

    // Add inline policies for HealthOmics access
    agentRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          'omics:GetRun',
          'omics:ListRunTasks',
          'omics:GetRunTask',
        ],
        resources: ['*'],
      })
    );

    // Add CloudTrail access
    agentRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ['cloudtrail:LookupEvents'],
        resources: ['*'],
      })
    );

    // Add X-Ray access
    agentRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          'xray:GetTraceSummaries',
          'xray:GetTraceGraph',
        ],
        resources: ['*'],
      })
    );

    // Output role ARN
    new cdk.CfnOutput(this, 'AgentExecutionRoleArn', {
      value: agentRole.roleArn,
      description: 'ARN of the agent execution role',
    });

    return agentRole;
  }

  /**
   * Create Lambda execution role for event handlers
   */
  private createLambdaExecutionRole(): cdk.aws_iam.IRole {
    const lambdaRole = new cdk.aws_iam.Role(this, 'LambdaExecutionRole', {
      roleName: `${this.stackName}-LambdaExecutionRole`,
      assumedBy: new cdk.aws_iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Execution role for failure detection Lambda functions',
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    });

    // Add HealthOmics access for failure detection
    lambdaRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ['omics:GetRun'],
        resources: ['*'],
      })
    );

    // Add SNS publish for notifications
    lambdaRole.addToPolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ['sns:Publish'],
        resources: ['*'],
      })
    );

    // Output role ARN
    new cdk.CfnOutput(this, 'LambdaExecutionRoleArn', {
      value: lambdaRole.roleArn,
      description: 'ARN of the Lambda execution role',
    });

    return lambdaRole;
  }

  /**
   * Create placeholder SNS topic (will be implemented in Task 8.4)
   */
  private createPlaceholderTopic(): cdk.aws_sns.ITopic {
    return cdk.aws_sns.Topic.fromTopicArn(
      this,
      'PlaceholderTopic',
      'arn:aws:sns:us-east-1:123456789012:placeholder-topic'
    );
  }
}
