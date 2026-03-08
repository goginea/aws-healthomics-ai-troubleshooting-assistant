/**
 * BioinformaticsAgent - Main agent class for deployment and interaction
 *
 * This class handles:
 * - Agent deployment to AWS Bedrock AgentCore
 * - Query processing with conversation context
 * - Tool handler implementation for Power orchestration
 */

import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
  InvokeAgentCommandInput,
} from '@aws-sdk/client-bedrock-agent-runtime';
import type {
  AgentConfiguration,
  AgentResponse,
  ConversationContext,
  AgentDeployment,
} from '../types/agent';
import { createAgentConfiguration } from './BioinformaticsAgentConfig';
import { ContextManager } from './ContextManager';
import type { PowerClient } from '../orchestration/PowerClient';
import type { HealthOmicsPowerClient } from '../powers/HealthOmicsPowerClient';
import type { ObservabilityPowerClient } from '../powers/ObservabilityPowerClient';
import type { IAMPolicyAutopilotClient } from '../powers/IAMPolicyAutopilotClient';

/**
 * Deployment configuration for the agent
 */
export interface DeploymentConfig {
  region: string;
  agentName: string;
  executionRoleArn?: string;
  memoryId?: string;
  knowledgeBaseId?: string;
}

/**
 * BioinformaticsAgent class
 *
 * Manages the lifecycle of the AgentCore bioinformatics agent including
 * deployment, configuration, and query processing.
 */
export class BioinformaticsAgent {
  private config: AgentConfiguration;
  private healthOmicsClient: HealthOmicsPowerClient;
  private observabilityClient: ObservabilityPowerClient;
  private iamClient: IAMPolicyAutopilotClient;
  private deployment?: AgentDeployment;
  private contextManager: ContextManager;
  private bedrockAgentRuntime?: BedrockAgentRuntimeClient;
  private agentId?: string;
  private agentAliasId?: string;

  constructor(
    _powerClient: PowerClient,
    healthOmicsClient: HealthOmicsPowerClient,
    observabilityClient: ObservabilityPowerClient,
    iamClient: IAMPolicyAutopilotClient,
  ) {
    this.config = createAgentConfiguration();
    this.healthOmicsClient = healthOmicsClient;
    this.observabilityClient = observabilityClient;
    this.iamClient = iamClient;
    this.contextManager = new ContextManager();

    // Bind tool handlers to Power clients
    this.bindToolHandlers();
  }

  /**
   * Bind tool handlers to actual Power client methods
   *
   * This connects the agent's tool definitions to the Power orchestration clients.
   */
  private bindToolHandlers(): void {
    const tools = this.config.tools;

    // diagnose_workflow_failure
    const diagnoseTool = tools.find((t) => t.name === 'diagnose_workflow_failure');
    if (diagnoseTool) {
      diagnoseTool.handler = async (input: any) => {
        const { run_id, detailed = false } = input;
        return await this.healthOmicsClient.diagnoseRunFailure(run_id, detailed);
      };
    }

    // analyze_workflow_performance
    const analyzeTool = tools.find((t) => t.name === 'analyze_workflow_performance');
    if (analyzeTool) {
      analyzeTool.handler = async (input: any) => {
        const { run_ids, headroom = 0.2 } = input;
        return await this.healthOmicsClient.analyzeRunPerformance(run_ids, headroom);
      };
    }

    // get_workflow_run_status
    const statusTool = tools.find((t) => t.name === 'get_workflow_run_status');
    if (statusTool) {
      statusTool.handler = async (input: any) => {
        const { run_id } = input;
        return await this.healthOmicsClient.getRun(run_id);
      };
    }

    // audit_service_health
    const auditTool = tools.find((t) => t.name === 'audit_service_health');
    if (auditTool) {
      auditTool.handler = async (input: any) => {
        const { service_name, use_comprehensive_audit = false } = input;
        return await this.observabilityClient.auditServices(service_name, use_comprehensive_audit);
      };
    }

    // fix_iam_permission_error
    const iamTool = tools.find((t) => t.name === 'fix_iam_permission_error');
    if (iamTool) {
      iamTool.handler = async (input: any) => {
        const { error_message } = input;
        // Use the convenience method that generates and deploys the policy
        return await this.iamClient.generateAndFixAccessDenied(error_message);
      };
    }
  }

