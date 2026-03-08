/**
 * GenomicsKnowledgeBase - Domain knowledge for bioinformatics workflows
 * 
 * This knowledge base contains:
 * - Genomics terminology and workflow types
 * - Bioinformatics tool error patterns
 * - Typical resource requirements
 * - Common failure modes
 */

export interface WorkflowTypeInfo {
  name: string;
  description: string;
  typicalTools: string[];
  typicalResourceRequirements: ResourceRequirements;
  commonFailurePatterns: string[];
}

export interface ResourceRequirements {
  cpu: string;
  memory: string;
  storage: string;
  notes: string[];
}

export interface BioinformaticsToolInfo {
  name: string;
  description: string;
  commonErrorPatterns: ErrorPattern[];
  typicalResourceNeeds: ResourceRequirements;
  troubleshootingTips: string[];
}

export interface ErrorPattern {
  pattern: string | RegExp;
  cause: string;
  recommendation: string;
  confidence: number;
}

export class GenomicsKnowledgeBase {
  /**
   * Workflow type definitions
   */
  static readonly WORKFLOW_TYPES: Record<string, WorkflowTypeInfo> = {
    WGS: {
      name: 'Whole Genome Sequencing (WGS)',
      description:
        'Complete sequencing of an organism\'s genome, typically 30-50x coverage for humans',
      typicalTools: ['BWA-MEM2', 'GATK HaplotypeCaller', 'Samtools', 'Picard', 'FastQC'],
      typicalResourceRequirements: {
        cpu: '8-32 vCPUs',
        memory: '32-128 GB',
        storage: '500 GB - 2 TB',
        notes: [
          'Alignment (BWA-MEM2): 16-32 GB memory, 8-16 vCPUs',
          'Variant calling (GATK): 32-64 GB memory, 4-8 vCPUs',
          'Storage scales with coverage depth',
        ],
      },
      commonFailurePatterns: [
        'Memory exhaustion during GATK HaplotypeCaller',
        'Disk space exhaustion during alignment',
        'Reference genome path errors',
        'FASTQ file format issues',
      ],
    },
    WES: {
      name: 'Whole Exome Sequencing (WES)',
      description: 'Sequencing of protein-coding regions (~1-2% of genome)',
      typicalTools: ['BWA-MEM', 'GATK HaplotypeCaller', 'Samtools', 'Picard'],
      typicalResourceRequirements: {
        cpu: '4-16 vCPUs',
        memory: '16-64 GB',
        storage: '100-500 GB',
        notes: [
          'Lower resource needs than WGS due to smaller target region',
          'GATK still requires 2x reference genome size + overhead',
        ],
      },
      commonFailurePatterns: [
        'Insufficient memory for GATK',
        'Exome capture kit BED file errors',
        'Reference genome mismatch',
      ],
    },
    'RNA-Seq': {
      name: 'RNA Sequencing',
      description: 'Sequencing of RNA transcripts for gene expression analysis',
      typicalTools: ['STAR', 'HISAT2', 'Salmon', 'DESeq2', 'edgeR', 'Samtools'],
      typicalResourceRequirements: {
        cpu: '8-16 vCPUs',
        memory: '32-64 GB',
        storage: '200-800 GB',
        notes: [
          'STAR alignment requires 30-40 GB memory for human genome',
          'Index generation is memory-intensive',
        ],
      },
      commonFailurePatterns: [
        'STAR index memory exhaustion',
        'GTF/GFF annotation file format errors',
        'Strand-specific library prep mismatches',
      ],
    },
    'Variant Calling': {
      name: 'Variant Calling',
      description: 'Identification of genetic variants from aligned sequencing data',
      typicalTools: ['GATK HaplotypeCaller', 'FreeBayes', 'VarScan', 'BCFtools'],
      typicalResourceRequirements: {
        cpu: '4-8 vCPUs',
        memory: '16-64 GB',
        storage: '100-500 GB',
        notes: [
          'GATK requires 2x reference genome size + 4 GB overhead',
          'Joint calling scales with sample count',
        ],
      },
      commonFailurePatterns: [
        'Java heap space errors in GATK',
        'VCF format validation failures',
        'Reference genome version mismatches',
      ],
    },
  };

