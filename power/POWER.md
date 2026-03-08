---
name: 'healthomics-ai-troubleshooter'
displayName: 'HealthOmics AI Troubleshooter'
description: 'AI-assisted troubleshooting for AWS HealthOmics genomic workflows. Specialized bioinformatics agent orchestrates existing AWS Powers to provide natural language troubleshooting with genomics domain expertise.'
keywords:
  [
    'healthomics',
    'genomics',
    'bioinformatics',
    'troubleshooting',
    'workflows',
    'aws',
    'observability',
  ]
author: 'Avinash Gogineni'
---

# HealthOmics AI Troubleshooter

Specialized bioinformatics AI agent that orchestrates AWS Powers for intelligent genomic workflow troubleshooting.

## Overview

The HealthOmics AI Troubleshooter is an **intelligent orchestration layer** that transforms how bioinformatics engineers troubleshoot AWS HealthOmics workflows. Instead of learning multiple Power APIs and manually correlating data, you ask natural language questions and a specialized AI agent with genomics domain knowledge orchestrates everything for you.

**What makes this Power unique:**

🧬 **Bioinformatics Intelligence** - Understands genomics terminology (WGS, WES, RNA-Seq, variant calling) and bioinformatics tools (GATK, BWA-MEM2, Samtools, Picard)

🤖 **Smart Orchestration** - Coordinates existing AWS Powers (HealthOmics, Observability, AgentCore) to answer complex questions with a single natural language query

📚 **Custom Knowledge Base** - Learns from your organization's runbooks and historical troubleshooting patterns using AgentCore Memory

🚀 **Turnkey Deployment** - One-click setup wizard with automated IAM policy generation and CDK infrastructure deployment

⚡ **Fast Results** - Get root cause analysis and actionable recommendations in 5-30 seconds

## How It Works: Orchestration Architecture

This Power **doesn't reimplement AWS APIs** - it orchestrates existing Powers with bioinformatics intelligence:

```
Your Question: "Why did my workflow fail?"
        ↓
Bioinformatics Agent (AgentCore)
        ↓
Orchestrates Multiple Powers:
├─→ aws-healthomics: DiagnoseAHORunFailure (comprehensive failure diagnosis)
├─→ aws-healthomics: AnalyzeAHORunPerformance (resource optimization)
├─→ aws-observability: audit_services (service health with root cause)
├─→ aws-observability: search_transaction_spans (100% trace visibility)
└─→ iam-policy-autopilot: generate_policy_for_access_denied (IAM fixes)
        ↓
Genomics Context Layer (Your Unique Value)
├─→ Interprets results with WGS/WES/RNA-Seq knowledge
├─→ Recognizes GATK/BWA-MEM2/Samtools error patterns
├─→ Applies organization-specific troubleshooting patterns
└─→ Generates bioinformatics-specific recommendations
        ↓
Actionable Answer with Specific Fixes
```

**Example:** When you ask "Why did my workflow fail?", the agent:

1. Calls HealthOmics Power's `DiagnoseAHORunFailure` tool
2. Enhances diagnosis with genomics knowledge (recognizes GATK OOM patterns)
3. Calls Observability Power's `audit_services` if deeper investigation needed
4. Applies your organization's historical troubleshooting patterns
5. Returns bioinformatics-specific recommendations

## What Existing Powers Already Provide

Understanding what's already available helps you appreciate this Power's orchestration value:

### aws-healthomics Power Already Has:

- ✅ `DiagnoseAHORunFailure` - Comprehensive failure diagnosis with logs and recommendations
- ✅ `AnalyzeAHORunPerformance` - Resource optimization with Run Analyzer data
- ✅ `GenerateAHORunTimeline` - Gantt chart visualization of task execution
- ✅ All log types (run logs, task logs, engine logs, manifest logs)
- ✅ Workflow and task management APIs

### aws-observability Power Already Has:

