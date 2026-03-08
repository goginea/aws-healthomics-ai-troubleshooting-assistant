import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeBaseVersioning } from '../../src/knowledge/KnowledgeBaseVersioning';
import { KnowledgeSource, KnowledgeSourceType } from '../../src/types';

describe('KnowledgeBaseVersioning', () => {
  let versioning: KnowledgeBaseVersioning;
  let sources: Map<string, KnowledgeSource>;

  beforeEach(() => {
    sources = new Map();
    sources.set('source-1', {
      id: 'source-1',
      name: 'Runbooks',
      type: KnowledgeSourceType.FILE_SYSTEM,
      namespace: '/org/runbooks/',
      configuration: {},
      status: 'ACTIVE',
      lastUpdated: new Date(),
      documentCount: 10,
    });

    versioning = new KnowledgeBaseVersioning(sources);
  });

  describe('createSnapshot', () => {
    it('should create a snapshot', async () => {
      const snapshot = await versioning.createSnapshot(
        'Before Migration',
        'Snapshot before migrating to new system'
      );

      expect(snapshot.id).toContain('snapshot-');
      expect(snapshot.name).toBe('Before Migration');
      expect(snapshot.knowledgeSources).toHaveLength(1);
      expect(snapshot.documentCount).toBe(10);
    });
  });

  describe('listSnapshots', () => {
    it('should list snapshots in reverse chronological order', async () => {
      await versioning.createSnapshot('Snapshot 1');
      await new Promise((resolve) => setTimeout(resolve, 10));
      await versioning.createSnapshot('Snapshot 2');

      const snapshots = await versioning.listSnapshots();

      expect(snapshots).toHaveLength(2);
      expect(snapshots[0].name).toBe('Snapshot 2'); // Most recent first
    });
  });

  describe('getSnapshot', () => {
    it('should get a specific snapshot', async () => {
      const created = await versioning.createSnapshot('Test Snapshot');
      const retrieved = await versioning.getSnapshot(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Test Snapshot');
    });

    it('should throw error for non-existent snapshot', async () => {
      await expect(versioning.getSnapshot('non-existent')).rejects.toThrow(
        'not found'
      );
    });
  });

  describe('rollbackToSnapshot', () => {
    it('should rollback to previous snapshot', async () => {
      // Create snapshot
      const snapshot = await versioning.createSnapshot('Before Changes');

      // Modify sources
      sources.set('source-2', {
        id: 'source-2',
        name: 'New Source',
        type: KnowledgeSourceType.S3_BUCKET,
        namespace: '/org/new/',
        configuration: {},
        status: 'ACTIVE',
        lastUpdated: new Date(),
        documentCount: 5,
      });

      // Rollback
      const result = await versioning.rollbackToSnapshot(snapshot.id);

      expect(result.success).toBe(true);
      expect(result.sourcesRestored).toBe(1);
      expect(sources.size).toBe(1);
      expect(sources.has('source-2')).toBe(false);
    });
  });

  describe('deleteSnapshot', () => {
    it('should delete a snapshot', async () => {
      const snapshot = await versioning.createSnapshot('To Delete');
      await versioning.deleteSnapshot(snapshot.id);

      await expect(versioning.getSnapshot(snapshot.id)).rejects.toThrow(
        'not found'
      );
    });

    it('should throw error for non-existent snapshot', async () => {
      await expect(versioning.deleteSnapshot('non-existent')).rejects.toThrow(
        'not found'
      );
    });
  });
});
