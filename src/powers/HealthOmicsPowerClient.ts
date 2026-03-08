/**
 * HealthOmicsPowerClient - Wrapper for aws-healthomics Power tools
 * 
 * This client provides typed wrappers for calling tools from the aws-healthomics Power,
 * which already implements comprehensive HealthOmics API integration including:
 * - DiagnoseAHORunFailure - Comprehensive failure diagnosis
 * - AnalyzeAHORunPerformance - Resource optimization recommendations
 * - GetAHORun, ListAHORunTasks, GetAHORunTask - Workflow and task data
 * - Log retrieval tools - All log types (run, task, engine, manifest)
 */

import { PowerClient, PowerToolCall } from '../orchestration/PowerClient';
import type {
  DiagnoseRunFailureResponse,
  AnalyzeRunPerformanceResponse,
  GetRunResponse,
  ListRunTasksResponse,
  RunTaskSummary,
} from '../types/power-tools';

export class HealthOmicsPowerClient {
  private powerClient: PowerClient;
  private readonly powerName = 'aws-healthomics';
  private readonly serverName = 'aws-healthomics';

  constructor(powerClient?: PowerClient) {
    this.powerClient = powerClient || new PowerClient();
  }

  /**
   * Diagnose a failed workflow run using HealthOmics Power's comprehensive diagnosis tool
   * 
   * This tool provides:
   * - Engine logs, task logs, manifest logs
   * - Failed task identification
   * - Actionable recommendations
   * 
   * @param runId - HealthOmics workflow run ID
   * @param detailed - Include full logs (default: false for faster response)
   */
  async diagnoseRunFailure(
    runId: string,
    detailed: boolean = false,
  ): Promise<DiagnoseRunFailureResponse> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.serverName,
      toolName: 'DiagnoseAHORunFailure',
      arguments: {
        run_id: runId,
        detailed,
      },
    };

    const response = await this.powerClient.callTool<DiagnoseRunFailureResponse>(call);

    if (!response.success || !response.data) {
      throw new Error(
        `Failed to diagnose run failure: ${response.error?.message || 'Unknown error'}`,
      );
    }

    return response.data;
  }

  /**
   * Analyze workflow run performance using HealthOmics Power's performance analysis tool
   * 
   * This tool provides:
   * - Task-level CPU, memory, disk utilization
   * - Run Analyzer recommendations
   * - Cost optimization suggestions
   * - Instance type recommendations
   * 
   * @param runIds - Array of HealthOmics workflow run IDs
   * @param headroom - Headroom percentage for recommendations (default: 0.20 = 20%)
   * @param detailed - Include detailed task metrics (default: false)
   */
  async analyzeRunPerformance(
    runIds: string[],
    headroom: number = 0.2,
    detailed: boolean = false,
  ): Promise<AnalyzeRunPerformanceResponse> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.serverName,
      toolName: 'AnalyzeAHORunPerformance',
      arguments: {
        run_ids: runIds,
        headroom,
        detailed,
      },
    };

    const response = await this.powerClient.callTool<AnalyzeRunPerformanceResponse>(call);

    if (!response.success || !response.data) {
      throw new Error(
        `Failed to analyze run performance: ${response.error?.message || 'Unknown error'}`,
      );
    }

    return response.data;
  }

  /**
   * Get workflow run details
   * 
   * @param runId - HealthOmics workflow run ID
   * @param exportDefinition - Include presigned URL for workflow definition download
   */
  async getRun(runId: string, exportDefinition: boolean = false): Promise<GetRunResponse> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.serverName,
      toolName: 'GetAHORun',
      arguments: {
        run_id: runId,
        export_definition: exportDefinition,
      },
    };

    const response = await this.powerClient.callTool<GetRunResponse>(call);

    if (!response.success || !response.data) {
      throw new Error(`Failed to get run: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * List tasks for a workflow run
   * 
   * @param runId - HealthOmics workflow run ID
   * @param maxResults - Maximum number of results (default: 100)
   * @param status - Filter by task status
   */
  async listRunTasks(
    runId: string,
    maxResults: number = 100,
    status?: string,
  ): Promise<ListRunTasksResponse> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.serverName,
      toolName: 'ListAHORunTasks',
      arguments: {
        run_id: runId,
        max_results: maxResults,
        ...(status && { status }),
      },
    };

    const response = await this.powerClient.callTool<ListRunTasksResponse>(call);

    if (!response.success || !response.data) {
      throw new Error(`Failed to list run tasks: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Get details for a specific task
   * 
   * @param runId - HealthOmics workflow run ID
   * @param taskId - Task ID
   */
  async getRunTask(runId: string, taskId: string): Promise<RunTaskSummary> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.serverName,
      toolName: 'GetAHORunTask',
      arguments: {
        run_id: runId,
        task_id: taskId,
      },
    };

    const response = await this.powerClient.callTool<RunTaskSummary>(call);

    if (!response.success || !response.data) {
      throw new Error(`Failed to get run task: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Get run logs (high-level workflow execution events)
   * 
   * @param runId - HealthOmics workflow run ID
   * @param limit - Maximum number of log events (default: 100)
   * @param startFromHead - Start from beginning (true) or end (false)
   */
  async getRunLogs(
    runId: string,
    limit: number = 100,
    startFromHead: boolean = false,
  ): Promise<string> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.serverName,
      toolName: 'GetAHORunLogs',
      arguments: {
        run_id: runId,
        limit,
        start_from_head: startFromHead,
      },
    };

    const response = await this.powerClient.callTool<string>(call);

    if (!response.success || !response.data) {
      throw new Error(`Failed to get run logs: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Get task logs (STDOUT and STDERR from specific task)
   * 
   * @param runId - HealthOmics workflow run ID
   * @param taskId - Task ID
   * @param limit - Maximum number of log events (default: 100)
   */
  async getTaskLogs(runId: string, taskId: string, limit: number = 100): Promise<string> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.serverName,
      toolName: 'GetAHOTaskLogs',
      arguments: {
        run_id: runId,
        task_id: taskId,
        limit,
      },
    };

    const response = await this.powerClient.callTool<string>(call);

    if (!response.success || !response.data) {
      throw new Error(`Failed to get task logs: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Get engine logs (STDOUT and STDERR from workflow engine)
   * 
   * @param runId - HealthOmics workflow run ID
   * @param limit - Maximum number of log events (default: 100)
   */
  async getEngineLogs(runId: string, limit: number = 100): Promise<string> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.serverName,
      toolName: 'GetAHORunEngineLogs',
      arguments: {
        run_id: runId,
        limit,
      },
    };

    const response = await this.powerClient.callTool<string>(call);

    if (!response.success || !response.data) {
      throw new Error(`Failed to get engine logs: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Get run manifest logs (workflow summary with resource metrics)
   * 
   * @param runId - HealthOmics workflow run ID
   * @param runUuid - Optional run UUID
   * @param limit - Maximum number of log events (default: 100)
   */
  async getRunManifestLogs(
    runId: string,
    runUuid?: string,
    limit: number = 100,
  ): Promise<string> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.serverName,
      toolName: 'GetAHORunManifestLogs',
      arguments: {
        run_id: runId,
        ...(runUuid && { run_uuid: runUuid }),
        limit,
      },
    };

    const response = await this.powerClient.callTool<string>(call);

    if (!response.success || !response.data) {
      throw new Error(
        `Failed to get run manifest logs: ${response.error?.message || 'Unknown error'}`,
      );
    }

    return response.data;
  }

  /**
   * Generate Gantt chart timeline for workflow run
   * 
   * @param runId - HealthOmics workflow run ID
   * @param timeUnit - Time unit for timeline axis (default: 'hr')
   * @param outputFormat - Output format (default: 'base64')
   */
  async generateRunTimeline(
    runId: string,
    timeUnit: 'sec' | 'min' | 'hr' | 'day' = 'hr',
    outputFormat: 'svg' | 'base64' = 'base64',
  ): Promise<string> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.serverName,
      toolName: 'GenerateAHORunTimeline',
      arguments: {
        run_id: runId,
        time_unit: timeUnit,
        output_format: outputFormat,
      },
    };

    const response = await this.powerClient.callTool<string>(call);

    if (!response.success || !response.data) {
      throw new Error(
        `Failed to generate run timeline: ${response.error?.message || 'Unknown error'}`,
      );
    }

    return response.data;
  }
}
