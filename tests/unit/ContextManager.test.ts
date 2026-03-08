import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContextManager } from '../../src/agent/ContextManager';
import type { ConversationContext } from '../../src/types/agent';

describe('ContextManager', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  describe('createContext', () => {
    it('should create a new conversation context', () => {
      const context = contextManager.createContext('user1');

      expect(context.userId).toBe('user1');
      expect(context.conversationId).toMatch(/^conv-\d+-[a-z0-9]+$/);
      expect(context.previousQueries).toEqual([]);
      expect(context.timestamp).toBeInstanceOf(Date);
    });

    it('should create context with workflow run ID', () => {
      const context = contextManager.createContext('user1', 'run-123');

      expect(context.userId).toBe('user1');
      expect(context.workflowRunId).toBe('run-123');
    });

    it('should generate unique conversation IDs', () => {
      const context1 = contextManager.createContext('user1');
      const context2 = contextManager.createContext('user1');

      expect(context1.conversationId).not.toBe(context2.conversationId);
    });
  });

  describe('save and retrieve', () => {
    it('should save and retrieve conversation context', async () => {
      const context = contextManager.createContext('user1');
      await contextManager.save(context);

      const retrieved = await contextManager.retrieve('user1', context.conversationId);
      expect(retrieved).toEqual(context);
    });

    it('should return null for non-existent context', async () => {
      const retrieved = await contextManager.retrieve('user1', 'non-existent');
      expect(retrieved).toBeNull();
    });

    it('should isolate contexts between users', async () => {
      const context1 = contextManager.createContext('user1');
      const context2 = contextManager.createContext('user2');

      await contextManager.save(context1);
      await contextManager.save(context2);

      const retrieved1 = await contextManager.retrieve('user1', context1.conversationId);
      const retrieved2 = await contextManager.retrieve('user2', context2.conversationId);

      expect(retrieved1).toEqual(context1);
      expect(retrieved2).toEqual(context2);

      // User1 should not be able to access user2's context
      const crossRetrieve = await contextManager.retrieve('user1', context2.conversationId);
      expect(crossRetrieve).toBeNull();
    });
  });

  describe('list', () => {
    it('should list all contexts for a user', async () => {
      const context1 = contextManager.createContext('user1');
      const context2 = contextManager.createContext('user1');
      const context3 = contextManager.createContext('user2');

      await contextManager.save(context1);
      await contextManager.save(context2);
      await contextManager.save(context3);

      const user1Contexts = await contextManager.list('user1');
      expect(user1Contexts).toHaveLength(2);
      expect(user1Contexts.map((c) => c.conversationId)).toContain(context1.conversationId);
      expect(user1Contexts.map((c) => c.conversationId)).toContain(context2.conversationId);
    });

    it('should return empty array for user with no contexts', async () => {
      const contexts = await contextManager.list('user-no-contexts');
      expect(contexts).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete conversation context', async () => {
      const context = contextManager.createContext('user1');
      await contextManager.save(context);

      await contextManager.delete('user1', context.conversationId);

      const retrieved = await contextManager.retrieve('user1', context.conversationId);
      expect(retrieved).toBeNull();
    });

    it('should not affect other contexts when deleting', async () => {
      const context1 = contextManager.createContext('user1');
      const context2 = contextManager.createContext('user1');

      await contextManager.save(context1);
      await contextManager.save(context2);

      await contextManager.delete('user1', context1.conversationId);

      const retrieved1 = await contextManager.retrieve('user1', context1.conversationId);
      const retrieved2 = await contextManager.retrieve('user1', context2.conversationId);

      expect(retrieved1).toBeNull();
      expect(retrieved2).toEqual(context2);
    });
  });

  describe('updateWithQuery', () => {
    it('should add query to context', async () => {
      const context = contextManager.createContext('user1');
      // Add small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));
      const updated = contextManager.updateWithQuery(context, 'Why did my workflow fail?');

      expect(updated.previousQueries).toEqual(['Why did my workflow fail?']);
      expect(updated.timestamp.getTime()).toBeGreaterThanOrEqual(context.timestamp.getTime());
    });

    it('should preserve existing queries', () => {
      const context = contextManager.createContext('user1');
      const updated1 = contextManager.updateWithQuery(context, 'Query 1');
      const updated2 = contextManager.updateWithQuery(updated1, 'Query 2');

      expect(updated2.previousQueries).toEqual(['Query 1', 'Query 2']);
    });

    it('should not mutate original context', () => {
      const context = contextManager.createContext('user1');
      const originalQueries = [...context.previousQueries];

      contextManager.updateWithQuery(context, 'New query');

      expect(context.previousQueries).toEqual(originalQueries);
    });
  });

  describe('context expiry', () => {
    it('should expire contexts after configured time', async () => {
      // Create context manager with 1 second expiry
      const shortExpiryManager = new ContextManager(undefined, 1 / 3600); // 1 second

      const context = shortExpiryManager.createContext('user1');
      await shortExpiryManager.save(context);

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const retrieved = await shortExpiryManager.retrieve('user1', context.conversationId);
      expect(retrieved).toBeNull();
    });

    it('should not expire contexts before configured time', async () => {
      const context = contextManager.createContext('user1');
      await contextManager.save(context);

      const retrieved = await contextManager.retrieve('user1', context.conversationId);
      expect(retrieved).toEqual(context);
    });

    it('should clear expired contexts from list', async () => {
      const shortExpiryManager = new ContextManager(undefined, 1 / 3600);

      const context1 = shortExpiryManager.createContext('user1');
      await shortExpiryManager.save(context1);

      // Wait for context1 to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const context2 = shortExpiryManager.createContext('user1');
      await shortExpiryManager.save(context2);

      // Small delay to ensure context2 is not expired
      await new Promise((resolve) => setTimeout(resolve, 100));

      const contexts = await shortExpiryManager.list('user1');
      expect(contexts.length).toBeGreaterThanOrEqual(1);
      // context2 should be in the list
      expect(contexts.some((c) => c.conversationId === context2.conversationId)).toBe(true);
    });
  });

  describe('clearExpired', () => {
    it('should remove expired contexts', async () => {
      const shortExpiryManager = new ContextManager(undefined, 1 / 3600);

      const context = shortExpiryManager.createContext('user1');
      await shortExpiryManager.save(context);

      await new Promise((resolve) => setTimeout(resolve, 1100));

      shortExpiryManager.clearExpired();

      const retrieved = await shortExpiryManager.retrieve('user1', context.conversationId);
      expect(retrieved).toBeNull();
    });
  });

  describe('AgentCore Memory integration', () => {
    it('should accept memory ID in constructor', () => {
      const managerWithMemory = new ContextManager('mem-123');
      expect(managerWithMemory).toBeDefined();
    });

    it('should save to in-memory storage even with memory ID', async () => {
      const managerWithMemory = new ContextManager('mem-123');
      const context = managerWithMemory.createContext('user1');

      await managerWithMemory.save(context);

      const retrieved = await managerWithMemory.retrieve('user1', context.conversationId);
      expect(retrieved).toEqual(context);
    });
  });
});

