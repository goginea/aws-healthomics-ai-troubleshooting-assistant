// AgentCore agent type definitions
// To be implemented in Task 1

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

// Additional types to be added in Task 1