  /**
   * Deploy the agent to AWS Bedrock AgentCore
   *
   * This method handles the deployment process using the AgentCore CLI or CDK.
   * For now, it returns deployment configuration that can be used with CDK.
   *
   * @param deploymentConfig - Configuration for deployment
   * @returns Deployment result with agent ID and ARN
   */
  async deploy(deploymentConfig: DeploymentConfig): Promise<AgentDeployment> {
    // Update configuration with deployment-specific values
    if (deploymentConfig.memoryId && this.config.memory) {
      this.config.memory.memoryId = deploymentConfig.memoryId;
      // Update context manager with memory ID
      this.contextManager = new ContextManager(deploymentConfig.memoryId);
    }

    if (deploymentConfig.knowledgeBaseId && this.config.knowledgeBase) {
      this.config.knowledgeBase.baseKnowledgeBaseId = deploymentConfig.knowledgeBaseId;
    }

    // In a real deployment, this would:
    // 1. Package the agent code
    // 2. Build Docker container with ARM64 architecture
    // 3. Push to ECR
    // 4. Create AgentCore Runtime via CDK or CLI
    // 5. Configure Memory and Knowledge Base
    //
    // For now, we return a deployment configuration that can be used
    // by the CDK stack (implemented in src/infrastructure/CDKStack.ts)

    const deployment: AgentDeployment = {
      agentId: `${deploymentConfig.agentName}-${Date.now()}`,
      agentArn: `arn:aws:bedrock-agentcore:${deploymentConfig.region}:${this.getAccountId()}:runtime/${deploymentConfig.agentName}`,
      agentVersion: '1.0.0',
      status: 'CREATING',
    };

    this.deployment = deployment;
    return deployment;
  }

  /**
   * Get the agent's deployment configuration
   *
   * This returns the configuration needed for CDK deployment.
   */
  getDeploymentConfiguration(): AgentConfiguration {
    return this.config;
  }

