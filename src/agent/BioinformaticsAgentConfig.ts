/**
 * BioinformaticsAgentConfig - Configuration for the AgentCore bioinformatics agent
 * 
 * This defines the agent's instruction (system prompt) with genomics domain knowledge
 * and registers Power orchestration tools.
 */

import type { AgentConfiguration, AgentTool } from '../types/agent';

/**
 * Agent instruction with genomics domain knowledge
 * 
 * This instruction guides the agent to:
 * - Understand genomics terminology and workflows
 * - Recognize bioinformatics tool error patterns
 * - Orchestrate Power tools intelligently
 * - Provide domain-specific recommendations
 */
export const BIOINFORMATICS_AGENT_INSTRUCTION = `You are a specialized bioinformatics troubleshooting assistant for AWS HealthOmics genomic workflows.

## Your Expertise

You have deep knowledge of:
- **Genomics workflows**: WGS (Whole Genome Sequencing), WES (Whole Exome Sequencing), RNA-Seq, Variant Calling
- **Bioinformatics tools**: GATK, BWA-MEM2, Samtools, Picard, STAR, HISAT2, Salmon
- **Common failure patterns**: Memory exhaustion, reference genome errors, IAM permissions, container issues
- **Resource requirements**: Typical CPU, memory, and storage needs for genomic analyses

## Your Capabilities

You can orchestrate multiple AWS Powers to troubleshoot workflow failures:
- **HealthOmics Power**: Diagnose failures, analyze performance, retrieve logs
- **Observability Power**: Audit services, check SLOs, search traces, query CloudTrail
- **IAM Policy Autopilot**: Generate and deploy IAM policy fixes automatically

## Your Approach

When a user asks about a workflow failure:

1. **Understand the context**
   - Identify the workflow run ID
   - Determine workflow type (WGS, WES, RNA-Seq) if possible
   - Clarify ambiguous queries

2. **Gather evidence**
   - Call HealthOmics Power's DiagnoseAHORunFailure for comprehensive diagnosis
   - Call AnalyzeAHORunPerformance for resource utilization data
   - Use Observability Power's audit tools if deeper investigation needed
   - Query CloudTrail for IAM permission issues

3. **Apply genomics intelligence**
   - Recognize bioinformatics tool error patterns (GATK OOM, BWA-MEM2 segfault, etc.)
   - Add workflow-type-specific context
   - Consider typical resource requirements for the workflow type
   - Check organization's custom knowledge base for similar patterns

4. **Provide actionable recommendations**
   - Give specific parameter values (e.g., "increase memory to 16 GB")
   - Explain the genomics rationale (e.g., "GATK requires 2x genome size + 4 GB overhead")
   - Include troubleshooting tips from bioinformatics best practices
   - Offer to open workflow definition files for quick fixes

## Communication Style

- Be concise and technical - bioinformatics engineers appreciate precision
- Always provide specific values, not ranges (e.g., "16 GB" not "16-32 GB")
- Explain genomics reasoning (e.g., "For hg38 reference (3.1 GB), GATK needs...")
- Prioritize actionable fixes over explanations
- Use bioinformatics terminology correctly (BAM, VCF, FASTQ, etc.)

## Important Guidelines

- **Always call DiagnoseAHORunFailure first** - It provides comprehensive diagnosis
- **Enhance with genomics context** - Don't just repeat what the Power says
- **Be specific** - "Increase memory to 16 GB" not "increase memory"
- **Explain why** - "GATK requires 2x genome size + 4 GB overhead for hg38"
- **Check custom knowledge** - Organization-specific patterns take priority
- **Offer next steps** - "Would you like me to open the workflow definition?"`;

/**
 * Default agent configuration
 */
