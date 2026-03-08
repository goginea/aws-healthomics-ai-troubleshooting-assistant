/**
 * ContextManager - Manages conversation contexts using AgentCore Memory
 *
 * This class handles:
 * - Storing conversation contexts per user
 * - Retrieving conversation history
 * - Context isolation between users
 * - Integration with AgentCore Memory for persistence
 */

import type { ConversationContext } from '../types/agent';

/**
 * Memory event for storing in AgentCore Memory
 */
export interface MemoryEvent {
  eventId: string;
  userId: string;
  conversationId: string;
  timestamp: Date;
  eventType: 'QUERY' | 'RESPONSE' | 'CONTEXT_UPDATE';
  data: Record<string, any>;
}

/**
 * Context storage interface
 */
export interface ContextStorage {
  save(context: ConversationContext): Promise<void>;
  retrieve(userId: string, conversationId: string): Promise<ConversationContext | null>;
  list(userId: string): Promise<ConversationContext[]>;
  delete(userId: string, conversationId: string): Promise<void>;
}

/**
 * ContextManager class
 *
 * Manages conversation contexts with support for:
 * - In-memory storage (for development)
 * - AgentCore Memory integration (for production)
 * - Context isolation between users
 * - Automatic context expiry
 */
export class ContextManager implements ContextStorage {
  private contexts: Map<string, ConversationContext>;
  private memoryId?: string;
  private contextExpiryMs: number;

  constructor(memoryId?: string, contextExpiryHours: number = 24) {
    this.contexts = new Map();
    this.memoryId = memoryId;
    this.contextExpiryMs = contextExpiryHours * 60 * 60 * 1000;
  }

  /**
   * Save conversation context
   *
   * Stores context in memory and optionally persists to AgentCore Memory.
   *
   * @param context - Conversation context to save
   */
  async save(context: ConversationContext): Promise<void> {
    const key = this.getContextKey(context.userId, context.conversationId);
    this.contexts.set(key, context);

    // If AgentCore Memory is configured, persist there
    if (this.memoryId) {
      await this.persistToMemory(context);
    }
  }

  /**
   * Retrieve conversation context
   *
   * @param userId - User identifier
   * @param conversationId - Conversation identifier
   * @returns Context if found, null otherwise
   */
  async retrieve(userId: string, conversationId: string): Promise<ConversationContext | null> {
    const key = this.getContextKey(userId, conversationId);
    const context = this.contexts.get(key);

    if (!context) {
      // Try to retrieve from AgentCore Memory if configured
      if (this.memoryId) {
        return await this.retrieveFromMemory(userId, conversationId);
      }
      return null;
    }

    // Check if context has expired
    if (this.isExpired(context)) {
      this.contexts.delete(key);
      return null;
    }

    return context;
  }

  /**
   * List all conversation contexts for a user
   *
   * @param userId - User identifier
   * @returns Array of conversation contexts
   */
  async list(userId: string): Promise<ConversationContext[]> {
    const userContexts: ConversationContext[] = [];

    for (const [key, context] of this.contexts.entries()) {
      if (key.startsWith(`${userId}:`)) {
        if (!this.isExpired(context)) {
          userContexts.push(context);
        } else {
          this.contexts.delete(key);
        }
      }
    }

    return userContexts;
  }

  /**
   * Delete conversation context
   *
   * @param userId - User identifier
   * @param conversationId - Conversation identifier
   */
  async delete(userId: string, conversationId: string): Promise<void> {
    const key = this.getContextKey(userId, conversationId);
    this.contexts.delete(key);

    // If AgentCore Memory is configured, delete from there too
    if (this.memoryId) {
      await this.deleteFromMemory(userId, conversationId);
    }
  }

  /**
   * Create a new conversation context
   *
   * @param userId - User identifier
   * @param workflowRunId - Optional workflow run ID
   * @returns New conversation context
   */
  createContext(userId: string, workflowRunId?: string): ConversationContext {
    const context: ConversationContext = {
      conversationId: this.generateConversationId(),
      userId,
      workflowRunId,
      previousQueries: [],
      timestamp: new Date(),
    };

    return context;
  }

  /**
   * Update context with new query
   *
   * @param context - Existing context
   * @param query - New query to add
   * @returns Updated context
   */
  updateWithQuery(context: ConversationContext, query: string): ConversationContext {
    return {
      ...context,
      previousQueries: [...context.previousQueries, query],
      timestamp: new Date(),
    };
  }

  /**
   * Clear expired contexts
   *
   * Removes contexts that have exceeded the expiry time.
   */
  clearExpired(): void {
    for (const [key, context] of this.contexts.entries()) {
      if (this.isExpired(context)) {
        this.contexts.delete(key);
      }
    }
  }

  /**
   * Get context key for storage
   */
  private getContextKey(userId: string, conversationId: string): string {
    return `${userId}:${conversationId}`;
  }

  /**
   * Generate unique conversation ID
   */
  private generateConversationId(): string {
    return `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Check if context has expired
   */
  private isExpired(context: ConversationContext): boolean {
    const now = Date.now();
    const contextTime = context.timestamp.getTime();
    return now - contextTime > this.contextExpiryMs;
  }

  /**
   * Persist context to AgentCore Memory
   *
   * This will be implemented when AgentCore Memory API is integrated.
   */
  private async persistToMemory(_context: ConversationContext): Promise<void> {
    // TODO: Implement AgentCore Memory API integration
    // This would use the AgentCore Memory API to store the context
    // as a memory event with semantic extraction enabled
  }

  /**
   * Retrieve context from AgentCore Memory
   *
   * This will be implemented when AgentCore Memory API is integrated.
   */
  private async retrieveFromMemory(
    _userId: string,
    _conversationId: string,
  ): Promise<ConversationContext | null> {
    // TODO: Implement AgentCore Memory API integration
    // This would query AgentCore Memory for the conversation context
    return null;
  }

  /**
   * Delete context from AgentCore Memory
   *
   * This will be implemented when AgentCore Memory API is integrated.
   */
  private async deleteFromMemory(_userId: string, _conversationId: string): Promise<void> {
    // TODO: Implement AgentCore Memory API integration
    // This would delete the conversation context from AgentCore Memory
  }
}

