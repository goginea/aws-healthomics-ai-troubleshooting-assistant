/**
 * S3 Connector
 *
 * Handles document enumeration and download from S3 buckets
 */

import {
  S3Config,
  Document,
  DocumentMetadata,
  IngestionResult,
} from '../../types';

export interface IS3Connector {
  listObjects(
    config: S3Config,
    includePatterns?: string[],
    excludePatterns?: string[]
  ): Promise<S3Object[]>;
  downloadObject(config: S3Config, key: string): Promise<Document>;
  syncObjects(
    config: S3Config,
    lastSyncTime?: Date
  ): Promise<IngestionResult>;
}

export interface S3Object {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
}

/**
 * S3 connector implementation
 */
export class S3Connector implements IS3Connector {
  /**
   * List objects in S3 bucket
   */
  async listObjects(
    config: S3Config,
    includePatterns?: string[],
    excludePatterns?: string[]
  ): Promise<S3Object[]> {
    const { bucket, prefix, region } = config;
    const objects: S3Object[] = [];

    // Placeholder for AWS SDK S3 listObjectsV2 call
    // In real implementation, would use @aws-sdk/client-s3
    const response = await this.callS3API('listObjectsV2', {
      Bucket: bucket,
      Prefix: prefix,
    });

    // Parse response and filter by patterns
    for (const obj of response.Contents || []) {
      const s3Object: S3Object = {
        key: obj.Key,
        size: obj.Size,
        lastModified: new Date(obj.LastModified),
        etag: obj.ETag,
      };

      // Apply include/exclude patterns
      const fileName = s3Object.key.split('/').pop() || '';
      if (this.matchesPatterns(fileName, includePatterns, excludePatterns)) {
        objects.push(s3Object);
      }
    }

    return objects;
  }

  /**
   * Download object from S3
   */
  async downloadObject(config: S3Config, key: string): Promise<Document> {
    const { bucket, region } = config;

    // Get object metadata
    const headResponse = await this.callS3API('headObject', {
      Bucket: bucket,
      Key: key,
    });

    // Download object content
    const getResponse = await this.callS3API('getObject', {
      Bucket: bucket,
      Key: key,
    });

    const content = getResponse.Body?.toString('utf-8') || '';
    const fileName = key.split('/').pop() || key;

    return {
      id: `s3://${bucket}/${key}`,
      title: fileName,
      content,
      metadata: this.parseMetadata(headResponse),
      source: 'S3_BUCKET',
    };
  }

  /**
   * Sync objects with incremental update support
   */
  async syncObjects(
    config: S3Config,
    lastSyncTime?: Date
  ): Promise<IngestionResult> {
    try {
      // List objects modified since last sync
      const objects = await this.listObjects(config);
      const objectsToSync = lastSyncTime
        ? objects.filter((obj) => obj.lastModified > lastSyncTime)
        : objects;

      const processedDocs: Document[] = [];
      const errors: string[] = [];

      // Download and process each object
      for (const obj of objectsToSync) {
        try {
          const doc = await this.downloadObject(config, obj.key);
          processedDocs.push(doc);
        } catch (error) {
          errors.push(
            `Failed to download ${obj.key}: ${error instanceof Error ? error.message : String(error)}`
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
   * Call S3 API (placeholder)
   */
  private async callS3API(operation: string, params: any): Promise<any> {
    // Placeholder for actual AWS SDK call
    if (operation === 'listObjectsV2') {
      return { Contents: [] };
    } else if (operation === 'headObject') {
      return {
        ContentLength: 0,
        LastModified: new Date(),
        Metadata: {},
      };
    } else if (operation === 'getObject') {
      return {
        Body: Buffer.from('Document content placeholder'),
      };
    }
    return {};
  }

  /**
   * Parse S3 metadata to Document metadata
   */
  private parseMetadata(s3Metadata: any): DocumentMetadata {
    return {
      modifiedDate: s3Metadata.LastModified
        ? new Date(s3Metadata.LastModified)
        : undefined,
      customFields: {
        contentLength: s3Metadata.ContentLength,
        contentType: s3Metadata.ContentType,
        etag: s3Metadata.ETag,
        metadata: s3Metadata.Metadata,
      },
    };
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