  /**
   * Process a natural language query
   *
   * This method:
   * 1. Retrieves or creates conversation context
   * 2. Processes the query (placeholder for AgentCore Runtime invocation)
   * 3. Updates context with the query
   * 4. Returns the agent's response
   *
   * @param query - Natural language query from user
   * @param userId - User identifier
   * @param conversationId - Optional conversation ID to continue existing conversation
   * @returns Agent response with message and conversation ID
   */
  /**
     * Process a natural language query
     *
     * Invokes the deployed AgentCore agent on AWS Bedrock to process the query.
     *
     * @param query - Natural language query from user
     * @param userId - User identifier
     * @param conversationId - Optional conversation ID to continue existing conversation
     * @returns Agent response with message and conversation ID
     */
    async processQuery(
      query: string,
      userId: string,
      conversationId?: string,
    ): Promise<AgentResponse> {
      // Check if agent is initialized
      if (!this.bedrockAgentRuntime || !this.agentId || !this.agentAliasId) {
        throw new Error(
          'Agent not initialized. Call initializeAgentConnection() with agentId from CDK deployment first.'
        );
      }

      // Step 1: Get or create conversation context
      let context: ConversationContext | null = null;

      if (conversationId) {
        context = await this.contextManager.retrieve(userId, conversationId);
      }

      if (!context) {
        context = this.contextManager.createContext(userId);
      }

      // Step 2: Update context with new query
      context = this.contextManager.updateWithQuery(context, query);

      // Step 3: Invoke AgentCore Runtime on AWS Bedrock
      const input: InvokeAgentCommandInput = {
        agentId: this.agentId,
        agentAliasId: this.agentAliasId,
        sessionId: context.conversationId,
        inputText: query,
        enableTrace: true, // Enable tracing for debugging
      };

      try {
        const command = new InvokeAgentCommand(input);
        const response = await this.bedrockAgentRuntime.send(command);

        // Step 4: Process streaming response
        let fullResponse = '';
        const citations: any[] = [];
        let traceId: string | undefined;

        if (response.completion) {
          for await (const event of response.completion) {
            if (event.chunk?.bytes) {
              // Decode the response chunk
              const chunkText = new TextDecoder().decode(event.chunk.bytes);
              fullResponse += chunkText;
            }

            if (event.trace) {
              // Capture trace information for debugging
              // Note: Using timestamp as traceId since trace structure varies
              traceId = `trace-${Date.now()}`;
            }

            if (event.returnControl) {
              // Handle tool invocations if needed
              // The agent may request to invoke tools
            }
          }
        }

        // Step 5: Create response
        const agentResponse: AgentResponse = {
          message: fullResponse || 'No response from agent',
          conversationId: context.conversationId,
          traceId: traceId || `trace-${Date.now()}`,
          citations,
        };

        // Step 6: Save updated context
        await this.contextManager.save(context);

        return agentResponse;
      } catch (error) {
        // Handle errors gracefully
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
          message: `Error invoking agent: ${errorMessage}\n\nPlease verify:\n1. Agent is deployed via CDK\n2. Agent ID is correct\n3. AWS credentials have bedrock:InvokeAgent permission`,
          conversationId: context.conversationId,
          traceId: `error-${Date.now()}`,
        };
      }
    }
    /**
     * Initialize connection to deployed AgentCore agent
     *
     * @param agentId - The deployed agent ID from CDK stack output
     * @param agentAliasId - The agent alias ID (default: 'TSTALIASID' for test alias)
     * @param region - AWS region where agent is deployed
     */
    initializeAgentConnection(agentId: string, agentAliasId: string = 'TSTALIASID', region: string = 'us-east-1'): void {
      this.agentId = agentId;
      this.agentAliasId = agentAliasId;
      this.bedrockAgentRuntime = new BedrockAgentRuntimeClient({ region });
    }



  /**
   * Maintain conversation context
   *
   * Stores or updates conversation context for a user.
   *
   * @param userId - User identifier
   * @param context - Conversation context to maintain
   */
  async maintainContext(userId: string, context: ConversationContext): Promise<void> {
    // Validate that context belongs to the user
    if (context.userId !== userId) {
      throw new Error('Context userId does not match provided userId');
    }

    // Save context using context manager
    await this.contextManager.save(context);
  }

  /**
   * Retrieve conversation context
   *
   * @param userId - User identifier
   * @param conversationId - Conversation identifier
   * @returns Context if found, null otherwise
   */
  async getContext(userId: string, conversationId: string): Promise<ConversationContext | null> {
    return await this.contextManager.retrieve(userId, conversationId);
  }

  /**
   * List all conversations for a user
   *
   * @param userId - User identifier
   * @returns Array of conversation contexts
   */
  async listContexts(userId: string): Promise<ConversationContext[]> {
    return await this.contextManager.list(userId);
  }

  /**
   * Create a new conversation context
   *
   * @param userId - User identifier
   * @param workflowRunId - Optional workflow run ID
   * @returns New conversation context
   */
  createNewContext(userId: string, workflowRunId?: string): ConversationContext {
    return this.contextManager.createContext(userId, workflowRunId);
  }

  /**
   * Delete conversation context
   *
   * @param userId - User identifier
   * @param conversationId - Conversation identifier
   */
  async deleteContext(userId: string, conversationId: string): Promise<void> {
    await this.contextManager.delete(userId, conversationId);
  }

  /**
   * Get AWS account ID (placeholder)
   */
  private getAccountId(): string {
    // In real implementation, this would get from AWS STS
    return '122276002175'; // dev-healthomics account
  }

  /**
   * Get current deployment status
   */
  getDeployment(): AgentDeployment | undefined {
    return this.deployment;
  }
}

