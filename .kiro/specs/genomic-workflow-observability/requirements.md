# Requirements Document

## Project Information

- **Project Name**: Genomic Workflow Observability System
- **Kiro Power Name**: HealthOmics AI Troubleshooter
- **Package Name**: healthomics-ai-troubleshooter
- **CDK Stack Name**: HealthOmicsAITroubleshooterStack
- **AgentCore Agent Name**: HealthOmicsWorkflowTroubleshooter

### GitHub Repository Strategy

**During Development** (Private):

- Repository: `github.com/YOUR-USERNAME/aws-healthomics-ai-troubleshooting-assistant` (private)
- Branch: `main` or `develop`
- Access: Private, for development and testing only

**After Development Complete** (Public):

**Option 1: Transfer to aws-samples (Recommended)**

1. Ensure code is production-ready and well-documented
2. Add LICENSE file (Apache 2.0 or MIT)
3. Add comprehensive README.md with installation instructions
4. Add CONTRIBUTING.md for community contributions
5. Contact AWS samples team to request repository creation
6. Transfer repository ownership to aws-samples organization
7. Final location: `github.com/aws-samples/aws-healthomics-ai-troubleshooting-assistant`

**Option 2: Fork to aws-samples**

1. Keep your private repo as upstream
2. Create public fork under aws-samples
3. Submit PR to aws-samples with your code
4. Maintain both repos (private for development, public for distribution)

**Option 3: Keep under your account**

1. Make your repository public
2. Submit to Kiro Powers marketplace with your GitHub URL
3. Later migrate to aws-samples if AWS adopts it

**Recommended Approach**: Option 1 (Transfer to aws-samples) for maximum visibility and community trust.

**Pre-Publication Checklist**:

- [ ] All tests passing
- [ ] Documentation complete (README, installation guide, API docs)
- [ ] LICENSE file added
- [ ] CONTRIBUTING.md added
- [ ] Security review completed
- [ ] Example workflows and sample data included
- [ ] CDK templates validated
- [ ] IAM policies reviewed for least privilege

## Introduction

This document specifies the requirements for an AI-assisted troubleshooting system for genomic sequencing pipelines that integrates AWS HealthOmics and AWS Observability services through Kiro IDE. The system enables bioinformatics engineers to diagnose and resolve workflow failures through natural language queries, reducing troubleshooting time from hours to minutes.

## Relationship to Existing AWS Solutions

### AWS Enhanced Monitoring Solution

