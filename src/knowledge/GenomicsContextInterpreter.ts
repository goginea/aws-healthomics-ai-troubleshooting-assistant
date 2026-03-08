/**
 * GenomicsContextInterpreter - Enhances Power tool responses with genomics domain knowledge
 * 
 * This interpreter:
 * - Parses Power tool responses
 * - Adds genomics context (workflow type, bioinformatics tool, patterns)
 * - Recognizes bioinformatics tool error messages
 * - Maps generic errors to genomics-specific causes
 */

import { GenomicsKnowledgeBase, type ErrorPattern } from './GenomicsKnowledgeBase';
import type {
  DiagnoseRunFailureResponse,
  AnalyzeRunPerformanceResponse,
} from '../types/power-tools';
import type { GenomicsContext, RootCause } from '../types/analysis';
import { RootCauseType } from '../types/analysis';

export interface EnhancedDiagnosis {
  original: DiagnoseRunFailureResponse;
  genomicsContext: GenomicsContext;
  enhancedRootCauses: RootCause[];
  bioinformaticsInsights: string[];
}

export interface EnhancedPerformanceAnalysis {
  original: AnalyzeRunPerformanceResponse;
  genomicsContext: GenomicsContext;
  workflowTypeRecommendations: string[];
  toolSpecificOptimizations: string[];
}

export class GenomicsContextInterpreter {
  /**
   * Enhance failure diagnosis with genomics context
   */
  static enhanceDiagnosis(
    diagnosis: DiagnoseRunFailureResponse,
    workflowName?: string,
  ): EnhancedDiagnosis {
    // Identify workflow type
    const workflowType = GenomicsKnowledgeBase.identifyWorkflowType(workflowName);

    // Identify bioinformatics tool from error messages
    const allLogs = [
      diagnosis.failureReason || '',
      diagnosis.engineLogs || '',
      ...(diagnosis.failedTasks?.map((t) => t.logs || '') || []),
    ].join('\n');

    const bioinformaticsTool = GenomicsKnowledgeBase.identifyToolFromError(allLogs);

    // Match error patterns
    let matchedPattern: ErrorPattern | undefined;
    if (bioinformaticsTool) {
      matchedPattern = GenomicsKnowledgeBase.matchErrorPattern(allLogs, bioinformaticsTool);
    }

    // Build genomics context
    const genomicsContext: GenomicsContext = {
      workflowType: workflowType as any,
      bioinformaticsTool,
      commonPattern: matchedPattern?.cause,
      organizationPattern: undefined, // Will be filled by custom knowledge base
    };

    // Create enhanced root causes
    const enhancedRootCauses: RootCause[] = [];

    if (matchedPattern && bioinformaticsTool) {
      enhancedRootCauses.push({
        type: this.mapErrorToRootCauseType(matchedPattern.cause),
        description: `${bioinformaticsTool}: ${matchedPattern.cause}`,
        confidence: matchedPattern.confidence,
        affectedTasks: diagnosis.failedTasks?.map((t) => t.taskId) || [],
        evidence: [
          {
            source: 'HEALTHOMICS_DIAGNOSE_TOOL' as any,
            data: diagnosis,
            timestamp: new Date(),
            relevance: 1.0,
          },
        ],
        genomicsContext,
      });
    }

    // Generate bioinformatics insights
    const bioinformaticsInsights: string[] = [];

    if (bioinformaticsTool) {
      const toolInfo = GenomicsKnowledgeBase.getToolInfo(bioinformaticsTool);
      if (toolInfo) {
        bioinformaticsInsights.push(`Tool identified: ${toolInfo.name}`);
        bioinformaticsInsights.push(`Description: ${toolInfo.description}`);

        if (matchedPattern) {
          bioinformaticsInsights.push(`Known pattern: ${matchedPattern.cause}`);
          bioinformaticsInsights.push(`Recommendation: ${matchedPattern.recommendation}`);
        }
      }
    }

    if (workflowType) {
      const workflowInfo = GenomicsKnowledgeBase.getWorkflowTypeInfo(workflowType);
      if (workflowInfo) {
        bioinformaticsInsights.push(`Workflow type: ${workflowInfo.name}`);
        bioinformaticsInsights.push(
          `Typical tools: ${workflowInfo.typicalTools.join(', ')}`,
        );
      }
    }

    return {
      original: diagnosis,
      genomicsContext,
      enhancedRootCauses,
      bioinformaticsInsights,
    };
  }

  /**
   * Enhance performance analysis with genomics context
   */
  static enhancePerformanceAnalysis(
    analysis: AnalyzeRunPerformanceResponse,
    workflowName?: string,
  ): EnhancedPerformanceAnalysis {
    // Identify workflow type
    const workflowType = GenomicsKnowledgeBase.identifyWorkflowType(workflowName);

    // Build genomics context
    const genomicsContext: GenomicsContext = {
      workflowType: workflowType as any,
    };

    // Generate workflow-type-specific recommendations
    const workflowTypeRecommendations: string[] = [];
    if (workflowType) {
      const workflowInfo = GenomicsKnowledgeBase.getWorkflowTypeInfo(workflowType);
      if (workflowInfo) {
        workflowTypeRecommendations.push(
          `${workflowInfo.name} typical resources: ${workflowInfo.typicalResourceRequirements.cpu} CPU, ${workflowInfo.typicalResourceRequirements.memory} memory`,
        );
        workflowInfo.typicalResourceRequirements.notes.forEach((note) => {
          workflowTypeRecommendations.push(note);
        });
      }
    }

    // Generate tool-specific optimizations
    const toolSpecificOptimizations: string[] = [];
    for (const task of analysis.tasks) {
      const toolName = this.identifyToolFromTaskName(task.taskName);
      if (toolName) {
        const toolInfo = GenomicsKnowledgeBase.getToolInfo(toolName);
        if (toolInfo) {
          toolSpecificOptimizations.push(
            `${task.taskName} (${toolName}): ${toolInfo.typicalResourceNeeds.notes.join('; ')}`,
          );
        }
      }
    }

    return {
      original: analysis,
      genomicsContext,
      workflowTypeRecommendations,
      toolSpecificOptimizations,
    };
  }

  /**
   * Map error cause to root cause type
   */
  private static mapErrorToRootCauseType(cause: string): RootCauseType {
    const lowerCause = cause.toLowerCase();

    if (lowerCause.includes('memory') || lowerCause.includes('heap')) {
      return RootCauseType.RESOURCE_EXHAUSTION;
    }
    if (lowerCause.includes('permission') || lowerCause.includes('access denied')) {
      return RootCauseType.IAM_PERMISSION_DENIED;
    }
    if (lowerCause.includes('reference') || lowerCause.includes('genome')) {
      return RootCauseType.REFERENCE_GENOME_ERROR;
    }
    if (lowerCause.includes('image') || lowerCause.includes('container')) {
      return RootCauseType.ECR_IMAGE_PULL_FAILURE;
    }

    return RootCauseType.BIOINFORMATICS_TOOL_ERROR;
  }

  /**
   * Identify bioinformatics tool from task name
   */
  private static identifyToolFromTaskName(taskName: string): string | undefined {
    const lowerName = taskName.toLowerCase();

    if (lowerName.includes('gatk') || lowerName.includes('haplotype')) {
      return 'GATK';
    }
    if (lowerName.includes('bwa')) {
      return 'BWA-MEM2';
    }
    if (lowerName.includes('samtools')) {
      return 'Samtools';
    }
    if (lowerName.includes('picard')) {
      return 'Picard';
    }

    return undefined;
  }
}
