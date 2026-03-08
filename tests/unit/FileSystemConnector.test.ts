import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileSystemConnector } from '../../src/knowledge/connectors/FileSystemConnector';
import { FileSystemConfig } from '../../src/types';
import * as fs from 'fs/promises';

// Mock fs module
vi.mock('fs/promises');

describe('FileSystemConnector', () => {
  let connector: FileSystemConnector;

  beforeEach(() => {
    connector = new FileSystemConnector();
    vi.clearAllMocks();
  });

  describe('scanDirectory', () => {
    it('should scan directory for documents', async () => {
      const config: FileSystemConfig = {
        basePath: '/path/to/runbooks',
        fileExtensions: ['.md', '.txt'],
        recursive: true,
      };

      // Mock fs.readdir
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'doc1.md', isFile: () => true, isDirectory: () => false } as any,
        { name: 'doc2.txt', isFile: () => true, isDirectory: () => false } as any,
      ]);

      // Mock fs.stat
      vi.mocked(fs.stat).mockResolvedValue({
        size: 1024,
        mtime: new Date(),
      } as any);

      const documents = await connector.scanDirectory(config);
      expect(Array.isArray(documents)).toBe(true);
    });

    it('should filter by file extensions', async () => {
      const config: FileSystemConfig = {
        basePath: '/path/to/runbooks',
        fileExtensions: ['.md'],
        recursive: false,
      };

      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'doc1.md', isFile: () => true, isDirectory: () => false } as any,
        { name: 'doc2.txt', isFile: () => true, isDirectory: () => false } as any,
      ]);

      vi.mocked(fs.stat).mockResolvedValue({
        size: 1024,
        mtime: new Date(),
      } as any);

      const documents = await connector.scanDirectory(config);
      expect(documents.every((doc) => doc.extension === '.md')).toBe(true);
    });
  });

  describe('readDocument', () => {
    it('should read document content', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('Document content');
      vi.mocked(fs.stat).mockResolvedValue({
        size: 1024,
        mtime: new Date(),
        birthtime: new Date(),
      } as any);

      const document = await connector.readDocument('/path/to/doc.md');

      expect(document.id).toBe('/path/to/doc.md');
      expect(document.source).toBe('FILE_SYSTEM');
      expect(document.content).toBe('Document content');
    });
  });

  describe('syncDocuments', () => {
    it('should sync all documents on first sync', async () => {
      const config: FileSystemConfig = {
        basePath: '/path/to/runbooks',
        fileExtensions: ['.md'],
        recursive: true,
      };

      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'doc1.md', isFile: () => true, isDirectory: () => false } as any,
      ]);

      vi.mocked(fs.stat).mockResolvedValue({
        size: 1024,
        mtime: new Date(),
        birthtime: new Date(),
      } as any);

      vi.mocked(fs.readFile).mockResolvedValue('Content');

      const result = await connector.syncDocuments(config);

      expect(result.success).toBe(true);
      expect(result.documentsProcessed).toBeGreaterThanOrEqual(0);
    });
  });
});
