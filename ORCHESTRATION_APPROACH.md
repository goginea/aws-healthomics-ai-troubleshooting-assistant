# Orchestration-First Approach: Key Changes

This document explains the strategic shift from reimplementation to orchestration based on analyzing existing Kiro Powers.

## 🎯 Core Insight

**Before:** Build custom AWS API wrappers for HealthOmics, CloudWatch, CloudTrail, X-Ray

**After:** Orchestrate existing Power tools and add bioinformatics intelligence layer

## What Existing Powers Already Provide

### aws-healthomics Power

✅ **DiagnoseAHORunFailure** - Comprehensive failure diagnosis with:

- Engine logs, task logs, manifest logs
- Failed task identification
- Actionable recommendations
- Detailed diagnostic information

✅ **AnalyzeAHORunPerformance** - Resource optimization with:

- Task-level CPU, memory, disk utilization
- Run Analyzer recommendations
- Cost optimization suggestions
- Instance type recommendations

✅ **GenerateAHORunTimeline** - Gantt chart visualization

✅ **All log retrieval tools** - GetAHORunLogs, GetAHOTaskLogs, GetAHORunEngineLogs, GetAHORunManifestLogs

### aws-observability Power

✅ **audit_services** - Multi-service health auditing with:

- 7 auditor types (slo, operation_metric, trace, log, dependency_metric, top_contributor, service_quota)
- Root cause analysis with traces and logs
- Actionable recommendations
- Wildcard pattern support for service discovery

✅ **audit_slos** - SLO compliance monitoring with comprehensive root cause analysis

