// AgentCore agent type definitions

export interface AgentConfiguration {
  agentName: string;
  modelId: string;
  instruction: string;
  tools: AgentTool[];
  knowledgeBase?: KnowledgeBaseConfig;
  memory?: MemoryConfig;
  guardrails?: GuardrailConfig;
}

export interface AgentTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  handler: (input: any) => Promise<any>;
}

export interface KnowledgeBaseConfig {
  baseKnowledgeBaseId: string;
  customKnowledgeSources: string[];
  knowledgeBaseNamespaces: string[];
  retrievalConfiguration: {
    vectorSearchConfiguration: {
      numberOfResults: number;
      overrideSearchType?: 'HYBRID' | 'SEMANTIC';
    };
  };
  prioritizeCustomKnowledge: boolean;
}

export interface MemoryConfig {
  memoryId: string;
  strategies: MemoryStrategy[];
  eventExpiryDays: number;
  enableSemanticExtraction: boolean;
}

export interface MemoryStrategy {
  type: 'SEMANTIC' | 'USER_PREFERENCE' | 'EVENT';
  name: string;
  namespaces: string[];
  extractionPrompt?: string;
}

export interface GuardrailConfig {
  guardrailId: string;
  guardrailVersion: string;
}

export interface AgentResponse {
  message: string;
  conversationId: string;
  traceId?: string;
  citations?: Citation[];
}

export interface Citation {
  source: string;
  content: string;
  relevanceScore?: number;
}

export interface ConversationContext {
  conversationId: string;
  userId: string;
  workflowRunId?: string;
  previousQueries: string[];
  timestamp: Date;
}

export interface AgentDeployment {
  agentId: string;
  agentArn: string;
  agentVersion: string;
  status: 'CREATING' | 'ACTIVE' | 'FAILED';
}

