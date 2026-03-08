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

  constructor() {
    this.knowledgeBaseManager = new KnowledgeBaseManager();
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
    const { query, userId = 'default-user' } = args;

    if (!this.agent) {
      return {
        content: [{
          type: 'text',
          text: 'Agent not initialized. Please run setup first.'
        }]
      };
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
