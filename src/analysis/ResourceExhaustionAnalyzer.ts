/**
 * Resource Exhaustion Analyzer
 *
 * Enhances HealthOmics Power's AnalyzeAHORunPerformance results with genomics context
 */

export interface IResourceExhaustionAnalyzer {
  analyzeResourceUsage(
    performanceData: any,
    workflowType: string
  ): ResourceAnalysisResult;
  getWorkflowTypeRecommendations(workflowType: string): WorkflowResourceProfile;
}

export interface ResourceAnalysisResult {
  exhaustedResources: ExhaustedResource[];
  underutilizedResources: UnderutilizedResource[];
  genomicsContext: string;
  recommendations: string[];
}

export interface ExhaustedResource {
  taskName: string;
  resourceType: 'CPU' | 'MEMORY' | 'DISK';
  allocated: number;
  peak: number;
  utilizationPercent: number;
  genomicsReason?: string;
}

export interface UnderutilizedResource {
  taskName: string;
  resourceType: 'CPU' | 'MEMORY' | 'DISK';
  allocated: number;
  peak: number;
  utilizationPercent: number;
  potentialSavings: string;
}

export interface WorkflowResourceProfile {
  workflowType: string;
  typicalCpuRange: string;
  typicalMemoryRange: string;
  typicalDiskRange: string;
  commonBottlenecks: string[];
}

/**
 * Resource exhaustion analyzer implementation
 */
export class ResourceExhaustionAnalyzer implements IResourceExhaustionAnalyzer {
  private readonly EXHAUSTION_THRESHOLD = 0.9; // 90% utilization
  private readonly UNDERUTILIZATION_THRESHOLD = 0.3; // 30% utilization

  /**
   * Analyze resource usage with genomics context
   */
  analyzeResourceUsage(
    performanceData: any,
    workflowType: string
  ): ResourceAnalysisResult {
    const exhausted: ExhaustedResource[] = [];
    const underutilized: UnderutilizedResource[] = [];
    const recommendations: string[] = [];

    // Get workflow-specific profile
    const profile = this.getWorkflowTypeRecommendations(workflowType);

    // Analyze each task (placeholder - would parse actual performance data)
    const tasks = performanceData.tasks || [];
    for (const task of tasks) {
      // Check memory exhaustion
      if (task.memory) {
        const memUtil = task.memory.peak / task.memory.allocated;
        if (memUtil >= this.EXHAUSTION_THRESHOLD) {
          exhausted.push({
            taskName: task.name,
            resourceType: 'MEMORY',
            allocated: task.memory.allocated,
            peak: task.memory.peak,
            utilizationPercent: memUtil * 100,
            genomicsReason: this.getGenomicsMemoryReason(task.name, workflowType),
          });
        } else if (memUtil <= this.UNDERUTILIZATION_THRESHOLD) {
          underutilized.push({
            taskName: task.name,
            resourceType: 'MEMORY',
            allocated: task.memory.allocated,
            peak: task.memory.peak,
            utilizationPercent: memUtil * 100,
            potentialSavings: this.calculateSavings(task.memory.allocated, task.memory.peak),
          });
        }
      }

      // Check CPU exhaustion
      if (task.cpu) {
        const cpuUtil = task.cpu.peak / task.cpu.allocated;
        if (cpuUtil >= this.EXHAUSTION_THRESHOLD) {
          exhausted.push({
            taskName: task.name,
            resourceType: 'CPU',
            allocated: task.cpu.allocated,
            peak: task.cpu.peak,
            utilizationPercent: cpuUtil * 100,
          });
        } else if (cpuUtil <= this.UNDERUTILIZATION_THRESHOLD) {
          underutilized.push({
            taskName: task.name,
            resourceType: 'CPU',
            allocated: task.cpu.allocated,
            peak: task.cpu.peak,
            utilizationPercent: cpuUtil * 100,
            potentialSavings: this.calculateSavings(task.cpu.allocated, task.cpu.peak),
          });
        }
      }
    }

    // Generate genomics-specific recommendations
    if (exhausted.length > 0) {
      recommendations.push(
        `For ${workflowType} workflows, consider: ${profile.commonBottlenecks.join(', ')}`
      );
    }

    return {
      exhaustedResources: exhausted,
      underutilizedResources: underutilized,
      genomicsContext: `${workflowType} workflows typically require: ${profile.typicalMemoryRange} memory, ${profile.typicalCpuRange} CPUs`,
      recommendations,
    };
  }

  /**
   * Get workflow-type-specific resource recommendations
   */
  getWorkflowTypeRecommendations(workflowType: string): WorkflowResourceProfile {
    const profiles: Record<string, WorkflowResourceProfile> = {
      WGS: {
        workflowType: 'WGS',
        typicalCpuRange: '8-16 vCPUs',
        typicalMemoryRange: '32-64 GB',
        typicalDiskRange: '500-1000 GB',
        commonBottlenecks: [
          'BWA-MEM2 alignment (memory-intensive)',
          'GATK HaplotypeCaller (memory + CPU)',
          'Variant annotation (disk I/O)',
        ],
      },
      WES: {
        workflowType: 'WES',
        typicalCpuRange: '4-8 vCPUs',
        typicalMemoryRange: '16-32 GB',
        typicalDiskRange: '200-500 GB',
        commonBottlenecks: [
          'BWA-MEM2 alignment (memory-intensive)',
          'GATK HaplotypeCaller (memory + CPU)',
        ],
      },
      'RNA-Seq': {
        workflowType: 'RNA-Seq',
        typicalCpuRange: '8-16 vCPUs',
        typicalMemoryRange: '16-32 GB',
        typicalDiskRange: '200-500 GB',
        commonBottlenecks: [
          'STAR alignment (memory-intensive)',
          'Transcript quantification (CPU-intensive)',
        ],
      },
    };

    return (
      profiles[workflowType] || {
        workflowType: 'UNKNOWN',
        typicalCpuRange: '4-8 vCPUs',
        typicalMemoryRange: '16-32 GB',
        typicalDiskRange: '200-500 GB',
        commonBottlenecks: [],
      }
    );
  }

  /**
   * Get genomics-specific reason for memory exhaustion
   */
  private getGenomicsMemoryReason(taskName: string, workflowType: string): string {
    const taskLower = taskName.toLowerCase();

    if (taskLower.includes('bwa') || taskLower.includes('alignment')) {
      return 'BWA-MEM2 requires ~10-15 GB for human genome alignment';
    } else if (taskLower.includes('gatk') || taskLower.includes('haplotype')) {
      return 'GATK HaplotypeCaller requires 16-32 GB depending on coverage';
    } else if (taskLower.includes('star')) {
      return 'STAR aligner requires ~30 GB for human genome index';
    } else if (taskLower.includes('variant')) {
      return 'Variant calling tools typically need 16-32 GB';
    }

    return `${workflowType} workflows typically require higher memory`;
  }

  /**
   * Calculate potential cost savings
   */
  private calculateSavings(allocated: number, peak: number): string {
    const excess = allocated - peak;
    const savingsPercent = (excess / allocated) * 100;
    return `~${savingsPercent.toFixed(0)}% cost reduction possible`;
  }
}
