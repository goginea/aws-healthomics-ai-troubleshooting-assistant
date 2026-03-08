# HealthOmics AI Troubleshooter

AI-assisted troubleshooting for AWS HealthOmics genomic workflows with custom knowledge base support.

## Overview

The HealthOmics AI Troubleshooter is an intelligent troubleshooting system integrated into Kiro IDE that helps bioinformatics engineers diagnose and resolve AWS HealthOmics workflow failures through natural language queries. The system uses a specialized AI agent built on AWS Bedrock AgentCore with genomics domain knowledge to correlate data from AWS HealthOmics, CloudWatch, CloudTrail, and X-Ray, providing root cause analysis and actionable recommendations in seconds.

## Key Features

- **Natural Language Troubleshooting**: Ask questions like "Why did my workflow fail?" and get instant answers
- **AI-Powered Root Cause Analysis**: Automatically correlates data across multiple AWS services to identify failure reasons
- **Genomics Domain Expertise**: Understands bioinformatics tools (GATK, BWA-MEM2, Samtools) and workflow types (WGS, WES, RNA-Seq)
- **Actionable Recommendations**: Provides specific parameter values and configuration changes to fix issues
- **Turnkey Deployment**: One-command infrastructure deployment with automated IAM policy generation
- **Custom Knowledge Base**: Ingest your organization's documentation and historical troubleshooting data
- **Real-Time Analysis**: Get troubleshooting results in 5-30 seconds, not hours
- **Multi-Workflow Support**: Troubleshoot Nextflow, WDL, and CWL workflows

## How It Complements AWS Monitoring

AWS provides a monitoring solution for HealthOmics workflows (see [AWS blog post](https://aws.amazon.com/blogs/industries/enhance-monitoring-and-observability-for-aws-healthomics-workflows/)) that focuses on organization-wide dashboards and historical trends.

This Power complements that solution by providing:

- **Real-time interactive troubleshooting** vs passive monitoring
- **Conversational AI interface** vs dashboard visualization
- **Individual failure diagnosis** vs organizational trends
- **Immediate actionable fixes** vs historical analysis

Think of it as: AWS monitoring shows "what failed across my organization" while this Power answers "why did this specific run fail and how do I fix it?"

## Prerequisites

### Required Kiro Powers

This Power depends on the following Powers (you'll be prompted to install them):

- **aws-healthomics** (>=1.0.0): Provides HealthOmics API access for workflow run data
- **aws-observability** (>=1.0.0): Provides CloudWatch, CloudTrail, and X-Ray integration
- **aws-agentcore** (>=1.0.0): Provides AgentCore agent deployment and management capabilities
- **iam-policy-autopilot-power** (>=1.0.0): Automates IAM policy generation and deployment
- **aws-infrastructure-as-code** (>=1.0.0): Provides CDK deployment and validation capabilities

### Optional Enhancements

- **future-genomics-analytics-power**: Advanced variant analysis and population genetics insights
- **future-cost-optimization-power**: Spot instance recommendations and resource right-sizing

### AWS Requirements

- AWS Account with access to:
  - AWS HealthOmics
  - AWS Bedrock (for AgentCore)
  - CloudWatch Logs, Metrics, and Alarms
  - CloudTrail
  - X-Ray / Application Signals
  - S3 (for manifest logs)
- IAM permissions to deploy infrastructure (or use the automated IAM Policy Autopilot)

## Quick Start

### Installation

1. Install the Power from Kiro Powers marketplace
2. When prompted, install required dependency Powers
3. Follow the Setup Wizard to configure your environment:
   - Select AWS region
   - Configure S3 bucket for logs
   - Set notification preferences
   - Deploy infrastructure with one click
   - Generate and deploy IAM policies automatically

### First Query

After setup, try these example queries:

```
"What's the status of my latest workflow run?"
"Why did workflow run omics-abc123 fail?"
"Show me resource utilization for run omics-abc123"
"What IAM permissions are missing for my failed run?"
```

## Usage

### Basic Troubleshooting

1. Open Kiro IDE and activate the HealthOmics AI Troubleshooter Power
2. Ask a question in natural language about your workflow
3. The AI agent will:
   - Retrieve data from HealthOmics and observability services
   - Analyze the failure and identify root causes
   - Provide specific recommendations with parameter values
   - Link to relevant workflow definition files

### Custom Knowledge Base

Add your organization's documentation to improve recommendations:

1. Open the Knowledge Base Manager UI
2. Add data sources:
   - SharePoint document libraries
   - Confluence spaces
   - Internal wikis
   - Historical troubleshooting logs
   - File systems or S3 buckets
3. The agent will automatically index and use this knowledge in future queries

### Shared Team Deployment

Deploy a single agent instance for your entire team:

1. Use the CDK template export feature
2. Deploy to a shared AWS account
3. Team members can access the same agent with isolated conversation contexts
4. Track usage metrics and common failure patterns across the team

## Architecture

The system consists of:

- **AgentCore Layer**: Specialized bioinformatics AI agent with genomics knowledge
- **Powers Layer**: HealthOmics and Observability Powers for data retrieval
- **Analysis Layer**: Root cause analyzer and recommendation engine
- **Infrastructure Layer**: Automated CDK deployment with IAM policy management

## Configuration

Configuration is managed through the Setup Wizard, but you can also manually configure:

```typescript
// Example configuration
{
  region: "us-east-1",
  s3BucketName: "my-healthomics-logs",
  agentName: "HealthOmicsWorkflowTroubleshooter",
  notificationPreferences: {
    enableProactiveAlerts: true,
    criticalityThreshold: "HIGH"
  }
}
```

## Troubleshooting

### Common Issues

**Missing IAM Permissions**

- The system will detect missing permissions and provide exact policy statements needed
- Use IAM Policy Autopilot to automatically generate and deploy policies

**Agent Not Responding**

- Check AWS Bedrock service availability in your region
- Verify AgentCore agent is deployed and active
- Check CloudWatch Logs for agent execution errors

**Data Retrieval Failures**

- Verify HealthOmics workflow run ID is correct
- Check S3 bucket permissions for manifest logs
- Ensure CloudWatch log groups exist for the workflow

## Contributing

This is an open-source project. Contributions are welcome!

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.

## Support

- GitHub Issues: Report bugs and request features
- Documentation: See [docs/](./docs/) for detailed guides
- AWS Samples: Part of the aws-samples community

## Related Resources

- [AWS HealthOmics Documentation](https://docs.aws.amazon.com/omics/)
- [AWS Bedrock AgentCore Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)
- [Kiro IDE Documentation](https://kiro.dev)
- [AWS Enhanced Monitoring Blog Post](https://aws.amazon.com/blogs/industries/enhance-monitoring-and-observability-for-aws-healthomics-workflows/)
