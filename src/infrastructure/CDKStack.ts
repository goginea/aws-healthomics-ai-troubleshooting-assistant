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
  public readonly failureAlarmTopic: cdk.aws_sns.ITopic;

  constructor(
    scope: Construct,
    id: string,
    props: HealthOmicsAITroubleshooterStackProps
  ) {
    super(scope, id, props);

    // Apply tags to all resources
    this.applyTags(props);

    // Create placeholder resources (will be implemented in subtasks)
    this.manifestLogsBucket = this.createPlaceholderBucket();
    this.agentExecutionRole = this.createPlaceholderRole();
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
   * Create placeholder S3 bucket (will be implemented in Task 8.3)
   */
  private createPlaceholderBucket(): cdk.aws_s3.IBucket {
    return cdk.aws_s3.Bucket.fromBucketName(
      this,
      'PlaceholderBucket',
      'placeholder-bucket'
    );
  }

  /**
   * Create placeholder IAM role (will be implemented in Task 8.2)
   */
  private createPlaceholderRole(): cdk.aws_iam.IRole {
    return cdk.aws_iam.Role.fromRoleName(
      this,
      'PlaceholderRole',
      'placeholder-role'
    );
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
