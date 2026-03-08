#!/usr/bin/env node
/**
 * MCP Server for HealthOmics AI Troubleshooter
 * 
 * Provides management commands for the Power
 */

import { BioinformaticsAgent } from './agent/BioinformaticsAgent';
import { KnowledgeBaseManager } from './knowledge/KnowledgeBaseManager';

interface MCPRequest {
  method: string;
  params?: {
    name?: string;
    arguments?: Record<string, any>;
  };
}

interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

/**
 * MCP Server implementation
 */
class HealthOmicsAITroubleshooterMCPServer {
  private agent: BioinformaticsAgent | null = null;
  private knowledgeBaseManager: KnowledgeBaseManager;
  private agentId: string | undefined;
  private agentAliasId: string | undefined;
  private region: string | undefined;

  constructor() {
    this.knowledgeBaseManager = new KnowledgeBaseManager();
    
    // Try to load agent configuration from environment
    this.agentId = process.env.HEALTHOMICS_AGENT_ID;
    this.agentAliasId = process.env.HEALTHOMICS_AGENT_ALIAS_ID || 'TSTALIASID';
    this.region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
  }

  /**
   * Handle MCP tool calls
   */
  async handleToolCall(toolName: string, args: Record<string, any>): Promise<MCPResponse> {
    switch (toolName) {
      case 'add_knowledge_source':
        return this.addKnowledgeSource(args);
      
      case 'query_agent':
        return this.queryAgent(args);
      
      default:
        return {
          content: [{
            type: 'text',
            text: `Unknown tool: ${toolName}. Available tools: add_knowledge_source, query_agent`
          }]
        };
    }
  }

  /**
   * Add knowledge source
   */
  private async addKnowledgeSource(args: Record<string, any>): Promise<MCPResponse> {
    const { name, type, configuration } = args;

    try {
      const result = await this.knowledgeBaseManager.addKnowledgeSource({
        id: `source-${Date.now()}`,
        name,
        type,
        namespace: `/org/${name}/`,
        configuration,
        status: 'INDEXING',
        lastUpdated: new Date(),
        documentCount: 0
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            message: 'Knowledge source added successfully',
            sourceId: result.sourceId,
            status: result.status
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Failed to add knowledge source: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }

  /**
   * Query the bioinformatics agent
   */
  private async queryAgent(args: Record<string, any>): Promise<MCPResponse> {
    const { query, userId = 'default-user', agentId, agentAliasId, region } = args;

    // Use provided agentId or fall back to environment variable
    const effectiveAgentId = agentId || this.agentId;
    const effectiveAgentAliasId = agentAliasId || this.agentAliasId;
    const effectiveRegion = region || this.region;

    if (!effectiveAgentId) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: 'Agent ID not configured',
            message: 'Please provide agentId parameter or set HEALTHOMICS_AGENT_ID environment variable',
            instructions: [
              '1. Deploy the CDK stack to get the agent ID',
              '2. Set environment variable: export HEALTHOMICS_AGENT_ID=your-agent-id',
              '3. Or provide agentId in the query: { "agentId": "your-agent-id", "query": "..." }'
            ]
          }, null, 2)
        }]
      };
    }

    // Initialize agent if not already done
    if (!this.agent) {
      // Create agent instance with Power clients
      // Note: Power clients would need to be initialized here
      // For now, we'll create a minimal agent instance
      const { BioinformaticsAgent } = await import('./agent/BioinformaticsAgent');
      const { PowerClient } = await import('./orchestration/PowerClient');
      const { HealthOmicsPowerClient } = await import('./powers/HealthOmicsPowerClient');
      const { ObservabilityPowerClient } = await import('./powers/ObservabilityPowerClient');
      const { IAMPolicyAutopilotClient } = await import('./powers/IAMPolicyAutopilotClient');

      const powerClient = new PowerClient();
      const healthOmicsClient = new HealthOmicsPowerClient(powerClient);
      const observabilityClient = new ObservabilityPowerClient(powerClient);
      const iamClient = new IAMPolicyAutopilotClient(powerClient);

      this.agent = new BioinformaticsAgent(
        powerClient,
        healthOmicsClient,
        observabilityClient,
        iamClient
      );

      // Initialize connection to deployed agent
      this.agent.initializeAgentConnection(effectiveAgentId, effectiveAgentAliasId, effectiveRegion);
    }

    try {
      const response = await this.agent.processQuery(query, userId);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            message: response.message,
            conversationId: response.conversationId,
            traceId: response.traceId
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Query failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }

  /**
   * List available tools
   */
  listTools() {
    return {
      tools: [
        {
          name: 'add_knowledge_source',
          description: 'Add a custom knowledge source (SharePoint, Confluence, S3, file system) to the deployed agent',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the knowledge source'
              },
              type: {
                type: 'string',
                enum: ['SHAREPOINT', 'CONFLUENCE', 'FILE_SYSTEM', 'S3_BUCKET', 'WIKI', 'HISTORICAL_LOGS'],
                description: 'Type of knowledge source'
              },
              configuration: {
                type: 'object',
                description: 'Source-specific configuration (URLs, credentials, paths, etc.)'
              }
            },
            required: ['name', 'type', 'configuration']
          }
        },
        {
          name: 'query_agent',
          description: 'Ask the bioinformatics agent a question about workflow failures or troubleshooting (requires agent to be deployed first)',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Natural language question about workflow failures'
              },
              userId: {
                type: 'string',
                description: 'User identifier for conversation context',
                default: 'default-user'
              },
              agentId: {
                type: 'string',
                description: 'Agent ID from CDK deployment (optional if HEALTHOMICS_AGENT_ID env var is set)'
              },
              agentAliasId: {
                type: 'string',
                description: 'Agent alias ID (default: TSTALIASID)',
                default: 'TSTALIASID'
              },
              region: {
                type: 'string',
                description: 'AWS region where agent is deployed (default: us-east-1)',
                default: 'us-east-1'
              }
            },
            required: ['query']
          }
        }
      ]
    };
  }

  /**
   * Main server loop
   */
  async start() {
    // MCP server protocol implementation
    process.stdin.setEncoding('utf8');
    
    let buffer = '';
    
    process.stdin.on('data', async (chunk) => {
      buffer += chunk;
      
      // Process complete JSON-RPC messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          const request: MCPRequest = JSON.parse(line);
          
          if (request.method === 'tools/list') {
            const response = this.listTools();
            console.log(JSON.stringify(response));
          } else if (request.method === 'tools/call' && request.params) {
            const toolName = request.params.name || '';
            const args = request.params.arguments || {};
            const response = await this.handleToolCall(toolName, args);
            console.log(JSON.stringify(response));
          }
        } catch (error) {
          console.error(JSON.stringify({
            error: error instanceof Error ? error.message : String(error)
          }));
        }
      }
    });
  }
}

// Start the MCP server
const server = new HealthOmicsAITroubleshooterMCPServer();
server.start().catch(console.error);
