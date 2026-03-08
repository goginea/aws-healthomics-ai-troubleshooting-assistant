/**
 * GenomicsRecommendationEngine - Generates bioinformatics-specific recommendations
 * 
 * This engine:
 * - Generates workflow-type-specific recommendations (WGS vs WES vs RNA-Seq)
 * - Provides tool-specific troubleshooting guidance
 * - Includes reference genome considerations
 * - Adds bioinformatics best practices
 */

import { GenomicsKnowledgeBase, type ErrorPattern } from './GenomicsKnowledgeBase';
import type { EnhancedDiagnosis, EnhancedPerformanceAnalysis } from './GenomicsContextInterpreter';
import type { Recommendation, Action } from '../types/analysis';
import { RecommendationType, RootCauseType } from '../types/analysis';

export class GenomicsRecommendationEngine {
  /**
   * Generate recommendations from enhanced diagnosis
   */
  static generateRecommendationsFromDiagnosis(
    enhancedDiagnosis: EnhancedDiagnosis,
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Add recommendations from matched error patterns
    for (const rootCause of enhancedDiagnosis.enhancedRootCauses) {
      if (rootCause.genomicsContext?.commonPattern) {
        const { bioinformaticsTool } = rootCause.genomicsContext;

        if (bioinformaticsTool) {
          const toolInfo = GenomicsKnowledgeBase.getToolInfo(bioinformaticsTool);
          if (toolInfo) {
            // Find the matched pattern
            const matchedPattern = toolInfo.commonErrorPatterns.find(
              (p) => p.cause === rootCause.genomicsContext?.commonPattern,
            );

            if (matchedPattern) {
              recommendations.push({
                type: this.mapCauseToRecommendationType(matchedPattern.cause),
                description: matchedPattern.recommendation,
                actions: this.generateActionsFromPattern(matchedPattern, bioinformaticsTool),
                confidence: matchedPattern.confidence,
                priority: this.calculatePriority(rootCause.type),
                genomicsRationale: `Based on known ${bioinformaticsTool} error pattern: ${matchedPattern.cause}`,
              });
            }
          }
        }
      }
    }

    // Add workflow-type-specific recommendations
    if (enhancedDiagnosis.genomicsContext.workflowType) {
      const workflowInfo = GenomicsKnowledgeBase.getWorkflowTypeInfo(
        enhancedDiagnosis.genomicsContext.workflowType,
      );

      if (workflowInfo) {
        recommendations.push({
          type: RecommendationType.UPDATE_CONFIGURATION,
          description: `Verify resource allocation meets ${workflowInfo.name} requirements`,
          actions: [
            {
              description: `Typical ${workflowInfo.name} resources: ${workflowInfo.typicalResourceRequirements.cpu} CPU, ${workflowInfo.typicalResourceRequirements.memory} memory`,
            },
            ...workflowInfo.typicalResourceRequirements.notes.map((note) => ({
              description: note,
            })),
          ],
          confidence: 0.8,
          priority: 2,
          genomicsRationale: `Based on typical ${workflowInfo.name} resource requirements`,
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate recommendations from enhanced performance analysis
   */
  static generateRecommendationsFromPerformance(
    enhancedAnalysis: EnhancedPerformanceAnalysis,
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Add recommendations from original analysis
    for (const rec of enhancedAnalysis.original.recommendations) {
      const taskName = rec.taskName;
      const toolName = this.identifyToolFromTaskName(taskName);

      let genomicsRationale: string | undefined;
      if (toolName) {
        const toolInfo = GenomicsKnowledgeBase.getToolInfo(toolName);
        if (toolInfo) {
          genomicsRationale = `${toolName} typical needs: ${toolInfo.typicalResourceNeeds.memory} memory, ${toolInfo.typicalResourceNeeds.cpu} CPU`;
        }
      }

      recommendations.push({
        type: this.mapResourceTypeToRecommendationType(rec.resourceType),
        description: `${rec.taskName}: ${rec.reason}`,
        actions: [
          {
            description: `Change ${rec.resourceType} from ${rec.currentValue} to ${rec.recommendedValue}`,
            parameters: {
              taskName: rec.taskName,
              resourceType: rec.resourceType,
              currentValue: rec.currentValue,
              recommendedValue: rec.recommendedValue,
            },
          },
        ],
        confidence: 0.9,
        priority: 1,
        genomicsRationale,
      });
    }

    // Add workflow-type-specific optimizations
    if (enhancedAnalysis.workflowTypeRecommendations.length > 0) {
      recommendations.push({
        type: RecommendationType.UPDATE_CONFIGURATION,
        description: 'Workflow-type-specific optimization opportunities',
        actions: enhancedAnalysis.workflowTypeRecommendations.map((rec) => ({
          description: rec,
        })),
        confidence: 0.75,
        priority: 3,
        genomicsRationale: `Based on ${enhancedAnalysis.genomicsContext.workflowType} best practices`,
      });
    }

    return recommendations;
  }

  /**
   * Map error cause to recommendation type
   */
  private static mapCauseToRecommendationType(cause: string): RecommendationType {
    const lowerCause = cause.toLowerCase();

    if (lowerCause.includes('memory') || lowerCause.includes('heap')) {
      return RecommendationType.INCREASE_MEMORY;
    }
    if (lowerCause.includes('cpu')) {
      return RecommendationType.INCREASE_CPU;
    }
    if (lowerCause.includes('reference') || lowerCause.includes('genome')) {
      return RecommendationType.FIX_REFERENCE_GENOME_PATH;
    }
    if (lowerCause.includes('permission') || lowerCause.includes('access')) {
      return RecommendationType.ADD_IAM_PERMISSION;
    }
    if (lowerCause.includes('image') || lowerCause.includes('container')) {
      return RecommendationType.FIX_ECR_URI;
    }

    return RecommendationType.ADJUST_TOOL_PARAMETERS;
  }

  /**
   * Map resource type to recommendation type
   */
  private static mapResourceTypeToRecommendationType(
    resourceType: 'CPU' | 'MEMORY' | 'DISK',
  ): RecommendationType {
    switch (resourceType) {
      case 'CPU':
        return RecommendationType.INCREASE_CPU;
      case 'MEMORY':
        return RecommendationType.INCREASE_MEMORY;
      case 'DISK':
        return RecommendationType.UPDATE_CONFIGURATION;
      default:
        return RecommendationType.UPDATE_CONFIGURATION;
    }
  }

  /**
   * Generate actions from error pattern
   */
  private static generateActionsFromPattern(
    pattern: ErrorPattern,
    toolName: string,
  ): Action[] {
    const actions: Action[] = [
      {
        description: pattern.recommendation,
      },
    ];

    // Add tool-specific troubleshooting tips
    const toolInfo = GenomicsKnowledgeBase.getToolInfo(toolName);
    if (toolInfo) {
      toolInfo.troubleshootingTips.forEach((tip) => {
        actions.push({
          description: `Tip: ${tip}`,
        });
      });
    }

    return actions;
  }

  /**
   * Calculate priority based on root cause type
   */
  private static calculatePriority(rootCauseType: RootCauseType): number {
    switch (rootCauseType) {
      case RootCauseType.RESOURCE_EXHAUSTION:
        return 1; // Highest priority
      case RootCauseType.BIOINFORMATICS_TOOL_ERROR:
        return 1;
      case RootCauseType.IAM_PERMISSION_DENIED:
        return 1;
      case RootCauseType.REFERENCE_GENOME_ERROR:
        return 2;
      case RootCauseType.ECR_IMAGE_PULL_FAILURE:
        return 2;
      case RootCauseType.CONFIGURATION_ERROR:
        return 2;
      case RootCauseType.TIMEOUT:
        return 3;
      case RootCauseType.S3_ACCESS_ERROR:
        return 2;
      default:
        return 4;
    }
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
