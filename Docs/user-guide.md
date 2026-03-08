# User Guide

## Getting Started

After installation and setup, you can start troubleshooting AWS HealthOmics workflows using natural language queries in Kiro IDE.

## Basic Usage

### Checking Workflow Status

Ask simple status questions:

```
"What's the status of workflow run omics-abc123?"
"What's the status of my latest workflow run?"
"Show me recent workflow runs"
```

The agent will retrieve run details including status, start time, duration, and progress.

### Diagnosing Failures

Ask about failures to get root cause analysis:

```
"Why did workflow run omics-abc123 fail?"
"What went wrong with my last run?"
"Diagnose the failure in run omics-abc123"
```

The agent will:

- Analyze task failures
- Check CloudWatch Logs for errors
- Query CloudTrail for IAM denials
- Examine Run Analyzer data
- Provide root cause with confidence score

### Analyzing Resource Usage

Optimize workflow performance and costs:

```
"Show me resource utilization for run omics-abc123"
"Which tasks are over-provisioned?"
"How can I optimize my WGS pipeline?"
```

The agent will show CPU, memory, and disk usage for each task and provide optimization recommendations.

### Investigating IAM Issues

Quickly identify and fix permission problems:

```
"What IAM permissions are missing for run omics-abc123?"
"Fix IAM permission errors"
"Show me access denied events"
```

The agent will generate exact IAM policy statements needed.

## Advanced Features

### Custom Knowledge Base

Add your organization's documentation to get organization-specific recommendations:

**Adding Knowledge Sources:**

Use the `add_knowledge_source` MCP tool with:

```typescript
{
  name: "Team Runbooks",
  type: "SHAREPOINT",
  configuration: {
    sharePoint: {
      siteUrl: "https://your-org.sharepoint.com/sites/bioinformatics",
      libraryName: "Runbooks",
      authentication: {
        type: "OAUTH",
        credentials: { /* OAuth config */ }
      }
    }
  }
}
```

**Supported Sources:**

- SharePoint document libraries
- Confluence spaces
- File systems (local or network)
- S3 buckets
- Internal wikis
- Historical troubleshooting logs

**Benefits:**

- Agent prioritizes your organization's knowledge
- Learns from past troubleshooting patterns
- Provides environment-specific recommendations

### Proactive Failure Alerts

Enable automatic notifications when workflows fail:

1. Configure notification preferences during setup
2. Set criticality threshold (HIGH/MEDIUM/LOW)
3. Optionally filter by workflow name patterns

When a failure occurs:

- You'll see a notification in Kiro IDE
- Click to start troubleshooting
- Agent has already retrieved initial failure info

### Multi-Workflow Management

Work with multiple workflows simultaneously:

```
"Compare resource usage between run omics-abc123 and omics-def456"
"Show me all failed runs from today"
"Which of my workflows are currently running?"
```

The agent maintains separate context for each workflow.

### Shared Team Deployment

Deploy one agent instance for your entire team:

1. Deploy infrastructure once using CDK
2. Share the agent ARN with team members
3. Each user gets isolated conversation context
4. Team benefits from shared custom knowledge base

## Common Workflows

### Workflow 1: Quick Status Check

**Goal:** Check workflow status without leaving Kiro IDE

**Query:**

```
"What's the status of workflow run omics-abc123?"
```

**Response:**

```
Your workflow run (omics-abc123) is currently RUNNING.
Started: 2:30 PM
Duration: 45 minutes
Progress: 12 of 15 tasks completed
Workflow type: Nextflow
```

### Workflow 2: Diagnose Memory Exhaustion

**Goal:** Identify and fix OOM errors

**Query:**

```
"Why did workflow run omics-abc123 fail?"
```

**Response:**

```
Root Cause: Memory Exhaustion (Confidence: 95%)

Evidence:
- Task 'bwa-mem-alignment' failed with exit code 137 (OOM kill)
- CloudWatch Logs: 'java.lang.OutOfMemoryError: Java heap space'
- Run Analyzer: Peak 14.2 GB, allocated 8 GB

Recommendation:
Increase memory to 16 GB in your workflow definition (line 45):
  memory = '16 GB'  // was: '8 GB'
```

### Workflow 3: Fix IAM Permissions

**Goal:** Resolve permission denials

**Query:**

```
"What IAM permissions are missing for run omics-abc123?"
```

**Response:**

```
Missing Permission: s3:GetObject
Resource: arn:aws:s3:::my-genomics-data/reference-genome/*

Required IAM Policy:
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::my-genomics-data/reference-genome/*"
}

AWS CLI command to fix:
aws iam put-role-policy --role-name HealthOmicsExecutionRole \
  --policy-name S3Access --policy-document file://policy.json
```

### Workflow 4: Optimize Costs

**Goal:** Reduce workflow costs by right-sizing resources

**Query:**

```
"Show me resource utilization for run omics-abc123"
```

**Response:**

```
Task: gatk-variant-calling
- CPU: Allocated 8 vCPUs, Peak 2.1 vCPUs (26% - UNDERUTILIZED)
- Memory: Allocated 16 GB, Peak 6.8 GB (43%)

Recommendation:
Reduce CPU to 4 vCPUs (save $8 per run)

Estimated annual savings: $2,920 (365 runs/year)
```

## Tips and Best Practices

### For Bioinformatics Engineers

- **Be specific**: Include workflow run IDs in your queries
- **Provide context**: Mention workflow type (WGS, WES, RNA-Seq) for better recommendations
- **Follow up**: Ask clarifying questions to drill deeper
- **Use proactive alerts**: Enable notifications to catch failures immediately

### For Platform Administrators

- **Deploy shared agent**: One instance for the entire team
- **Add custom knowledge**: Ingest team runbooks and historical data
- **Monitor metrics**: Track common failure types and resolution times
- **Export templates**: Share CDK configurations across teams

## Troubleshooting

### "Agent not responding"

- Check AWS Bedrock service status
- Verify agent is deployed in AWS Bedrock console
- Review CloudWatch Logs for errors

### "No workflow data found"

- Verify workflow run ID is correct
- Check you have permissions to access the workflow
- Ensure workflow exists in the configured region

### "Missing IAM permissions"

- Agent will provide exact policy statements needed
- Use IAM Policy Autopilot for automatic generation
- Apply policies to the appropriate roles

## Configuration

Configuration is stored in Kiro IDE settings. To view or modify:

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

## MCP Tools Available

After installation, these tools are available:

- **setup** - Launch setup wizard
- **deploy_infrastructure** - Deploy CDK stack
- **add_knowledge_source** - Add custom knowledge
- **query_agent** - Query the bioinformatics agent

## Support

For issues or questions:

- GitHub Issues: https://github.com/goginea/aws-healthomics-ai-troubleshooting-assistant/issues
- Documentation: See Docs/ directory
