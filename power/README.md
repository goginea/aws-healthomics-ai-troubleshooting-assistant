# HealthOmics AI Troubleshooter - Kiro Power

This directory contains the Kiro Power distribution files.

## Installation

### From GitHub (Recommended)

1. Open Kiro IDE
2. Click the Powers icon in the activity bar
3. Click "Add Custom Power"
4. Enter: `https://github.com/goginea/aws-healthomics-ai-troubleshooting-assistant/tree/main/power`
5. Click Add
6. When prompted, install required dependency Powers

### From Local Directory (Development)

1. Open Kiro IDE
2. Click the Powers icon
3. Click "Add Custom Power"
4. Select "Local Directory"
5. Enter the full path to this `power/` directory
6. Click Add

## Files

- `POWER.md` - Main Power documentation with metadata, onboarding, and workflows
- `mcp.json` - MCP server configuration (registers the setup and management tools)
- `README.md` - This file

## Dependencies

This Power requires these Powers to be installed:

- aws-healthomics
- aws-observability
- aws-agentcore
- iam-policy-autopilot-power
- aws-infrastructure-as-code

You'll be prompted to install them during Power installation.
