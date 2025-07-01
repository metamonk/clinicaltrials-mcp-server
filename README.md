# ClinicalTrials.gov MCP Server

A Vercel-hosted MCP (Model Context Protocol) server that provides AI agents with structured access to ClinicalTrials.gov data.

## Overview

This MCP server enables AI agents to search and retrieve clinical trial information from ClinicalTrials.gov through standardized tools. It's built with Next.js and deployed on Vercel, following the MCP protocol for AI tool integration.

## Features

- **Search Clinical Trials**: Advanced search with filtering by conditions, location, biomarkers, phases, and more
- **Get Study Details**: Retrieve comprehensive information about specific trials
- **Location-based Search**: Find trials near specific coordinates with distance calculations
- **Biomarker Matching**: Search for trials targeting specific genetic markers
- **Real-time Data**: Direct integration with ClinicalTrials.gov API

## Available Tools

### 1. `search_trials`

Search for clinical trials with advanced filtering options:

```json
{
  "conditions": ["breast cancer"],
  "location": {
    "city": "New York",
    "state": "NY",
    "distance": 50
  },
  "biomarkers": [
    {"name": "HER2", "status": "positive"}
  ],
  "phases": ["2", "3"],
  "recruitingOnly": true
}
```

### 2. `get_study_details`

Get detailed information about a specific trial:

```json
{
  "nctId": "NCT12345678",
  "includeEligibilityParsed": true
}
```

## Local Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run the development server:
   ```bash
   pnpm dev
   ```

3. Test the MCP server:
   ```bash
   node scripts/test-client.mjs
   ```

## Deployment

1. Deploy to Vercel:
   ```bash
   vercel
   ```

2. Set up Redis database in Vercel dashboard

3. Configure environment variables:
   - `REDIS_URL` - Redis connection string

## Integration with AI Agents

### For OncoBot Integration

Update OncoBot to use this MCP server by adding a new tool that connects to:
- SSE endpoint: `YOUR_VERCEL_URL/api/sse`
- HTTP endpoint: `YOUR_VERCEL_URL/api/mcp`

### For GitHub Copilot

Add to VS Code settings:
```json
{
  "github.copilot.chat.mcpServers": {
    "clinicaltrials": {
      "command": "http",
      "args": ["YOUR_VERCEL_URL/api/mcp"]
    }
  }
}
```

## Architecture

- **Next.js App Router**: Modern React framework
- **Vercel MCP Adapter**: Official MCP integration
- **ClinicalTrials.gov API**: Direct integration
- **Zod Validation**: Type-safe input/output schemas
- **Redis**: State management for MCP sessions

## API Rate Limits

This server respects ClinicalTrials.gov API rate limits. Please be mindful of usage to ensure continued access for all users.

## License

MIT