  /**
   * Bioinformatics tool definitions
   */
  static readonly BIOINFORMATICS_TOOLS: Record<string, BioinformaticsToolInfo> = {
    'GATK': {
      name: 'Genome Analysis Toolkit (GATK)',
      description: 'Variant discovery and genotyping toolkit',
      commonErrorPatterns: [
        {
          pattern: /java\.lang\.OutOfMemoryError.*heap space/i,
          cause: 'Java heap memory exhaustion',
          recommendation:
            'Increase memory allocation. GATK requires 2x reference genome size + 4 GB overhead. For hg38 (3.1 GB), use minimum 10 GB, recommended 16 GB.',
          confidence: 0.95,
        },
        {
          pattern: /GC overhead limit exceeded/i,
          cause: 'Excessive garbage collection due to insufficient heap',
          recommendation:
            'Increase Java heap size using --java-options "-Xmx12g" or increase container memory allocation.',
          confidence: 0.9,
        },
        {
          pattern: /Could not find or load main class/i,
          cause: 'GATK JAR file not found or classpath issue',
          recommendation:
            'Verify GATK installation path and ensure GATK JAR is accessible in container.',
          confidence: 0.85,
        },
        {
          pattern: /Reference sequence.*not found/i,
          cause: 'Reference genome file path incorrect or file missing',
          recommendation:
            'Verify reference genome path uses s3:// prefix for S3 locations. Ensure reference genome is indexed (.fai file present).',
          confidence: 0.9,
        },
      ],
      typicalResourceNeeds: {
        cpu: '4-8 vCPUs',
        memory: '16-64 GB (2x genome size + 4 GB)',
        storage: '100-500 GB',
        notes: [
          'HaplotypeCaller: 16-32 GB for WGS, 8-16 GB for WES',
          'GenotypeGVCFs: Scales with sample count',
          'Use --java-options to control heap size',
        ],
      },
      troubleshootingTips: [
        'Check Java heap size with --java-options "-Xmx"',
        'Verify reference genome is properly indexed (.fai, .dict files)',
        'For WGS, use at least 16 GB memory',
        'Monitor memory usage with Run Analyzer',
      ],
    },
    'BWA-MEM2': {
      name: 'Burrows-Wheeler Aligner MEM2',
      description: 'Fast and accurate alignment tool for short reads',
      commonErrorPatterns: [
        {
          pattern: /Segmentation fault/i,
          cause: 'Memory access violation, often due to insufficient memory',
          recommendation:
            'Increase memory allocation. BWA-MEM2 requires reference genome size + 8 GB minimum. For hg38, use 16 GB minimum.',
          confidence: 0.85,
        },
        {
          pattern: /fail to locate the index files/i,
          cause: 'Reference genome index files not found',
          recommendation:
            'Ensure reference genome is indexed with bwa-mem2 index. Check for .amb, .ann, .bwt, .pac, .sa files.',
          confidence: 0.95,
        },
        {
          pattern: /Killed/i,
          cause: 'Process killed by OOM killer',
          recommendation:
            'Increase memory allocation. BWA-MEM2 needs reference size + 8 GB. For hg38 (3.1 GB), use 16 GB minimum.',
          confidence: 0.9,
        },
      ],
      typicalResourceNeeds: {
        cpu: '8-32 vCPUs',
        memory: '16-32 GB (genome size + 8 GB)',
        storage: '200-800 GB',
        notes: [
          'Scales well with CPU count',
          'Memory needs: reference genome size + 8 GB',
          'Faster than original BWA-MEM',
        ],
      },
      troubleshootingTips: [
        'Verify reference genome index files exist',
        'Use -t flag to specify thread count',
        'Monitor memory usage during alignment',
        'Check FASTQ file format and quality',
      ],
    },
    'Samtools': {
      name: 'Samtools',
      description: 'Suite of programs for interacting with high-throughput sequencing data',
      commonErrorPatterns: [
        {
          pattern: /truncated file/i,
          cause: 'BAM/CRAM file is incomplete or corrupted',
          recommendation:
            'Verify file was completely written. Check S3 upload completed successfully. Re-run upstream alignment step.',
          confidence: 0.9,
        },
        {
          pattern: /fail to open file/i,
          cause: 'File path incorrect or permissions issue',
          recommendation:
            'Verify file path uses s3:// prefix for S3 locations. Check IAM permissions for S3 access.',
          confidence: 0.85,
        },
        {
          pattern: /invalid BAM binary header/i,
          cause: 'BAM file corrupted or not in BAM format',
          recommendation:
            'Verify file is valid BAM format. Check if file was truncated during transfer.',
          confidence: 0.9,
        },
      ],
      typicalResourceNeeds: {
        cpu: '1-8 vCPUs',
        memory: '2-16 GB',
        storage: '100-500 GB',
        notes: [
          'Most operations are I/O bound',
          'Sorting requires memory proportional to BAM size',
          'Use -@ flag for multi-threading',
        ],
      },
      troubleshootingTips: [
        'Verify BAM/CRAM file integrity with samtools quickcheck',
        'Check index files (.bai, .crai) are present',
        'Use samtools view to inspect file headers',
        'Monitor disk I/O performance',
      ],
    },
    'Picard': {
      name: 'Picard Tools',
      description: 'Java-based command-line utilities for manipulating sequencing data',
      commonErrorPatterns: [
        {
          pattern: /java\.lang\.OutOfMemoryError/i,
          cause: 'Java heap memory exhaustion',
          recommendation:
            'Increase memory allocation. Use -Xmx flag to set heap size (e.g., -Xmx8g for 8 GB).',
          confidence: 0.95,
        },
        {
          pattern: /SAM validation error/i,
          cause: 'Invalid SAM/BAM format or missing required fields',
          recommendation:
            'Run ValidateSamFile to identify specific issues. Check for proper read group (@RG) tags.',
          confidence: 0.85,
        },
      ],
      typicalResourceNeeds: {
        cpu: '1-4 vCPUs',
        memory: '8-32 GB',
        storage: '100-500 GB',
        notes: [
          'Java-based, requires heap memory configuration',
          'MarkDuplicates: 2-4 GB per million reads',
        ],
      },
      troubleshootingTips: [
        'Set Java heap size with -Xmx flag',
        'Use VALIDATION_STRINGENCY=LENIENT for permissive validation',
        'Check for proper read group tags',
      ],
    },
  };

