/**
 * File System Connector
 *
 * Scans local or network file systems for documents
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import {
  FileSystemConfig,
  Document,
  DocumentMetadata,
  IngestionResult,
} from '../../types';

export interface IFileSystemConnector {
  scanDirectory(
    config: FileSystemConfig,
    includePatterns?: string[],
    excludePatterns?: string[]
  ): Promise<FileSystemDocument[]>;
  readDocument(filePath: string): Promise<Document>;
  syncDocuments(
    config: FileSystemConfig,
    lastSyncTime?: Date
  ): Promise<IngestionResult>;
}

export interface FileSystemDocument {
  path: string;
  name: string;
  size: number;
  modifiedDate: Date;
  extension: string;
}

/**
 * File system connector implementation
 */
export class FileSystemConnector implements IFileSystemConnector {
  /**
   * Scan directory for documents
   */
  async scanDirectory(
    config: FileSystemConfig,
    includePatterns?: string[],
    excludePatterns?: string[]
  ): Promise<FileSystemDocument[]> {
    const { basePath, fileExtensions, recursive } = config;
    const documents: FileSystemDocument[] = [];

    try {
      await this.scanDirectoryRecursive(
        basePath,
        basePath,
        fileExtensions,
        recursive,
        includePatterns,
        excludePatterns,
        documents
      );
    } catch (error) {
      throw new Error(
        `Failed to scan directory ${basePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return documents;
  }

  /**
   * Read document from file system
   */
  async readDocument(filePath: string): Promise<Document> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      const fileName = path.basename(filePath);

      return {
        id: filePath,
        title: fileName,
        content,
        metadata: {
          modifiedDate: stats.mtime,
          createdDate: stats.birthtime,
          customFields: {
            size: stats.size,
            extension: path.extname(filePath),
          },
        },
        source: 'FILE_SYSTEM',
      };
    } catch (error) {
      throw new Error(
        `Failed to read document ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Sync documents with incremental update support
   */
  async syncDocuments(
    config: FileSystemConfig,
    lastSyncTime?: Date
  ): Promise<IngestionResult> {
    try {
      // Scan directory for documents
      const files = await this.scanDirectory(config);
      const filesToSync = lastSyncTime
        ? files.filter((file) => file.modifiedDate > lastSyncTime)
        : files;

      const processedDocs: Document[] = [];
      const errors: string[] = [];

      // Read each file
      for (const file of filesToSync) {
        try {
          const doc = await this.readDocument(file.path);
          processedDocs.push(doc);
        } catch (error) {
          errors.push(
            `Failed to read ${file.name}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      return {
        success: errors.length === 0,
        documentsProcessed: processedDocs.length,
        documentsFailed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        documentsProcessed: 0,
        documentsFailed: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Recursively scan directory
   */
  private async scanDirectoryRecursive(
    currentPath: string,
    basePath: string,
    fileExtensions: string[],
    recursive: boolean,
    includePatterns: string[] | undefined,
    excludePatterns: string[] | undefined,
    results: FileSystemDocument[]
  ): Promise<void> {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          if (recursive) {
            await this.scanDirectoryRecursive(
              fullPath,
              basePath,
              fileExtensions,
              recursive,
              includePatterns,
              excludePatterns,
              results
            );
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (fileExtensions.includes(ext)) {
            const stats = await fs.stat(fullPath);
            const doc: FileSystemDocument = {
              path: fullPath,
              name: entry.name,
              size: stats.size,
              modifiedDate: stats.mtime,
              extension: ext,
            };

            // Apply include/exclude patterns
            if (this.matchesPatterns(entry.name, includePatterns, excludePatterns)) {
              results.push(doc);
            }
          }
        }
      }
    } catch (error) {
      // Skip directories we can't access
      if ((error as any).code !== 'EACCES') {
        throw error;
      }
    }
  }

  /**
   * Check if filename matches include/exclude patterns
   */
  private matchesPatterns(
    filename: string,
    includePatterns?: string[],
    excludePatterns?: string[]
  ): boolean {
    if (!includePatterns && !excludePatterns) {
      return true;
    }

    if (excludePatterns) {
      for (const pattern of excludePatterns) {
        if (this.matchesPattern(filename, pattern)) {
          return false;
        }
      }
    }

    if (includePatterns) {
      for (const pattern of includePatterns) {
        if (this.matchesPattern(filename, pattern)) {
          return true;
        }
      }
      return false;
    }

    return true;
  }

  /**
   * Simple pattern matching (supports * wildcard)
   */
  private matchesPattern(filename: string, pattern: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
      'i'
    );
    return regex.test(filename);
  }
}
