# Deployment Guide for ClinicalTrials.gov MCP Server

## Prerequisites

1. [Vercel CLI](https://vercel.com/cli) installed
2. Vercel account
3. GitHub repository (optional but recommended)

## Step 1: Prepare for Deployment

1. Ensure all dependencies are installed:
   ```bash
   pnpm install
   ```

2. Test the build locally:
   ```bash
   pnpm build
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via CLI (Recommended)

1. Install Vercel CLI if not already installed:
   ```bash
   npm i -g vercel
   ```

2. Deploy the project:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Link to existing project or create new one
   - Choose project name (e.g., `clinicaltrials-mcp-server`)
   - Confirm settings

### Option B: Deploy via GitHub

1. Push to GitHub repository
2. Import project in Vercel Dashboard
3. Vercel will auto-detect Next.js and configure accordingly

## Step 3: Configure Environment Variables

In Vercel Dashboard:

1. Go to Project Settings > Environment Variables
2. Add the following (if you have Redis):
   - `REDIS_URL` - Your Redis connection string (optional - MCP will work without it)

## Step 4: Test Deployment

Once deployed, test the MCP server:

1. Test basic connectivity:
   ```bash
   curl https://YOUR-PROJECT.vercel.app/api/test
   ```

2. Test with MCP client:
   ```bash
   MCP_SERVER_URL=https://YOUR-PROJECT.vercel.app node scripts/test-client.mjs
   ```

## Step 5: Update OncoBot Integration

Update OncoBot to use your deployed MCP server URL:

```typescript
// In OncoBot's MCP client configuration
const MCP_SERVER_URL = 'https://YOUR-PROJECT.vercel.app';
```

## Troubleshooting

### Redis Connection Issues
- The server works without Redis (no SSE resumability)
- Check Redis URL format if using Upstash
- Verify Redis instance is accessible

### CORS Issues
- MCP adapter handles CORS automatically
- Ensure you're using the correct endpoints (/api/sse, /api/mcp)

### Function Timeouts
- Default timeout is 60 seconds (configured in vercel.json)
- Adjust if needed for large searches

## Production Considerations

1. **Rate Limiting**: Consider implementing rate limiting for public APIs
2. **Monitoring**: Use Vercel Analytics to monitor usage
3. **Caching**: Redis caching improves performance but is optional
4. **API Keys**: Keep ClinicalTrials.gov API within rate limits