- ✅ `audit_services` - Multi-service health auditing with 7 auditor types
- ✅ `audit_slos` - SLO compliance monitoring with root cause analysis
- ✅ `search_transaction_spans` - 100% trace visibility (vs X-Ray's 5% sampling)
- ✅ `analyze_canary_failures` - Canary failure root cause investigation
- ✅ CloudTrail security auditing and change tracking

### What This Power Adds:

🎯 **Bioinformatics Intelligence Layer**

- Interprets results with genomics domain knowledge
- Recognizes workflow-type-specific patterns (WGS vs WES vs RNA-Seq)
- Understands bioinformatics tool error messages
- Provides genomics-specific recommendations

🎯 **Natural Language Orchestration**

- Single question → multiple Power tools coordinated automatically
- No need to learn individual Power APIs
- Contextual follow-up questions maintain conversation state

🎯 **Custom Knowledge Integration**

- Learns from your organization's runbooks and historical data
- Prioritizes org-specific patterns over generic advice
- Uses AgentCore Memory for persistent knowledge

🎯 **Simplified Setup**

- Setup wizard handles all configuration
- Automated IAM policy generation
- One-click CDK deployment

## Available MCP Tools

**This Power provides MCP tools for**:

- **query_agent** - Ask the bioinformatics agent questions about workflow failures (requires agent to be deployed first)
- **add_knowledge_source** - Add custom knowledge sources (SharePoint, Confluence, S3, file systems)

**Note:** Infrastructure deployment (CDK stack with AgentCore agent) must be done via `cdk deploy` command as shown in the Installation section. The MCP tools are for interacting with the deployed agent, not for deployment itself.

- **aws-healthomics** (awslabs.aws-healthomics-mcp-server)
- **aws-observability** (awslabs.cloudwatch-mcp-server, awslabs.cloudwatch-applicationsignals-mcp-server, awslabs.cloudtrail-mcp-server)
- **aws-agentcore** (agentcore-mcp-server)
- **iam-policy-autopilot-power** (iam-policy-autopilot-mcp)
- **aws-infrastructure-as-code** (awslabs.aws-iac-mcp-server)

**This Power orchestrates existing Powers' MCP servers**:

## Onboarding

### Prerequisites

**Required:**

- Kiro IDE installed
- **AWS credentials configured** (see AWS Credentials section below)
- AWS Account with access to:
  - AWS HealthOmics
  - AWS Bedrock (for AgentCore)
  - CloudWatch Logs, Metrics, and Alarms
  - CloudTrail
  - X-Ray / Application Signals
  - S3 (for manifest logs)
- Node.js >= 18.0.0 (for development)

**AWS Credentials:**

Before running the setup wizard, ensure AWS credentials are configured in Kiro. You have several options:

1. **AWS CLI Configuration** (Recommended):

   ```bash
   aws configure
   ```

   This creates `~/.aws/credentials` and `~/.aws/config` files that Kiro will use.

2. **Environment Variables**:

   ```bash
   export AWS_ACCESS_KEY_ID="your-access-key"
   export AWS_SECRET_ACCESS_KEY="your-secret-key"
   export AWS_REGION="us-east-1"
   ```

3. **AWS SSO** (for Amazon employees):
   ```bash
   aws sso login --profile your-profile
   ```

The setup wizard will validate your credentials in the first step and guide you if they're missing or invalid.

**Required Kiro Powers:**
These Powers must be installed (you'll be prompted during installation):

- **aws-healthomics** (>=1.0.0) - Provides `DiagnoseAHORunFailure`, `AnalyzeAHORunPerformance`, and all workflow APIs
- **aws-observability** (>=1.0.0) - Provides `audit_services`, `audit_slos`, `search_transaction_spans` for comprehensive analysis
- **aws-agentcore** (>=1.0.0) - Deploys the bioinformatics agent with Memory integration
- **iam-policy-autopilot-power** (>=1.0.0) - Generates IAM policies automatically
- **aws-infrastructure-as-code** (>=1.0.0) - Deploys CDK infrastructure

### Installation

1. **Install the Power:**
   - Open Kiro IDE
   - Click the Powers icon in the activity bar
   - Click "Add Custom Power"
   - Enter: `https://github.com/goginea/aws-healthomics-ai-troubleshooting-assistant/tree/main/power`
   - Click Add
   - When prompted, install required dependency Powers

2. **Install the npm package (required for deployment):**

   ```bash
   npm install -g healthomics-ai-troubleshooter
   ```

3. **Deploy AWS Infrastructure:**

   The Power includes CDK infrastructure that must be deployed to your AWS account:

   ```bash
   # Navigate to the package directory
   cd node_modules/healthomics-ai-troubleshooter

   # Deploy CDK stack
   npx cdk deploy \
     --context environment=production \
     --context notificationEmail=your-email@example.com \
     --context manifestLogsBucketName=my-healthomics-logs
   ```

   This deploys:
   - AgentCore bioinformatics agent to AWS Bedrock
   - IAM roles and policies
   - CloudWatch alarms for proactive failure detection
   - EventBridge rules for workflow status events
   - S3 buckets with lifecycle policies
   - Deployment takes 5-10 minutes

4. **Verify Deployment:**

   After CDK deployment completes, verify the agent is accessible:

   ```
   "Use query_agent from healthomics-ai-troubleshooter with query: test connection"
   ```

5. **Start Using:**
   - Ask natural language questions about your workflows
   - The agent orchestrates existing Powers automatically

### Advanced: Programmatic Access

For developers who want programmatic access to the libraries:

```bash
npm install healthomics-ai-troubleshooter
```

Then use in your code:

```typescript
import {
  SetupWizard,
  BioinformaticsAgent,
  KnowledgeBaseManager,
} from 'healthomics-ai-troubleshooter';

const wizard = new SetupWizard();
await wizard.start();
```

### Configuration

Configuration is managed through the Setup Wizard. The wizard will guide you through all required settings including AWS credentials validation, region selection, S3 bucket configuration, and notification preferences.

Manual configuration (if needed):

### Workflow 1: Check Workflow Run Status

**Goal:** Quickly check the status of a workflow run without navigating to the AWS Console.

**Steps:**

1. Open Kiro IDE and start a new conversation
2. Ask: "What's the status of workflow run omics-abc123?"
3. The agent will:
   - Retrieve run details from HealthOmics
   - Show status, start time, duration
   - Indicate if the run is still in progress or completed

**Example:**

```
You: "What's the status of my latest workflow run?"

Agent: "Your latest workflow run (omics-abc123) started at 2:30 PM and is currently RUNNING.
        It's been running for 45 minutes. The workflow type is Nextflow.

        Current progress: 12 of 15 tasks completed."
```

### Workflow 2: Diagnose Workflow Failure

**Goal:** Identify why a workflow failed and get specific recommendations to fix it.

**Steps:**

1. Ask: "Why did workflow run omics-abc123 fail?"
2. The agent will:
   - Retrieve run details and task information
   - Query CloudWatch Logs for error messages
   - Check CloudTrail for IAM permission denials
   - Analyze Run Analyzer data for resource exhaustion
   - Correlate data across services to identify root cause
3. Review the root cause analysis and recommendations
4. Apply the recommended fixes

**Example:**

```
You: "Why did workflow run omics-abc123 fail?"

Agent: "I've analyzed the failure. Here's what I found:

        Root Cause: Memory Exhaustion (Confidence: 95%)

        Evidence:
        - Task 'bwa-mem-alignment' failed with exit code 137 (OOM kill)
        - CloudWatch Logs show: 'java.lang.OutOfMemoryError: Java heap space'
        - Run Analyzer data: Peak memory usage was 14.2 GB, allocated was 8 GB

        Recommendation:
        Increase memory allocation for the bwa-mem-alignment task to 16 GB.

        How to fix:
        1. Update your workflow definition at line 45:
           memory = '16 GB'  // was: '8 GB'
        2. Re-run the workflow with the updated configuration

        Would you like me to open the workflow definition file?"
```

### Workflow 3: Analyze Resource Utilization

**Goal:** Understand resource usage patterns to optimize workflow performance and costs.

**Steps:**

1. Ask: "Show me resource utilization for run omics-abc123"
2. The agent will:
   - Retrieve Run Analyzer data
   - Show CPU, memory, and disk utilization for each task
   - Identify over-provisioned or under-provisioned resources
   - Provide optimization recommendations

**Example:**

```
You: "Show me resource utilization for run omics-abc123"

Agent: "Here's the resource utilization analysis:

        Task: bwa-mem-alignment
        - CPU: Allocated 4 vCPUs, Peak usage 3.2 vCPUs (80%)
        - Memory: Allocated 8 GB, Peak usage 14.2 GB (178% - EXCEEDED!)
        - Duration: 2.5 hours

        Task: gatk-variant-calling
        - CPU: Allocated 8 vCPUs, Peak usage 2.1 vCPUs (26% - UNDERUTILIZED)
        - Memory: Allocated 16 GB, Peak usage 6.8 GB (43%)
        - Duration: 1.8 hours

        Recommendations:
        1. Increase bwa-mem-alignment memory to 16 GB
        2. Reduce gatk-variant-calling CPU to 4 vCPUs (save costs)

        Estimated cost savings: $12 per run"
```

### Workflow 4: Investigate IAM Permission Errors

**Goal:** Quickly identify and fix IAM permission issues without manually searching CloudTrail.

**Steps:**

1. Ask: "What IAM permissions are missing for run omics-abc123?"
2. The agent will:
   - Query CloudTrail for AccessDenied events
   - Identify the specific missing permissions
   - Generate exact IAM policy statements needed
   - Provide AWS CLI commands to add permissions

**Example:**

```
You: "What IAM permissions are missing for run omics-abc123?"

Agent: "I found IAM permission denials in CloudTrail:

        Missing Permission: s3:GetObject
        Resource: arn:aws:s3:::my-genomics-data/reference-genome/*
        Time: 3:15 PM (during task 'download-reference')

        Required IAM Policy Statement:
        {
          "Effect": "Allow",
          "Action": "s3:GetObject",
          "Resource": "arn:aws:s3:::my-genomics-data/reference-genome/*"
        }

        To fix, add this to your HealthOmics execution role:

        aws iam put-role-policy \
          --role-name HealthOmicsExecutionRole \
          --policy-name S3ReferenceGenomeAccess \
          --policy-document file://policy.json

        Would you like me to generate the complete policy.json file?"
```

### Workflow 5: Proactive Failure Alerts

**Goal:** Get notified immediately when workflows fail, without manually monitoring.

**Steps:**

1. The system automatically detects workflow failures via CloudWatch Alarms
2. When a failure occurs, you'll see a notification in Kiro IDE
3. Click the notification to start troubleshooting
4. The agent has already retrieved initial failure information

**Example:**

```
[Notification appears in Kiro IDE]

"Workflow Failure Detected

Workflow: variant-calling-pipeline
Run ID: omics-abc123
Status: FAILED
Time: 3:45 PM

Click to investigate"

[You click the notification]

Agent: "I detected a failure in your variant-calling-pipeline workflow.

        Initial analysis:
        - Run ID: omics-abc123
        - Failed task: gatk-haplotype-caller
        - Failure time: 3:45 PM
        - Duration before failure: 2.3 hours

        Would you like me to perform a full root cause analysis?"
```

### Workflow 6: Custom Knowledge Base

**Goal:** Customize the agent with your organization's documentation and historical troubleshooting data.

**Steps:**

1. Open the Knowledge Base Manager UI in Kiro
2. Add data sources:
   - SharePoint document libraries
   - Confluence spaces
   - Internal wikis
   - Historical troubleshooting logs
   - File systems or S3 buckets
3. The agent automatically indexes and extracts semantic information
4. Future queries will use your organization's knowledge

**Example:**

```
You: [Add SharePoint library with your team's runbooks]

Agent: "Knowledge source added successfully.

        Source: SharePoint - Bioinformatics Runbooks
        Documents indexed: 47
        Namespaces: /org/runbooks/, /org/troubleshooting-history/
        Status: ACTIVE

        The agent will now prioritize your organization's knowledge
        when providing recommendations."

[Later, when troubleshooting]

You: "Why did my WGS pipeline fail?"

Agent: "Based on your organization's runbook 'WGS-Pipeline-Troubleshooting.md',
        this failure pattern matches a known issue with reference genome paths.

        From your runbook (last updated 2 weeks ago):
        'Common cause: Reference genome path in config.yaml must use s3:// prefix'

        Checking your workflow... confirmed, you're using a local path.

        Fix: Update config.yaml line 12:
        reference_genome: 's3://my-bucket/reference/hg38.fa'  // was: '/data/hg38.fa'"
```

## Recommended Changes

Let me update the structure to follow Kiro Power best practices:

<function_calls>
<invoke name="strReplace">
<parameter name="path">power/POWER.md

## Troubleshooting

### Common Issues

**"Required Powers not installed"**

- Install dependency Powers from the Powers marketplace
- The installation wizard will prompt you automatically

**"Agent not responding"**

- Check AWS Bedrock service availability in your region
- Verify AgentCore agent is deployed: Check AWS Bedrock console
- Review CloudWatch Logs for agent execution errors

**"Missing IAM permissions"**

- The agent will detect missing permissions and provide exact policy statements
- Use IAM Policy Autopilot for automatic policy generation and deployment

**"No workflow data found"**

- Verify HealthOmics workflow run ID is correct
- Ensure you have permissions to access the workflow
- Check that the workflow exists in the specified region

## Best Practices

### For Bioinformatics Engineers

- **Start with simple queries** - "What's the status of run omics-abc123?"
- **Let the agent orchestrate** - Don't worry about which Power provides what
- **Provide workflow context** - Mention workflow type (WGS, WES, RNA-Seq) for better recommendations
- **Add custom knowledge** - Ingest your team's runbooks for organization-specific guidance
- **Use proactive alerts** - Enable failure notifications to catch issues immediately

### For Platform Administrators

- **Deploy shared agent** - One agent instance for the entire team
- **Customize knowledge base** - Add organization-specific documentation and historical patterns
- **Monitor usage metrics** - Track common failure types and resolution times
- **Export CDK templates** - Share agent configuration across teams
- **Review IAM policies** - Ensure least-privilege access for all roles

## Integration with Existing AWS Solutions

This Power complements AWS's HealthOmics monitoring solution:

**AWS Monitoring Solution** (QuickSight dashboards):

- Organization-wide monitoring
- Historical trend analysis
- Batch processing (15-minute intervals)
- Cost tracking and benchmarking

**This Power** (AI-assisted troubleshooting):

- Individual workflow failure diagnosis
- Real-time analysis (5-30 seconds)
- Natural language interface
- Actionable recommendations with specific fixes

**Use together:** AWS monitoring identifies that failures are occurring; this Power helps you quickly diagnose and fix specific failures.

## Example Queries

Try these after setup:

```
"What's the status of my latest workflow run?"
"Why did workflow run omics-abc123 fail?"
"Show me resource utilization for run omics-abc123"
"What IAM permissions are missing?"
"Which tasks failed in my last run?"
"Optimize my WGS pipeline for cost"
"Show me the timeline for run omics-abc123"
```

## Configuration

Configuration is managed through the Setup Wizard. Manual configuration (if needed):

```typescript
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

## License

This project is licensed under the Apache License 2.0 - see LICENSE file for details.

## Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: See docs/ for detailed guides
- **AWS Samples**: Part of the aws-samples community

## Related Resources

- [AWS HealthOmics Documentation](https://docs.aws.amazon.com/omics/)
- [AWS Bedrock AgentCore Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)
- [Kiro IDE Documentation](https://kiro.dev)
- [AWS Enhanced Monitoring Blog Post](https://aws.amazon.com/blogs/industries/enhance-monitoring-and-observability-for-aws-healthomics-workflows/)

---

**Package:** healthomics-ai-troubleshooter
**Repository:** https://github.com/aws-samples/aws-healthomics-ai-troubleshooting-assistant
**License:** Apache 2.0
