/**
 * Knowledge Base Management Module
 *
 * Provides custom knowledge base management and integration with AgentCore Memory
 */

export { KnowledgeBaseManager } from './KnowledgeBaseManager';
export type { IKnowledgeBaseManager } from './KnowledgeBaseManager';

// Re-export existing knowledge components
export { GenomicsKnowledgeBase } from './GenomicsKnowledgeBase';
export { GenomicsContextInterpreter } from './GenomicsContextInterpreter';
export { GenomicsRecommendationEngine } from './GenomicsRecommendationEngine';