AWS provides an existing monitoring solution for HealthOmics workflows, documented in the blog post ["Enhance monitoring and observability for AWS HealthOmics workflows"](https://aws.amazon.com/blogs/industries/enhance-monitoring-and-observability-for-aws-healthomics-workflows/) (March 2026) with sample code available in the `aws-samples` GitHub repository.

**The existing AWS solution provides**:

- Event-driven data ingestion into S3 data lake using EventBridge, Lambda, and Glue
- QuickSight dashboards for visualizing workflow metrics and trends
- SNS email notifications for workflow failures
- Scheduled batch processing (Glue crawlers run every 15 minutes)
- Historical analysis capabilities for cost optimization and performance tracking
- Run Analyzer integration for resource utilization insights

**Key characteristics**:

- **Focus**: Organization-wide monitoring and historical trend analysis
- **Interface**: Dashboard-based visualization (QuickSight)
- **Latency**: Batch processing with 15-minute update intervals
- **Use case**: Administrative oversight, cost tracking, benchmarking across workflows
- **Interaction model**: Passive monitoring with email alerts

### This System's Complementary Approach

This system complements the AWS monitoring solution by focusing on **real-time, interactive troubleshooting** rather than passive monitoring:

**This system provides**:

- IDE-native natural language query interface for immediate investigation
- Real-time root cause analysis (seconds, not minutes)
- AI-assisted correlation across HealthOmics, CloudWatch, CloudTrail, and X-Ray
- Actionable recommendations with specific parameter values to fix issues
- Interactive conversational troubleshooting workflow
- Direct access to workflow definition files for immediate fixes

**Key characteristics**:

- **Focus**: Individual workflow failure diagnosis and resolution
- **Interface**: Natural language conversation within Kiro IDE
- **Latency**: Real-time analysis (5-30 seconds)
- **Use case**: Active troubleshooting during development and production incidents
- **Interaction model**: Interactive investigation with AI-guided root cause analysis

### Integration Opportunities

The two systems can work together:

1. **AWS monitoring solution** identifies that failures are occurring and provides high-level trends
2. **This system** enables engineers to quickly diagnose and fix specific failures through conversational queries
3. Both systems can leverage the same underlying data sources (CloudWatch Logs, Run Analyzer, manifest logs)
4. This system could optionally integrate with the AWS solution's S3 data lake for historical context

### Positioning

Think of the relationship as:

- **AWS monitoring solution** = "What failed across my organization?" (Dashboard for visibility)
- **This system** = "Why did this specific run fail and how do I fix it?" (AI assistant for resolution)

The AWS solution helps you see the forest; this system helps you diagnose and fix individual trees.

## Glossary

- **System**: The genomic workflow troubleshooting system integrated within Kiro IDE
- **HealthOmics_Service**: AWS HealthOmics service providing genomic workflow execution capabilities
- **Observability_Service**: AWS Observability services including CloudWatch Logs, Metrics, Alarms, Application Signals, and CloudTrail
- **Run_Analyzer**: AWS HealthOmics component that provides task-level resource utilization metrics
- **Workflow_Run**: An execution instance of a genomic pipeline (Nextflow, WDL, or CWL)
- **Task**: An individual computational step within a workflow run
- **Manifest_Log**: Detailed execution logs stored in S3 for each workflow run
- **Natural_Language_Query**: User input in conversational format requesting troubleshooting assistance
- **Root_Cause**: The underlying reason for a workflow failure (e.g., memory exhaustion, IAM permission denial, misconfigured parameters)
- **Actionable_Recommendation**: Specific guidance with parameter values to resolve identified issues
- **Kiro_Power**: A Kiro IDE integration module providing access to external services
- **AgentCore**: AWS Bedrock AgentCore platform for building, deploying, and operating AI agents
- **Bioinformatics_Agent**: A specialized AI agent built on AgentCore with genomics domain knowledge for troubleshooting workflows
- **IAM_Policy_Autopilot**: Kiro Power that automatically analyzes code and generates required IAM policies
- **CDK**: AWS Cloud Development Kit for defining cloud infrastructure as code
- **Setup_Wizard**: Interactive configuration interface that guides users through system installation and deployment
- **AgentCore_Memory**: AgentCore service providing persistent memory with semantic extraction capabilities for storing conversation history and organization-specific knowledge
- **Knowledge_Base**: Collection of documents, troubleshooting patterns, and domain-specific information that the agent uses to provide recommendations
- **Custom_Knowledge_Source**: Organization-specific data sources (SharePoint, Confluence, wikis, historical troubleshooting logs) that can be ingested into the agent's knowledge base

## Requirements

### Requirement 1: HealthOmics Workflow Data Retrieval

**User Story:** As a bioinformatics engineer, I want to query workflow run status and details, so that I can understand the current state and history of my genomic pipelines.

#### Acceptance Criteria

1. WHEN a user provides a workflow run ID, THE System SHALL retrieve the run status from HealthOmics_Service
2. WHEN a workflow run has failed, THE System SHALL retrieve task-level execution details for all tasks in that run
3. WHEN task details are requested, THE System SHALL retrieve resource utilization metrics from Run_Analyzer
4. WHEN a workflow run has manifest logs enabled, THE System SHALL retrieve the S3 location of Manifest_Log files
5. THE System SHALL support Nextflow, WDL, and CWL workflow types
6. WHEN a workflow run completes, THE System SHALL retrieve engine logs from S3 for failed runs
7. WHEN a WDL or CWL workflow completes, THE System SHALL retrieve the outputs.json file from S3
8. THE System SHALL retrieve run cache logs from CloudWatch Logs for workflows using caching
9. THE System SHALL access all CloudWatch log types (engine logs, run logs, task logs, run manifest logs, run cache logs)
10. THE System SHALL support real-time log streaming for run logs and task logs during workflow execution

### Requirement 2: Observability Data Integration

**User Story:** As a bioinformatics engineer, I want to access CloudWatch logs and metrics for my workflow runs, so that I can see detailed execution traces and error messages.

#### Acceptance Criteria

1. WHEN a workflow run ID is provided, THE System SHALL query CloudWatch Logs for workflow run events associated with that run
2. WHEN investigating a failed task, THE System SHALL retrieve stderr and stdout logs from CloudWatch Logs
3. WHEN a workflow run has failed, THE System SHALL check CloudWatch Alarms for triggered alarms related to that run
4. WHEN analyzing distributed pipeline invocations, THE System SHALL retrieve Application Signals traces from the invocation chain
5. WHEN IAM permission errors are suspected, THE System SHALL query CloudTrail for access denial events related to the workflow run
6. THE System SHALL retrieve HealthOmics-specific CloudWatch metrics from the AWS/Omics namespace
7. THE System SHALL monitor API call count metrics for workflow operations (CreateWorkflow, StartRun, CancelRun, DeleteRun)
8. THE System SHALL provide pre-built CloudWatch Log Insights queries for common troubleshooting patterns (OOM errors, permission denials, image pull failures)
9. THE System SHALL support EventBridge event handling for HealthOmics run status changes
10. THE System SHALL retrieve run cache hit/miss information from run cache logs

### Requirement 3: Natural Language Query Interface

**User Story:** As a bioinformatics engineer, I want to ask questions in natural language about workflow failures, so that I can quickly get answers without learning complex query syntax.

#### Acceptance Criteria

1. WHEN a user submits a Natural_Language_Query, THE System SHALL parse the query to identify the workflow run ID or time range
2. WHEN a query asks about failure reasons, THE System SHALL retrieve relevant data from both HealthOmics_Service and Observability_Service
3. WHEN a query requests the latest run status, THE System SHALL identify the most recent workflow run and retrieve its status
4. WHEN a query is ambiguous, THE System SHALL request clarification from the user with specific options
5. THE System SHALL support queries in conversational English format

### Requirement 4: Root Cause Analysis

**User Story:** As a bioinformatics engineer, I want the system to automatically identify why my workflow failed, so that I can fix the issue without manually correlating logs across multiple services.

#### Acceptance Criteria

1. WHEN a workflow run has failed, THE System SHALL correlate data from HealthOmics_Service, CloudWatch Logs, CloudWatch Metrics, and CloudTrail to identify Root_Cause
2. WHEN a task fails due to resource exhaustion, THE System SHALL compare allocated resources with Run_Analyzer recommendations
3. WHEN IAM permission errors are detected in CloudTrail, THE System SHALL identify the specific missing permissions
4. WHEN ECR image pull failures occur, THE System SHALL identify misconfigured ECR URIs or authentication issues
5. WHEN multiple potential causes exist, THE System SHALL rank them by likelihood based on available evidence

### Requirement 5: Actionable Recommendations

**User Story:** As a bioinformatics engineer, I want specific recommendations with parameter values to fix identified issues, so that I can quickly resolve failures and re-run workflows.

#### Acceptance Criteria

1. WHEN Root_Cause is identified, THE System SHALL generate Actionable_Recommendation with specific parameter values
2. WHEN memory exhaustion is detected, THE System SHALL recommend specific memory allocation values based on Run_Analyzer data
3. WHEN IAM permission errors are found, THE System SHALL provide the exact IAM policy statements needed
4. WHEN configuration errors are detected, THE System SHALL provide corrected configuration values
5. THE System SHALL include confidence levels with each recommendation

### Requirement 6: Workflow Definition Access

**User Story:** As a bioinformatics engineer, I want direct access to workflow definition files from the troubleshooting interface, so that I can quickly apply recommended fixes without switching contexts.

#### Acceptance Criteria

1. WHEN a workflow run is being analyzed, THE System SHALL identify the workflow definition file location
2. WHEN recommendations require workflow changes, THE System SHALL provide direct links to the relevant sections of the workflow definition
3. WHEN the workflow definition is accessible in the current workspace, THE System SHALL open the file at the relevant line
4. THE System SHALL support workflow definitions stored in local files, S3, or version control systems
5. WHEN workflow definitions are not accessible, THE System SHALL provide clear instructions on how to access them

### Requirement 7: IAM Permissions Management

**User Story:** As a platform administrator, I want to ensure the system has appropriate IAM permissions, so that it can access all necessary AWS services securely.

#### Acceptance Criteria

1. THE System SHALL require omics:GetRun permission to retrieve workflow run details
2. THE System SHALL require omics:ListRunTasks permission to retrieve task-level information
3. THE System SHALL require logs:StartQuery permission to query CloudWatch Logs
4. THE System SHALL require cloudtrail:LookupEvents permission to search CloudTrail events
5. THE System SHALL require xray:GetTraceSummaries permission to retrieve Application Signals traces
6. THE System SHALL require s3:GetObject permission to read Manifest_Log files from S3
7. WHEN required permissions are missing, THE System SHALL provide clear error messages indicating which permissions are needed

### Requirement 8: Proactive Failure Detection

**User Story:** As a bioinformatics engineer, I want to be notified when workflows fail, so that I can start troubleshooting immediately without manually monitoring runs.

#### Acceptance Criteria

1. WHEN a CloudWatch Alarm triggers for HealthOmics/WorkflowRunFailed, THE System SHALL detect the alarm event
2. WHEN a workflow failure is detected, THE System SHALL automatically retrieve the run ID and initial failure information
3. WHEN proactive detection occurs, THE System SHALL present a summary of the failure to the user
4. THE System SHALL support user-configured notification preferences
5. WHEN multiple workflows fail simultaneously, THE System SHALL prioritize notifications based on workflow criticality

### Requirement 9: Multi-Workflow Support

**User Story:** As a bioinformatics engineer managing multiple pipelines, I want to troubleshoot different workflow types and runs, so that I can support diverse genomic analysis needs.

#### Acceptance Criteria

1. THE System SHALL support concurrent troubleshooting of multiple workflow runs
2. THE System SHALL maintain context for each workflow run being analyzed
3. WHEN switching between workflow runs, THE System SHALL preserve the analysis state for each run
4. THE System SHALL support workflows written in Nextflow, WDL, and CWL
5. THE System SHALL handle high-throughput scenarios with thousands of samples per day

### Requirement 10: Integration with Kiro Powers Architecture

**User Story:** As a Kiro IDE user, I want the troubleshooting system to integrate seamlessly with existing Kiro Powers, so that I have a consistent development experience.

#### Acceptance Criteria

1. THE System SHALL implement the Kiro_Power interface for AWS HealthOmics integration
2. THE System SHALL implement the Kiro_Power interface for AWS Observability integration
3. THE System SHALL operate within a single Kiro IDE session without requiring external tools
4. THE System SHALL follow Kiro IDE conventions for user interaction and data presentation
5. THE System SHALL integrate with Kiro's existing AWS credential management

### Requirement 11: Performance and Scalability

**User Story:** As a bioinformatics engineer, I want troubleshooting queries to complete quickly, so that I can maintain rapid iteration cycles during pipeline development.

#### Acceptance Criteria

1. WHEN querying workflow run status, THE System SHALL return results within 5 seconds
2. WHEN performing root cause analysis, THE System SHALL complete analysis within 30 seconds for typical failures
3. WHEN retrieving large log files, THE System SHALL stream results progressively to the user
4. THE System SHALL cache frequently accessed data to improve response times
5. WHEN API rate limits are encountered, THE System SHALL implement exponential backoff and retry logic

### Requirement 12: Error Handling and Resilience

**User Story:** As a bioinformatics engineer, I want the system to handle errors gracefully, so that temporary issues don't prevent me from troubleshooting workflows.

#### Acceptance Criteria

1. WHEN AWS API calls fail, THE System SHALL retry with exponential backoff up to 3 attempts
2. WHEN partial data is unavailable, THE System SHALL provide analysis based on available data and indicate what is missing
3. WHEN network connectivity is lost, THE System SHALL queue requests and retry when connectivity is restored
4. WHEN invalid workflow run IDs are provided, THE System SHALL return clear error messages
5. THE System SHALL log all errors for debugging purposes without exposing sensitive information to users

### Requirement 13: AgentCore Integration for Specialized Bioinformatics Agent

**User Story:** As a bioinformatics engineer, I want an AI agent that understands genomics terminology and common pipeline patterns, so that I receive domain-specific troubleshooting guidance rather than generic AWS advice.

#### Acceptance Criteria

1. THE System SHALL deploy a specialized bioinformatics troubleshooting agent using AWS Bedrock AgentCore
2. THE Agent SHALL be configured with genomics domain knowledge including common workflow types (WGS, WES, RNA-Seq, variant calling)
3. THE Agent SHALL understand bioinformatics tools and terminology (GATK, BWA-MEM2, Samtools, VCF, BAM, FASTQ)
4. THE Agent SHALL provide genomics-specific recommendations based on workflow type and failure patterns
5. THE Agent SHALL orchestrate calls to HealthOmics Power and Observability Power to retrieve necessary data
6. THE Agent SHALL maintain conversation context across multiple troubleshooting queries
7. THE Agent SHALL be accessible from Kiro IDE through natural language interface
8. THE Agent SHALL support multiple concurrent users without context mixing
9. THE Agent SHALL support customization with organization-specific knowledge bases
10. THE Agent SHALL allow ingestion of custom data sources (SharePoint, Confluence, internal wikis, historical troubleshooting data)
11. THE Agent SHALL use AgentCore Memory with semantic memory strategies to extract and retain organization-specific troubleshooting patterns
12. THE Agent SHALL provide a knowledge base management interface for adding, updating, and removing custom knowledge sources

### Requirement 14: Automated IAM Policy Management

**User Story:** As a bioinformatics engineer without deep AWS expertise, I want the system to automatically configure required IAM permissions, so that I can start troubleshooting workflows without manually crafting IAM policies.

#### Acceptance Criteria

1. THE System SHALL integrate with IAM Policy Autopilot Power to analyze required permissions
2. WHEN the system is deployed, THE System SHALL automatically generate IAM policies for all required permissions (omics:GetRun, omics:ListRunTasks, logs:StartQuery, cloudtrail:LookupEvents, xray:GetTraceSummaries, s3:GetObject)
3. THE System SHALL deploy generated IAM policies to the appropriate roles (AgentCore agent role, Lambda execution roles)
4. WHEN permissions are missing during operation, THE System SHALL detect the missing permission and provide instructions to add it
5. THE System SHALL follow principle of least privilege when generating IAM policies
6. THE System SHALL support both single-account and cross-account IAM configurations
7. THE System SHALL validate IAM policies before deployment to prevent misconfigurations

### Requirement 15: Infrastructure as Code Deployment

**User Story:** As a bioinformatics platform administrator, I want to deploy the entire troubleshooting system with a single command, so that I can quickly provision the solution for my team without manual AWS console configuration.

#### Acceptance Criteria

1. THE System SHALL provide AWS CDK constructs for all infrastructure components
2. THE CDK deployment SHALL create all required AWS resources (IAM roles, S3 buckets, CloudWatch alarms, EventBridge rules, AgentCore agent)
3. THE CDK deployment SHALL configure the AgentCore agent with appropriate tools and knowledge base
4. THE CDK deployment SHALL set up CloudWatch alarms for proactive failure detection
5. THE CDK deployment SHALL create S3 buckets with appropriate lifecycle policies for manifest logs
6. THE CDK deployment SHALL configure EventBridge rules to trigger failure notifications
7. THE System SHALL validate CloudFormation templates using AWS CDK Power before deployment
8. THE System SHALL check deployed resources for security compliance using AWS CDK Power
9. THE CDK deployment SHALL support parameterization for different environments (dev, staging, production)
10. THE System SHALL provide rollback capability if deployment fails

### Requirement 16: Turnkey Installation and Setup

**User Story:** As a bioinformatics engineer, I want to install and configure the troubleshooting system in under 10 minutes, so that I can quickly start using it without extensive setup procedures.

#### Acceptance Criteria

1. THE System SHALL provide a Kiro Power that declares dependencies on required Powers (HealthOmics, Observability, IAM Policy Autopilot, AWS CDK)
2. WHEN the Power is installed, THE System SHALL prompt the user to install required dependency Powers if not already installed
3. THE System SHALL support optional Power dependencies that enhance functionality but are not required for basic operation
4. WHEN the Power is installed, THE System SHALL guide the user through a setup wizard
5. THE Setup wizard SHALL collect required configuration (AWS region, S3 bucket name, notification preferences)
6. THE Setup wizard SHALL offer to deploy infrastructure using CDK with one click
7. THE Setup wizard SHALL offer to generate and deploy IAM policies using IAM Policy Autopilot
8. THE Setup wizard SHALL validate AWS credentials and permissions before proceeding
9. THE Setup wizard SHALL test connectivity to AWS services after setup
10. THE System SHALL provide clear error messages and remediation steps if setup fails
11. THE System SHALL persist configuration across Kiro IDE sessions
12. THE System SHALL provide a "Quick Start" guide with example queries to try immediately after setup
13. THE System SHALL allow users to skip optional Power installations and enable them later
14. THE System SHALL detect when optional Powers are installed and automatically enable their features

### Requirement 17: Community Sharing and Reusability

**User Story:** As a bioinformatics platform administrator, I want to deploy a shared AgentCore agent that multiple team members can use, so that we can centralize troubleshooting capabilities and share learnings across the team.

#### Acceptance Criteria

1. THE System SHALL support deployment of a shared AgentCore agent accessible by multiple users
2. THE Shared agent SHALL maintain separate conversation contexts for each user
3. THE System SHALL support agent configuration sharing via exported CDK templates
4. THE System SHALL provide example workflow definitions and failure scenarios for testing
5. THE System SHALL include sample IAM policy templates for common deployment patterns
6. THE System SHALL document integration points for extending the agent with custom tools
7. THE System SHALL provide metrics on agent usage (queries per day, common failure types, resolution times)
8. THE System SHALL support agent versioning and updates without disrupting active users

### Requirement 18: Custom Knowledge Base Management

**User Story:** As a bioinformatics platform administrator, I want to customize the agent with our organization's internal documentation and historical troubleshooting data, so that the agent provides recommendations based on our specific environment and past experiences.

#### Acceptance Criteria

1. THE System SHALL provide a knowledge base management interface for adding custom data sources
2. THE System SHALL support ingestion of documents from SharePoint, Confluence, internal wikis, and file systems
3. THE System SHALL support ingestion of historical troubleshooting logs and resolution patterns
4. THE System SHALL use AgentCore Memory with semantic memory strategies to extract and index custom knowledge
5. THE System SHALL support multiple knowledge base namespaces (e.g., /org/runbooks/, /org/troubleshooting-history/, /org/best-practices/)
6. WHEN custom knowledge is added, THE System SHALL automatically extract relevant information using semantic memory strategies
7. WHEN answering queries, THE Agent SHALL prioritize organization-specific knowledge over generic genomics knowledge when relevant
8. THE System SHALL provide knowledge base search and validation tools to verify custom data is properly indexed
9. THE System SHALL support knowledge base versioning and rollback capabilities
10. THE System SHALL allow administrators to update or remove custom knowledge sources without redeploying the agent
11. THE System SHALL provide metrics on knowledge base usage (queries using custom knowledge, knowledge source relevance scores)
12. THE System SHALL support incremental knowledge base updates without full re-indexing

### Requirement 19: Power Dependency Management

**User Story:** As a solution developer, I want to declare dependencies on other Kiro Powers and support optional enhancements, so that I can build on existing capabilities and allow future extensibility without breaking existing installations.

#### Acceptance Criteria

1. THE System SHALL declare required Power dependencies in the Power manifest (HealthOmics, Observability, IAM Policy Autopilot, AWS CDK)
2. WHEN a user installs the Power, THE System SHALL check if required dependency Powers are installed
3. WHEN required dependencies are missing, THE System SHALL prompt the user to install them with a single action
4. THE System SHALL provide a list of optional Power dependencies that enhance functionality
5. WHEN optional Powers are not installed, THE System SHALL operate with reduced functionality and inform the user of available enhancements
6. WHEN optional Powers are installed later, THE System SHALL automatically detect and enable their features without requiring reconfiguration
7. THE System SHALL validate Power dependency versions for compatibility
8. THE System SHALL provide clear documentation on what each dependency Power provides
9. THE System SHALL support graceful degradation when optional Powers are unavailable
10. THE System SHALL allow developers to add new Power dependencies in future versions without breaking existing installations
