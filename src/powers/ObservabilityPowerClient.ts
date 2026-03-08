/**
 * ObservabilityPowerClient - Wrapper for aws-observability Power tools
 * 
 * This client provides typed wrappers for calling tools from the aws-observability Power,
 * which includes:
 * - audit_services - Multi-service health auditing with 7 auditor types
 * - audit_slos - SLO compliance monitoring with root cause analysis
 * - search_transaction_spans - 100% trace visibility via CloudWatch Logs
 * - lookup_events - CloudTrail security auditing
 */

import { PowerClient, PowerToolCall } from '../orchestration/PowerClient';
import type {
  AuditServicesResponse,
  SearchTransactionSpansResponse,
  LookupEventsResponse,
} from '../types/power-tools';

export interface ServiceTarget {
  Type: 'service';
  Data?: {
    Service: {
      Type: 'Service';
      Name: string;
      Environment?: string;
    };
  };
  Service?: string; // Shorthand format
}

export interface SLOTarget {
  Type: 'slo';
  Data: {
    Slo: {
      SloName?: string;
      SloArn?: string;
    };
  };
}

export class ObservabilityPowerClient {
  private powerClient: PowerClient;
  private readonly powerName = 'aws-observability';
  private readonly applicationsignalsServerName =
    'awslabs.cloudwatch-applicationsignals-mcp-server';
  private readonly cloudtrailServerName = 'awslabs.cloudtrail-mcp-server';

  constructor(powerClient?: PowerClient) {
    this.powerClient = powerClient || new PowerClient();
  }

  /**
   * Audit service health using Observability Power's comprehensive audit tool
   * 
   * This tool provides:
   * - Multi-service health auditing with 7 auditor types
   * - Root cause analysis with traces and logs
   * - Actionable recommendations
   * - Wildcard pattern support for service discovery
   * 
   * @param serviceTargets - JSON array of service targets (supports wildcards like '*payment*')
   * @param startTime - Start time (unix seconds or 'YYYY-MM-DD HH:MM:SS')
   * @param endTime - End time (unix seconds or 'YYYY-MM-DD HH:MM:SS')
   * @param auditors - Comma-separated auditors (default: 'slo,operation_metric', use 'all' for comprehensive)
   */
  async auditServices(
    serviceTargets: string,
    startTime?: string,
    endTime?: string,
    auditors: string = 'slo,operation_metric',
  ): Promise<AuditServicesResponse> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.applicationsignalsServerName,
      toolName: 'audit_services',
      arguments: {
        service_targets: serviceTargets,
        ...(startTime && { start_time: startTime }),
        ...(endTime && { end_time: endTime }),
        auditors,
      },
    };

    const response = await this.powerClient.callTool<AuditServicesResponse>(call);

    if (!response.success || !response.data) {
      throw new Error(`Failed to audit services: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Audit SLO compliance using Observability Power's SLO audit tool
   * 
   * This tool provides:
   * - SLO breach detection
   * - Root cause analysis with traces and logs
   * - Actionable recommendations
   * 
   * @param sloTargets - JSON array of SLO targets (supports wildcards)
   * @param startTime - Start time (unix seconds or 'YYYY-MM-DD HH:MM:SS')
   * @param endTime - End time (unix seconds or 'YYYY-MM-DD HH:MM:SS')
   * @param auditors - Comma-separated auditors (default: 'slo', use 'all' for comprehensive)
   */
  async auditSLOs(
    sloTargets: string,
    startTime?: string,
    endTime?: string,
    auditors: string = 'slo',
  ): Promise<AuditServicesResponse> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.applicationsignalsServerName,
      toolName: 'audit_slos',
      arguments: {
        slo_targets: sloTargets,
        ...(startTime && { start_time: startTime }),
        ...(endTime && { end_time: endTime }),
        auditors,
      },
    };

    const response = await this.powerClient.callTool<AuditServicesResponse>(call);

    if (!response.success || !response.data) {
      throw new Error(`Failed to audit SLOs: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Search transaction spans for 100% trace visibility
   * 
   * This queries OpenTelemetry spans through CloudWatch Logs Insights,
   * providing 100% sampled data vs X-Ray's 5% sampling.
   * 
   * @param logGroupName - CloudWatch log group (default: 'aws/spans')
   * @param queryString - CloudWatch Logs Insights query
   * @param startTime - Start time (ISO 8601 format)
   * @param endTime - End time (ISO 8601 format)
   * @param limit - Maximum number of results
   */
  async searchTransactionSpans(
    queryString: string,
    startTime?: string,
    endTime?: string,
    logGroupName: string = 'aws/spans',
    limit?: number,
  ): Promise<SearchTransactionSpansResponse> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.applicationsignalsServerName,
      toolName: 'search_transaction_spans',
      arguments: {
        log_group_name: logGroupName,
        query_string: queryString,
        ...(startTime && { start_time: startTime }),
        ...(endTime && { end_time: endTime }),
        ...(limit && { limit }),
      },
    };

    const response = await this.powerClient.callTool<SearchTransactionSpansResponse>(call);

    if (!response.success || !response.data) {
      throw new Error(
        `Failed to search transaction spans: ${response.error?.message || 'Unknown error'}`,
      );
    }

    return response.data;
  }

  /**
   * Look up CloudTrail events for security auditing
   * 
   * @param startTime - Start time (ISO format or relative like '1 day ago')
   * @param endTime - End time (ISO format or relative like '1 hour ago')
   * @param attributeKey - Attribute to search by (e.g., 'Username', 'EventName')
   * @param attributeValue - Value to search for
   * @param maxResults - Maximum number of events (1-50, default: 10)
   * @param region - AWS region (default: 'us-east-1')
   */
  async lookupEvents(
    startTime?: string,
    endTime?: string,
    attributeKey?: string,
    attributeValue?: string,
    maxResults: number = 10,
    region: string = 'us-east-1',
  ): Promise<LookupEventsResponse> {
    const call: PowerToolCall = {
      powerName: this.powerName,
      serverName: this.cloudtrailServerName,
      toolName: 'lookup_events',
      arguments: {
        ...(startTime && { start_time: startTime }),
        ...(endTime && { end_time: endTime }),
        ...(attributeKey && { attribute_key: attributeKey }),
        ...(attributeValue && { attribute_value: attributeValue }),
        max_results: maxResults,
        region,
      },
    };

    const response = await this.powerClient.callTool<LookupEventsResponse>(call);

    if (!response.success || !response.data) {
      throw new Error(`Failed to lookup events: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Helper: Create service target JSON for audit_services
   * 
   * @param serviceName - Service name (supports wildcards like '*payment*')
   * @param environment - Optional environment (e.g., 'eks:my-cluster', 'lambda')
   */
  createServiceTarget(serviceName: string, environment?: string): string {
    const target: ServiceTarget = {
      Type: 'service',
      Data: {
        Service: {
          Type: 'Service',
          Name: serviceName,
          ...(environment && { Environment: environment }),
        },
      },
    };
    return JSON.stringify([target]);
  }

  /**
   * Helper: Create SLO target JSON for audit_slos
   * 
   * @param sloName - SLO name (supports wildcards)
   */
  createSLOTarget(sloName: string): string {
    const target: SLOTarget = {
      Type: 'slo',
      Data: {
        Slo: {
          SloName: sloName,
        },
      },
    };
    return JSON.stringify([target]);
  }
}
