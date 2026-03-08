// Workflow-related type definitions

export enum RunStatus {
  PENDING = 'PENDING',
  STARTING = 'STARTING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum WorkflowType {
  NEXTFLOW = 'NEXTFLOW',
  WDL = 'WDL',
  CWL = 'CWL',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface WorkflowRun {
  id: string;
  name?: string;
  status: RunStatus;
  workflowType: WorkflowType;
  startTime?: Date;
  endTime?: Date;
  failureReason?: string;
  parameters?: Record<string, any>;
  outputUri?: string;
}

export interface Task {
  taskId: string;
  name: string;
  status: TaskStatus;
  startTime?: Date;
  endTime?: Date;
  cpus?: number;
  memory?: number;
  gpus?: number;
  exitCode?: number;
}

export interface S3Location {
  bucket: string;
  key: string;
  region?: string;
}

export interface LogStream {
  logGroupName: string;
  logStreamName: string;
  events: LogEvent[];
  nextToken?: string;
}

export interface LogEvent {
  timestamp: Date;
  message: string;
  ingestionTime?: Date;
}