  /**
   * Reference genome information
   */
  static readonly REFERENCE_GENOMES = {
    hg38: {
      name: 'GRCh38/hg38',
      size: '3.1 GB',
      description: 'Human reference genome build 38',
      notes: [
        'Most current human reference',
        'Includes alternate contigs',
        'Requires proper indexing (.fai, .dict files)',
      ],
    },
    hg19: {
      name: 'GRCh37/hg19',
      size: '3.0 GB',
      description: 'Human reference genome build 37',
      notes: [
        'Legacy reference, still widely used',
        'Ensure consistency with variant databases',
      ],
    },
  };

  /**
   * Get workflow type information
   */
  static getWorkflowTypeInfo(workflowType: string): WorkflowTypeInfo | undefined {
    return this.WORKFLOW_TYPES[workflowType];
  }

  /**
   * Get bioinformatics tool information
   */
  static getToolInfo(toolName: string): BioinformaticsToolInfo | undefined {
    return this.BIOINFORMATICS_TOOLS[toolName];
  }

  /**
   * Identify bioinformatics tool from error message
   */
  static identifyToolFromError(errorMessage: string): string | undefined {
    const lowerError = errorMessage.toLowerCase();

    if (lowerError.includes('gatk') || lowerError.includes('haplotypecaller')) {
      return 'GATK';
    }
    if (lowerError.includes('bwa') || lowerError.includes('bwa-mem')) {
      return 'BWA-MEM2';
    }
    if (lowerError.includes('samtools')) {
      return 'Samtools';
    }
    if (lowerError.includes('picard')) {
      return 'Picard';
    }

    return undefined;
  }

  /**
   * Match error message against known patterns
   */
  static matchErrorPattern(
    errorMessage: string,
    toolName: string,
  ): ErrorPattern | undefined {
    const toolInfo = this.getToolInfo(toolName);
    if (!toolInfo) return undefined;

    for (const pattern of toolInfo.commonErrorPatterns) {
      if (typeof pattern.pattern === 'string') {
        if (errorMessage.includes(pattern.pattern)) {
          return pattern;
        }
      } else if (pattern.pattern.test(errorMessage)) {
        return pattern;
      }
    }

    return undefined;
  }

  /**
   * Get resource recommendations for workflow type
   */
  static getResourceRecommendations(workflowType: string): ResourceRequirements | undefined {
    const info = this.getWorkflowTypeInfo(workflowType);
    return info?.typicalResourceRequirements;
  }

  /**
   * Identify workflow type from workflow name or parameters
   */
  static identifyWorkflowType(workflowName?: string, _parameters?: Record<string, any>): string | undefined {
    if (!workflowName) return undefined;

    const lowerName = workflowName.toLowerCase();

    if (lowerName.includes('wgs') || lowerName.includes('whole-genome') || lowerName.includes('whole_genome')) {
      return 'WGS';
    }
    if (lowerName.includes('wes') || lowerName.includes('exome') || lowerName.includes('whole-exome')) {
      return 'WES';
    }
    if (lowerName.includes('rna') || lowerName.includes('rnaseq') || lowerName.includes('rna-seq') || lowerName.includes('transcriptome')) {
      return 'RNA-Seq';
    }
    if (lowerName.includes('variant') || lowerName.includes('calling')) {
      return 'Variant Calling';
    }

    return undefined;
  }
}
