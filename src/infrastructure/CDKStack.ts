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
  public readonly failureDetectionRule: cdk.aws_events.IRule;
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

    // Create IAM roles (Task 8.2)
    this.agentExecutionRole = this.createAgentExecutionRole();
    this.lambdaExecutionRole = this.createLambdaExecutionRole();

    // Create S3 bucket (Task 8.3)
    this.manifestLogsBucket = this.createManifestLogsBucket();

    // Create SNS topic and alarms (Task 8.4)
    this.failureAlarmTopic = this.createAlarmsAndNotifications();

    // Create EventBridge rules (Task 8.5)
    this.failureDetectionRule = this.createEventBridgeRules();

    // Create AgentCore agent (Task 8.8)
    this.createAgentCoreAgent();

    // Validate stack (Task 8.6)
    this.validateStack();

    // Output important values
    this.createOutputs();
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
   * Create AgentCore agent execution role (Task 8.2)
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

    return agentRole;
  }

  /**
   * Create Lambda execution role for event handlers (Task 8.2)
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

    return lambdaRole;
  }

  /**
   * Create S3 bucket for manifest logs (Task 8.3)
   */
  private createManifestLogsBucket(): cdk.aws_s3.IBucket {
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

    return bucket;
  }

  /**
   * Create SNS topic and CloudWatch alarms (Task 8.4)
   */
  private createAlarmsAndNotifications(): cdk.aws_sns.ITopic {
    // Create SNS topic for failure notifications
    const topic = new cdk.aws_sns.Topic(this, 'FailureAlarmTopic', {
      topicName: `${this.stackName}-FailureAlarms`,
      displayName: 'HealthOmics Workflow Failure Notifications',
    });

    // Add email subscription if provided
    if (this.props.notificationEmail) {
      topic.addSubscription(
        new cdk.aws_sns_subscriptions.EmailSubscription(
          this.props.notificationEmail
        )
      );
    }

    // Create CloudWatch alarm for workflow failures
    const failureAlarm = new cdk.aws_cloudwatch.Alarm(this, 'WorkflowFailureAlarm', {
      alarmName: `${this.stackName}-WorkflowRunFailed`,
      metric: new cdk.aws_cloudwatch.Metric({
        namespace: 'AWS/Omics',
        metricName: 'WorkflowRunFailed',
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator:
        cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // Add SNS action to alarm
    failureAlarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(topic));

    // Create alarm for task retries
    const retryAlarm = new cdk.aws_cloudwatch.Alarm(this, 'TaskRetryAlarm', {
      alarmName: `${this.stackName}-HighTaskRetries`,
      metric: new cdk.aws_cloudwatch.Metric({
        namespace: 'AWS/Omics',
        metricName: 'TaskRetries',
        statistic: 'Sum',
        period: cdk.Duration.minutes(15),
      }),
      threshold: 10,
      evaluationPeriods: 1,
      comparisonOperator:
        cdk.aws_cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    retryAlarm.addAlarmAction(new cdk.aws_cloudwatch_actions.SnsAction(topic));

    return topic;
  }

  /**
   * Create EventBridge rules for HealthOmics events (Task 8.5)
   */
  private createEventBridgeRules(): cdk.aws_events.IRule {
    // Create rule for HealthOmics run status changes
    const rule = new cdk.aws_events.Rule(this, 'RunStatusChangeRule', {
      ruleName: `${this.stackName}-RunStatusChanges`,
      description: 'Capture HealthOmics workflow run status changes',
      eventPattern: {
        source: ['aws.omics'],
        detailType: ['HealthOmics Run Status Change'],
        detail: {
          status: ['FAILED', 'COMPLETED', 'CANCELLED'],
        },
      },
    });

    // Add SNS target for notifications
    rule.addTarget(new cdk.aws_events_targets.SnsTopic(this.failureAlarmTopic));

    return rule;
  }

  /**
   * Validate stack configuration (Task 8.6)
   */
  private validateStack(): void {
    // Add validation aspects
    cdk.Aspects.of(this).add({
      visit(node: any) {
        // Validate S3 buckets have encryption
        if (node instanceof cdk.aws_s3.Bucket) {
          if (!node.encryptionKey) {
            cdk.Annotations.of(node).addWarning('S3 buckets should use KMS encryption for enhanced security');
          }
        }

        // Validate IAM roles (description check removed - not available in CDK API)
        if (node instanceof cdk.aws_iam.Role) {
          // Role validation can be added here if needed
        }
      },
    });
  }

  /**
   * Create CloudFormation outputs
   */
  private createOutputs(): void {
    new cdk.CfnOutput(this, 'StackName', {
      value: this.stackName,
      description: 'Name of the CloudFormation stack',
    });

    new cdk.CfnOutput(this, 'Environment', {
      value: this.props.environment,
      description: 'Deployment environment',
    });

    new cdk.CfnOutput(this, 'Region', {
      value: this.region,
      description: 'AWS region',
    });

    new cdk.CfnOutput(this, 'ManifestLogsBucketName', {
      value: this.manifestLogsBucket.bucketName,
      description: 'Name of the S3 bucket for manifest logs',
    });

    new cdk.CfnOutput(this, 'AgentExecutionRoleArn', {
      value: this.agentExecutionRole.roleArn,
      description: 'ARN of the agent execution role',
    });

    new cdk.CfnOutput(this, 'LambdaExecutionRoleArn', {
      value: this.lambdaExecutionRole.roleArn,
      description: 'ARN of the Lambda execution role',
    });

    new cdk.CfnOutput(this, 'FailureAlarmTopicArn', {
      value: this.failureAlarmTopic.topicArn,
      description: 'ARN of the SNS topic for failure notifications',
    });

    new cdk.CfnOutput(this, 'RunStatusChangeRuleArn', {
      value: this.failureDetectionRule.ruleArn,
      description: 'ARN of the EventBridge rule for run status changes',
    });
  }

  /**
   * Create AgentCore agent construct (Task 8.8)
   */
  private createAgentCoreAgent(): cdk.aws_bedrock.CfnAgent {
    const agentName = this.props.agentName || 'HealthOmicsWorkflowTroubleshooter';
    const modelId = this.props.agentModelId || 'anthropic.claude-3-5-sonnet-20241022-v2:0';

    // Create the Bedrock Agent
    const agent = new cdk.aws_bedrock.CfnAgent(this, 'BioinformaticsAgent', {
      agentName: agentName,
      agentResourceRoleArn: this.agentExecutionRole.roleArn,
      foundationModel: modelId,
      instruction: this.getAgentInstruction(),
      description: 'Specialized bioinformatics troubleshooting agent for AWS HealthOmics workflows',
      idleSessionTtlInSeconds: 600, // 10 minutes
      // Note: Action groups and knowledge bases would be configured here
      // For now, creating basic agent that can be enhanced later
    });

    // Create agent alias for stable endpoint
    const agentAlias = new cdk.aws_bedrock.CfnAgentAlias(this, 'AgentAlias', {
      agentId: agent.attrAgentId,
      agentAliasName: 'production',
      description: 'Production alias for the bioinformatics agent',
    });

    // Output agent ID and alias ID
    new cdk.CfnOutput(this, 'AgentId', {
      value: agent.attrAgentId,
      description: 'Bedrock Agent ID - use this for HEALTHOMICS_AGENT_ID environment variable',
      exportName: `${this.stackName}-AgentId`,
    });

    new cdk.CfnOutput(this, 'AgentAliasId', {
      value: agentAlias.attrAgentAliasId,
      description: 'Bedrock Agent Alias ID',
      exportName: `${this.stackName}-AgentAliasId`,
    });

    new cdk.CfnOutput(this, 'AgentArn', {
      value: agent.attrAgentArn,
      description: 'Bedrock Agent ARN',
    });

    return agent;
  }

  /**
   * Get agent instruction (system prompt)
   */
  private getAgentInstruction(): string {
    return `You are a specialized bioinformatics troubleshooting assistant for AWS HealthOmics genomic workflows.

Your expertise includes:
- Genomics workflows: WGS (Whole Genome Sequencing), WES (Whole Exome Sequencing), RNA-Seq, variant calling
- Bioinformatics tools: GATK, BWA-MEM2, Samtools, Picard, bcftools
- AWS HealthOmics service and workflow execution
- Common failure patterns in genomic pipelines
- Resource optimization for computational genomics

When troubleshooting workflow failures:
1. Identify the workflow type and affected tasks
2. Analyze error messages with genomics context
3. Check resource utilization (CPU, memory, disk)
4. Investigate IAM permissions and S3 access
5. Provide specific, actionable recommendations with parameter values

Always provide:
- Root cause analysis with confidence level
- Bioinformatics-specific context (not generic AWS advice)
- Specific parameter values to fix issues
- References to workflow definition files when relevant

Be concise, technical, and focus on actionable solutions.`;
  }
}