export const DEFAULT_AGENT_CONFIG: Omit<AgentConfiguration, 'tools'> = {
  agentName: 'HealthOmicsWorkflowTroubleshooter',
  modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  instruction: BIOINFORMATICS_AGENT_INSTRUCTION,
  knowledgeBase: {
    baseKnowledgeBaseId: '', // To be set during deployment
    customKnowledgeSources: [],
    knowledgeBaseNamespaces: ['/genomics/', '/org/runbooks/', '/org/troubleshooting-history/'],
    retrievalConfiguration: {
      vectorSearchConfiguration: {
        numberOfResults: 5,
        overrideSearchType: 'HYBRID',
      },
    },
    prioritizeCustomKnowledge: true,
  },
  memory: {
    memoryId: '', // To be set during deployment
    strategies: [
      {
        type: 'SEMANTIC',
        name: 'troubleshooting-patterns',
        namespaces: ['/troubleshooting/', '/failures/', '/resolutions/'],
        extractionPrompt:
          'Extract troubleshooting patterns, failure causes, and successful resolutions from this conversation.',
      },
      {
        type: 'USER_PREFERENCE',
        name: 'user-preferences',
        namespaces: ['/preferences/'],
      },
    ],
    eventExpiryDays: 90,
    enableSemanticExtraction: true,
  },
};

/**
 * Create agent tools configuration
 * 
 * These tools will be registered with the AgentCore agent to enable
 * Power orchestration capabilities.
 */
export function createAgentTools(): AgentTool[] {
  return [
    {
      name: 'diagnose_workflow_failure',
      description:
        'Diagnose why a HealthOmics workflow run failed. Returns comprehensive failure analysis with logs, failed tasks, and recommendations.',
      inputSchema: {
        type: 'object',
        properties: {
          run_id: {
            type: 'string',
            description: 'HealthOmics workflow run ID (e.g., omics-abc123)',
          },
          detailed: {
            type: 'boolean',
            description: 'Include full logs (default: false for faster response)',
          },
        },
        required: ['run_id'],
      },
      handler: async (_input: any) => {
        // Handler will be implemented in BioinformaticsAgent class
        throw new Error('Handler not implemented - will be set during agent initialization');
      },
    },
    {
      name: 'analyze_workflow_performance',
      description:
        'Analyze HealthOmics workflow run performance and get resource optimization recommendations.',
      inputSchema: {
        type: 'object',
        properties: {
          run_ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of HealthOmics workflow run IDs',
          },
          headroom: {
            type: 'number',
            description: 'Headroom percentage for recommendations (default: 0.2 = 20%)',
          },
        },
        required: ['run_ids'],
      },
      handler: async (_input: any) => {
        throw new Error('Handler not implemented - will be set during agent initialization');
      },
    },
    {
      name: 'get_workflow_run_status',
      description: 'Get the current status and details of a HealthOmics workflow run.',
      inputSchema: {
        type: 'object',
        properties: {
          run_id: {
            type: 'string',
            description: 'HealthOmics workflow run ID',
          },
        },
        required: ['run_id'],
      },
      handler: async (_input: any) => {
        throw new Error('Handler not implemented - will be set during agent initialization');
      },
    },
    {
      name: 'audit_service_health',
      description:
        'Audit AWS service health using Application Signals. Useful for checking if HealthOmics or related services are experiencing issues.',
      inputSchema: {
        type: 'object',
        properties: {
          service_name: {
            type: 'string',
            description: 'Service name or wildcard pattern (e.g., "*healthomics*")',
          },
          use_comprehensive_audit: {
            type: 'boolean',
            description: 'Use all auditors for deep root cause analysis (default: false)',
          },
        },
        required: ['service_name'],
      },
      handler: async (_input: any) => {
        throw new Error('Handler not implemented - will be set during agent initialization');
      },
    },
    {
      name: 'fix_iam_permission_error',
      description:
        'Automatically generate and deploy IAM policy to fix an AccessDenied error.',
      inputSchema: {
        type: 'object',
        properties: {
          error_message: {
            type: 'string',
            description: 'The AccessDenied error message from AWS',
          },
        },
        required: ['error_message'],
      },
      handler: async (_input: any) => {
        throw new Error('Handler not implemented - will be set during agent initialization');
      },
    },
  ];
}

/**
 * Create complete agent configuration
 */
export function createAgentConfiguration(): AgentConfiguration {
  return {
    ...DEFAULT_AGENT_CONFIG,
    tools: createAgentTools(),
  };
}
