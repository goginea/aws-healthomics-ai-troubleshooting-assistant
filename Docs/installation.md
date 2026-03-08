# Installation Guide

## Prerequisites

### Required

- **Kiro IDE** installed
- **AWS Account** with access to:
  - AWS HealthOmics
  - AWS Bedrock (for AgentCore)
  - CloudWatch Logs, Metrics, and Alarms
  - CloudTrail
  - X-Ray / Application Signals
  - S3 (for manifest logs)
- **Node.js** >= 18.0.0 (for development only)

### Required Kiro Powers

These Powers will be installed automatically when prompted:

- **aws-healthomics** (>=1.0.0)
- **aws-observability** (>=1.0.0)
- **aws-agentcore** (>=1.0.0)
- **iam-policy-autopilot-power** (>=1.0.0)
- **aws-infrastructure-as-code** (>=1.0.0)

## Installation Steps

### Step 1: Install the Power

1. Open Kiro IDE
2. Click the **Powers** icon in the activity bar
3. Click **"Add Custom Power"**
4. Enter the GitHub URL:
   ```
   https://github.com/goginea/aws-healthomics-ai-troubleshooting-assistant/tree/main/power
   ```
5. Click **Add**
6. When prompted, click **"Install All"** to install required dependency Powers

### Step 2: Run Setup

After installation, run the setup tool:

**Option A: Via Kiro Chat**

```
Ask Kiro: "Set up HealthOmics AI Troubleshooter"
```

**Option B: Via MCP Tool**

- Invoke the `setup` tool from the `healthomics-ai-troubleshooter` MCP server

### Step 3: Configure Settings

The setup wizard will prompt you for:

1. **AWS Region** (e.g., `us-east-1`)
2. **S3 Bucket Name** for manifest logs (e.g., `my-healthomics-logs`)
3. **Notification Preferences**:
   - Enable proactive failure alerts (yes/no)
   - Criticality threshold (HIGH/MEDIUM/LOW)

### Step 4: Deploy Infrastructure

The wizard will automatically:

- ✅ Validate your AWS credentials
- ✅ Deploy CDK stack with all resources:
  - AgentCore bioinformatics agent
  - IAM roles and policies
  - CloudWatch alarms
  - EventBridge rules
  - S3 buckets with lifecycle policies
- ✅ Generate IAM policies using IAM Policy Autopilot
- ✅ Test connectivity to all AWS services

**Deployment time:** 5-10 minutes

### Step 5: Verify Installation

The wizard will confirm:

- ✅ AgentCore agent is active
- ✅ All AWS services are accessible
- ✅ IAM permissions are configured correctly

## Post-Installation

### Quick Start

Try these example queries:

```
"What's the status of my latest workflow run?"
"Why did workflow run omics-abc123 fail?"
"Show me resource utilization for run omics-abc123"
```

### Optional: Add Custom Knowledge

Enhance the agent with your organization's documentation:

```
Use the add_knowledge_source MCP tool to ingest:
- SharePoint document libraries
- Confluence spaces
- Internal wikis and runbooks
- Historical troubleshooting logs
```

## Troubleshooting Installation

### "Required Powers not installed"

- Ensure all dependency Powers are installed
- Check the Powers panel for installation status
- Retry installation if any Power failed

### "AWS credentials not found"

- Configure AWS CLI: `aws configure`
- Or set environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- Or configure credentials in `~/.aws/credentials`

### "CDK deployment failed"

- Check CloudFormation console for stack status
- Review error messages in the wizard
- Ensure you have permissions to create IAM roles, S3 buckets, etc.

### "Agent not responding"

- Verify AWS Bedrock is available in your region
- Check the AgentCore agent status in AWS Bedrock console
- Review CloudWatch Logs for agent execution errors

## Next Steps

See [User Guide](./user-guide.md) for detailed usage instructions and workflows.
