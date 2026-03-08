// Workflow-related type definitions
// To be implemented in Task 1

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

// Additional types to be added in Task 1
