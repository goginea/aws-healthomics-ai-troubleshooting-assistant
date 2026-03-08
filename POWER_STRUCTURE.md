# Kiro Power Structure - Best Practices Applied

This document explains how the project structure follows Kiro Power best practices.

## Key Decisions

### 1. Power Type: Guided MCP Power (Meta-Power)

This is a **Guided MCP Power** that orchestrates existing AWS Powers rather than implementing custom MCP servers.

**Why this approach:**

- Reuses existing, well-tested AWS Power MCP servers
- Focuses on orchestration and specialized bioinformatics intelligence
- Reduces maintenance burden (AWS Powers handle API changes)
- Follows Kiro's modular Power dependency architecture

### 2. Single Power (Not Split)

Following Kiro best practices, this is a **single comprehensive Power** rather than multiple split Powers.

**Why not split:**

- All workflows are related to HealthOmics troubleshooting
- Users will often use multiple workflows together (check status → diagnose failure → analyze resources)
- No independent environments or contexts that justify splitting
- Follows the "default to single power" guideline

### 3. Directory Structure

```
project-root/
├── power/                  # Kiro Power distribution
│   ├── POWER.md           # Power manifest and documentation
│   ├── mcp.json           # MCP configuration (empty - uses dependency Powers)
│   └── README.md          # Installation instructions
├── src/                    # Implementation code
│   ├── agent/             # AgentCore agent
│   ├── powers/            # Power orchestration logic
│   ├── infrastructure/    # CDK stacks
│   ├── setup/             # Setup wizard
│   ├── knowledge/         # Knowledge base management
│   └── types/             # TypeScript types
├── tests/                  # Unit and property-based tests
├── docs/                   # User documentation
├── examples/               # Example workflows
├── cdk/                    # CDK app entry point
├── package.json           # Node.js project
├── tsconfig.json          # TypeScript config
└── README.md              # Project README
```

**Key points:**

- `power/` directory contains the Kiro Power distribution
- `src/` contains the implementation code
- Clear separation between Power (documentation) and implementation (code)

### 4. POWER.md Structure

Follows the official Kiro Power format:

```markdown
---
name: 'healthomics-ai-troubleshooter'
displayName: 'HealthOmics AI Troubleshooter'
description: 'AI-assisted troubleshooting for AWS HealthOmics genomic workflows...'
keywords: ['healthomics', 'genomics', 'bioinformatics', ...]
author: 'Avinash Gogineni'
---

# HealthOmics AI Troubleshooter

## Overview

[What the power does, why it's useful, key capabilities]

## Available MCP Servers

[Lists dependency Powers and their MCP servers]

## Onboarding

### Prerequisites

### Installation

### Configuration

## Common Workflows

### Workflow 1: Check Workflow Run Status

### Workflow 2: Diagnose Workflow Failure

### Workflow 3: Analyze Resource Utilization

### Workflow 4: Investigate IAM Permission Errors

### Workflow 5: Proactive Failure Alerts

### Workflow 6: Custom Knowledge Base

## Troubleshooting

[Common errors and solutions]

## Best Practices

[Key practices for using this power]
```

**Only 5 valid frontmatter fields used:**

- name (required)
- displayName (required)
- description (required)
- keywords (optional)
- author (optional)

**No invalid fields like:** version, tags, repository, license

### 5. MCP Configuration Strategy

The `mcp.json` file is **empty** (`{"mcpServers": {}}`).

**Why:**

- This Power doesn't implement custom MCP servers
- It uses MCP servers from dependency Powers (aws-healthomics, aws-observability, etc.)
- The AgentCore agent orchestrates calls to those existing MCP servers
- This follows the "meta-power" pattern for orchestration layers

### 6. No Steering Files (Yet)

Currently, all documentation is in `POWER.md` (~500 lines).

**When to add steering files:**

- If POWER.md exceeds ~500 lines
- If we add independent workflows (e.g., cost-optimization, advanced-analytics)
- For progressive disclosure of advanced features

**Current approach:** Keep everything in POWER.md for simplicity.

### 7. Keywords Selection

Keywords are **specific and domain-focused** to avoid false positive activations:

✅ **Good keywords used:**

- healthomics (specific AWS service)
- genomics (specific domain)
- bioinformatics (specific field)
- troubleshooting (specific use case)
- workflows (specific context)

❌ **Avoided broad keywords:**

- test, debug, help, api, data (too generic, cause false activations)

## Comparison with AWS ECS Express Power Example

The ECS Express Power (by John Ritsema) provides a good reference:

**Similarities:**

- Single POWER.md file with all documentation
- Clear onboarding section
- Workflow-based structure
- Uses existing AWS MCP servers
- Focuses on orchestration rather than custom tools

**Our enhancements:**

- Declares Power dependencies explicitly (HealthOmics, Observability, AgentCore, etc.)
- Includes Setup Wizard for turnkey deployment
- Integrates IAM Policy Autopilot for automated permissions
- Supports custom knowledge base ingestion
- Provides specialized bioinformatics domain knowledge

## Installation for Testing

### Local Development Testing

```bash
# In Kiro IDE:
1. Click Powers icon
2. Click "Add Custom Power"
3. Select "Local Directory"
4. Enter: /absolute/path/to/this/project/power
5. Click Add
```

### GitHub Distribution (After Development)

```bash
# Users will install via:
1. Click Powers icon
2. Click "Add Custom Power"
3. Enter: https://github.com/aws-samples/aws-healthomics-ai-troubleshooting-assistant/tree/main/power
4. Click Add
```

## Next Steps

1. **Complete implementation** (follow tasks.md)
2. **Test locally** using local directory installation
3. **Iterate** based on testing feedback
4. **Publish to GitHub** when ready
5. **Submit to Kiro** for official recommendation (optional)

## References

- [Kiro Power Builder Documentation](https://kiro.dev/powers/build)
- [ECS Express Power Example](https://github.com/jritsema/ecs-express-power)
- [MCP Configuration Reference](https://kiro.dev/docs/mcp/configuration/)