✅ **search_transaction_spans** - 100% trace visibility (vs X-Ray's 5% sampling)

✅ **analyze_canary_failures** - Canary failure root cause investigation

✅ **lookup_events** - CloudTrail security auditing

### aws-agentcore Power

✅ **Agent deployment and management**
✅ **Memory integration** for persistent knowledge
✅ **Documentation search and retrieval**

### iam-policy-autopilot-power

✅ **generate_application_policies** - Automatic IAM policy generation from code
✅ **generate_policy_for_access_denied** - Fix IAM errors automatically
✅ **fix_access_denied** - Deploy IAM policy fixes

### aws-infrastructure-as-code Power

✅ **CDK template validation**
✅ **Security compliance checking**
✅ **CloudFormation troubleshooting**

## Your Unique Value Proposition

### 🧬 Bioinformatics Intelligence Layer

**What you add to existing Power results:**

```typescript
// HealthOmics Power returns:
{
  failureReason: "Task failed with exit code 137",
  engineLogs: "java.lang.OutOfMemoryError: Java heap space",
  recommendations: ["Increase memory allocation"]
}

// Your bioinformatics layer enhances it:
{
  failureReason: "Memory Exhaustion in GATK HaplotypeCaller",
  genomicsContext: {
    tool: "GATK HaplotypeCaller",
    workflowType: "WGS",
    commonPattern: "GATK requires 2x reference genome size + 4GB overhead",
    referenceGenome: "hg38 (3.1 GB)",
    calculatedRequirement: "10.2 GB minimum"
  },
  recommendations: [
    "Increase memory to 16 GB (10.2 GB required + 20% buffer + 4 GB GATK overhead)",
    "Consider using GATK's --java-options '-Xmx12g' for heap size control",
    "For WGS workflows, typical GATK memory: 16-32 GB depending on coverage"
  ]
}
```

### 🤖 Smart Orchestration

**Single natural language query → Multiple Power tools coordinated:**

```
User: "Why did my workflow fail?"

Your Agent Orchestrates:
1. Call HealthOmics Power: DiagnoseAHORunFailure(run_id)
2. Parse response, identify it's a GATK OOM error
3. Call HealthOmics Power: AnalyzeAHORunPerformance(run_id)
4. Apply genomics knowledge: "GATK HaplotypeCaller needs 2x genome size"
5. Check custom knowledge base: "Our team's WGS runbook says use 16 GB"
6. If IAM error detected: Call IAM Policy Autopilot: generate_policy_for_access_denied
7. Synthesize all results with bioinformatics context
8. Return: Specific fix with genomics reasoning
```

### 📚 Custom Knowledge Integration

**Organization-specific patterns:**

- Ingest team runbooks from SharePoint/Confluence
- Learn from historical troubleshooting sessions
- Prioritize org-specific knowledge over generic advice
- Use AgentCore Memory for persistent storage

### 🚀 Turnkey Deployment

**Simplified setup:**

- Setup wizard guides through configuration
- One-click CDK deployment
- Automated IAM policy generation via IAM Policy Autopilot
- Connectivity testing and validation

## Revised Implementation Strategy

### Phase 1: Core Orchestration (HIGHEST PRIORITY)

**Focus:** Build the Power orchestration client and bioinformatics intelligence layer

**Key Tasks:**

1. Create PowerClient interface for calling existing Power tools
2. Implement wrappers for HealthOmics Power tools (DiagnoseAHORunFailure, AnalyzeAHORunPerformance)
3. Implement wrappers for Observability Power tools (audit_services, audit_slos, search_transaction_spans)
4. Create genomics knowledge base (WGS, WES, RNA-Seq patterns)
5. Implement genomics context interpreter
6. Deploy AgentCore agent with Power orchestration capabilities

**Why First:** This is your unique value - everything else builds on this foundation.

### Phase 2: Custom Knowledge Base

**Focus:** Enable organization-specific knowledge ingestion

**Key Tasks:**

1. Implement knowledge source connectors (SharePoint, Confluence, file systems, S3)
2. Integrate with AgentCore Memory
3. Implement knowledge prioritization
4. Create knowledge base management UI

**Why Second:** Differentiates your Power from generic troubleshooting.

### Phase 3: Infrastructure and Setup

**Focus:** Make deployment turnkey

**Key Tasks:**

1. Implement CDK stack using AWS CDK Power
2. Integrate IAM Policy Autopilot for automatic policy generation
3. Create Setup Wizard
4. Implement connectivity testing

**Why Third:** Enables easy adoption by bioinformatics community.

### Phases 4-8: Polish and Production-Readiness

**Focus:** Natural language interface, error handling, performance, documentation

## Code Structure Changes

### Old Approach (Reimplementation):

```typescript
// ❌ Don't build this
class HealthOmicsPower {
  async getRun(runId: string) {
    const client = new OmicsClient({});
    const response = await client.send(new GetRunCommand({ id: runId }));
    return response;
  }
}
```

### New Approach (Orchestration):

```typescript
// ✅ Build this instead
class PowerOrchestrator {
  async callPowerTool(powerName: string, toolName: string, params: any) {
    // Call existing Power's MCP tool
    return await kiroPowers.use(powerName, serverName, toolName, params);
  }
}

class BioinformaticsAgent {
  async diagnoseFailure(query: string) {
    // 1. Parse query
    const { runId } = this.parseQuery(query);

    // 2. Call HealthOmics Power's existing tool
    const diagnosis = await this.orchestrator.callPowerTool(
      'aws-healthomics',
      'DiagnoseAHORunFailure',
      { run_id: runId, detailed: false },
    );

    // 3. Enhance with genomics intelligence (YOUR UNIQUE VALUE)
    const enhanced = this.addGenomicsContext(diagnosis);

    // 4. Apply custom knowledge
    const withOrgKnowledge = await this.applyCustomKnowledge(enhanced);

    // 5. Generate bioinformatics-specific recommendations
    return this.generateRecommendations(withOrgKnowledge);
  }

  private addGenomicsContext(diagnosis: any) {
    // Recognize GATK, BWA-MEM2, Samtools error patterns
    // Add workflow-type-specific context (WGS vs WES vs RNA-Seq)
    // Provide bioinformatics-specific explanations
    return enhancedDiagnosis;
  }
}
```

## Benefits of Orchestration Approach

### ✅ Advantages:

1. **Faster Development** - Don't reimplement what exists
2. **Better Maintenance** - AWS Powers handle API changes
3. **Focus on Value** - Spend time on bioinformatics intelligence, not AWS API wrappers
4. **Leverage Community** - Benefit from Power improvements automatically
5. **Cleaner Architecture** - Clear separation between orchestration and domain intelligence

### 📊 Effort Comparison:

| Approach             | Estimated Effort | Your Unique Value                      |
| -------------------- | ---------------- | -------------------------------------- |
| **Reimplementation** | 8-12 weeks       | 30% (buried in AWS API code)           |
| **Orchestration**    | 4-6 weeks        | 80% (focused on genomics intelligence) |

## Testing Strategy Changes

### Old Approach:

- Test AWS API wrappers
- Test CloudWatch query parsing
- Test S3 log retrieval
- Test CloudTrail event parsing

### New Approach:

- Test Power tool orchestration logic
- Test genomics context enhancement
- Test recommendation quality with genomics knowledge
- Test custom knowledge prioritization
- Mock Power tool responses for unit tests

## Next Steps

1. **Review tasks-revised.md** - New implementation plan
2. **Review power/POWER.md** - Updated Power manifest
3. **Start with Phase 1, Task 1** - Set up Power orchestration client
4. **Focus on bioinformatics intelligence** - Your differentiator

## Questions to Consider

1. **Do you want to replace the original tasks.md with tasks-revised.md?**
   - Recommended: Yes, the orchestration approach is more efficient

2. **Should we update the design.md to reflect orchestration architecture?**
   - Recommended: Yes, for consistency

3. **Ready to start implementing Phase 1, Task 1?**
   - This sets up the Power orchestration foundation

What would you like to do next?
