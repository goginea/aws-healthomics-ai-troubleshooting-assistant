# AWS HealthOmics AI Troubleshooting Assistant

> AI-assisted troubleshooting for AWS HealthOmics genomic workflows with custom knowledge base support

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![AWS CDK](https://img.shields.io/badge/AWS%20CDK-2.170-orange)](https://aws.amazon.com/cdk/)

## Overview

The HealthOmics AI Troubleshooter is an intelligent troubleshooting system for bioinformatics engineers working with AWS HealthOmics genomic workflows. It integrates with Kiro IDE to provide natural language troubleshooting, AI-powered root cause analysis, and actionable recommendations in seconds.

### Key Capabilities

- 🤖 **AI-Powered Analysis**: Specialized bioinformatics agent built on AWS Bedrock AgentCore
- 🔍 **Root Cause Detection**: Automatically correlates data across HealthOmics, CloudWatch, CloudTrail, and X-Ray
- 💬 **Natural Language Interface**: Ask questions like "Why did my workflow fail?" and get instant answers
- 🧬 **Genomics Expertise**: Understands WGS, WES, RNA-Seq workflows and tools like GATK, BWA-MEM2, Samtools
- ⚡ **Fast Results**: Get troubleshooting insights in 5-30 seconds, not hours
- 🚀 **Turnkey Deployment**: One-command infrastructure setup with automated IAM policies
- 📚 **Custom Knowledge**: Ingest your organization's documentation and historical troubleshooting data
- 🔄 **Multi-Workflow Support**: Works with Nextflow, WDL, and CWL workflows

## Quick Start

### Installation

1. Install the Power in Kiro IDE from the Powers marketplace
2. Install required dependency Powers when prompted
3. Follow the Setup Wizard to deploy infrastructure

### First Query

```
"Why did workflow run omics-abc123 fail?"
```

The agent will analyze the failure, identify root causes, and provide specific recommendations.

## Architecture

```
Kiro IDE
  ↓
AgentCore Bioinformatics Agent (AWS Bedrock)
  ↓
HealthOmics + Observability Powers
  ↓
AWS Services (HealthOmics, CloudWatch, CloudTrail, X-Ray, S3)
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- TypeScript 5.6+
- AWS Account with HealthOmics access

### Setup

```bash
npm install
npm run build
npm test
```

### Project Structure

```
.
├── src/
│   ├── agent/              # AgentCore agent implementation
│   ├── powers/             # HealthOmics and Observability Powers
│   ├── orchestration/      # Query orchestrator and analyzers
│   ├── infrastructure/     # CDK stack definitions
│   ├── setup/              # Setup wizard
│   ├── knowledge/          # Knowledge base management
│   └── types/              # TypeScript type definitions
├── tests/                  # Unit and property-based tests
├── docs/                   # Documentation
├── examples/               # Example workflows and scenarios
└── cdk/                    # CDK app entry point
```

## Documentation

- [Installation Guide](docs/installation.md)
- [User Guide](docs/user-guide.md)
- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Contributing Guide](CONTRIBUTING.md)

## How It Works

1. **Query**: User asks a natural language question about a workflow failure
2. **Retrieve**: Agent fetches data from HealthOmics, CloudWatch, CloudTrail, X-Ray
3. **Analyze**: Root cause analyzer correlates data and identifies failure reasons
4. **Recommend**: Recommendation engine provides specific fixes with parameter values
5. **Act**: User applies recommendations and re-runs workflow

## Example Queries

- "What's the status of my latest workflow run?"
- "Why did workflow run omics-abc123 fail?"
- "Show me resource utilization for run omics-abc123"
- "What IAM permissions are missing?"
- "Which tasks failed in my last run?"
- "Show me the error logs for task xyz"

## Custom Knowledge Base

Enhance the agent with your organization's knowledge:

- SharePoint document libraries
- Confluence spaces
- Internal wikis and runbooks
- Historical troubleshooting logs
- Best practices and SOPs

The agent will prioritize your organization's knowledge when providing recommendations.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the Apache License 2.0 - see [LICENSE](LICENSE) for details.

## Security

See [SECURITY.md](SECURITY.md) for reporting security issues.

## Support

- **Issues**: [GitHub Issues](https://github.com/goginea/aws-healthomics-ai-troubleshooting-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/goginea/aws-healthomics-ai-troubleshooting-assistant/discussions)

## Related Projects

- [AWS HealthOmics](https://aws.amazon.com/omics/)
- [AWS Bedrock AgentCore](https://aws.amazon.com/bedrock/)
- [Kiro IDE](https://kiro.dev)
- [AWS Enhanced Monitoring Solution](https://aws.amazon.com/blogs/industries/enhance-monitoring-and-observability-for-aws-healthomics-workflows/)
