# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides AI agents with structured access to ClinicalTrials.gov data. It's built with Next.js 15.3.4 using the App Router and designed for Vercel deployment.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Run development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Test the MCP server locally
node scripts/test-client.mjs
```

## Architecture

### Core Components

1. **MCP Handler**: `/src/app/api/[transport]/route.ts` - Main MCP endpoint supporting SSE/HTTP transports
2. **Tools**: Located in `/src/tools/`
   - `search_trials`: Search clinical trials with filters
   - `get_study_details`: Get detailed information about a specific trial
3. **Services**: Located in `/src/services/`
   - `clinicaltrials-api.service.ts`: Handles ClinicalTrials.gov API communication
   - `query-builder.service.ts`: Constructs ClinicalTrials.gov query expressions

### MCP Tool Structure

Each tool follows this pattern:
```
src/tools/[tool-name]/
├── handler.ts    # Main tool logic
├── schema.ts     # Zod validation schema
└── index.ts      # Tool registration
```

### Key Technologies

- **Framework**: Next.js with App Router
- **Validation**: Zod schemas for all tool inputs
- **MCP SDK**: `@modelcontextprotocol/sdk` and `@vercel/mcp-adapter`
- **State Management**: Redis for MCP sessions (requires `REDIS_URL` env var)
- **HTTP Client**: Axios for API calls
- **Styling**: Tailwind CSS

## Testing MCP Tools

To test MCP functionality:
1. Run `pnpm dev` to start the server
2. In another terminal, run `node scripts/test-client.mjs`
3. Use the test endpoints:
   - `/api/debug` - Debug information
   - `/api/mcp-test` - Test MCP connection
   - `/api/test` - General test endpoint

## API Rate Limits

ClinicalTrials.gov API has rate limiting considerations:
- No authentication required
- Be mindful of request frequency
- Results are paginated (max 1000 per request)

## Environment Variables

Required for production:
- `REDIS_URL`: Redis connection string for MCP session state

## Adding New Tools

1. Create new directory in `/src/tools/[tool-name]/`
2. Implement handler.ts with tool logic
3. Define schema.ts with Zod validation
4. Export from index.ts
5. Register in `/src/tools/index.ts`

## TypeScript Configuration

- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017
- Module resolution: bundler