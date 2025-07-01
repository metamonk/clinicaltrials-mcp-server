<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# Generic Vercel Next.js MCP Server Setup Prompt

Based on the ByteGrad video tutorial, here's a comprehensive prompt to set up a generic Vercel Next.js MCP (Model Context Protocol) server[^1_1]:

## Project Overview

Create a Next.js application that combines a standard website with an MCP server, allowing AI agents to interact with your application through standardized tools and resources. This setup enables AI agents like ChatGPT or GitHub Copilot to invoke functions on your server rather than just scraping your website[^1_1].

## Step-by-Step Setup Instructions

### 1. Initialize Next.js Project

```bash
npx create-next-app@latest your-project-name
cd your-project-name
npm run dev
```

Accept all default options during setup[^1_1].

### 2. Install Required Dependencies

```bash
npm install @vercel/mcp-adapter @modelcontextprotocol/sdk redis zod
```

**Package breakdown:**

- `@vercel/mcp-adapter`: Vercel's MCP adapter for Next.js
- `@modelcontextprotocol/sdk`: Core MCP SDK
- `redis`: State management for the MCP server
- `zod`: Input validation for MCP tools[^1_1]


### 3. Create MCP Server Route

Create the file structure: `app/api/[transport]/route.ts`

The dynamic route `[transport]` handles different transport protocols (SSE, HTTP)[^1_1].

### 4. Implement MCP Server Handler

```typescript
import { createMCPHandler } from '@vercel/mcp-adapter';
import { z } from 'zod';

// Define your tool's input schema
const toolInputSchema = z.object({
  // Define your input parameters here
  parameter: z.string().describe("Description of the parameter")
});

// Create the MCP handler
const handler = createMCPHandler(
  (server) => {
    // Define your MCP tools
    server.tool("your-tool-name", {
      description: "Description of what your tool does",
      inputSchema: toolInputSchema,
      handler: async ({ parameter }) => {
        // Your tool's logic here
        // This can be async and can make database calls, API calls, etc.
        
        return {
          content: [
            {
              type: "text",
              text: "Your tool's response based on the input"
            }
          ]
        };
      }
    });
  },
  {
    capabilities: {
      tools: {} // Advertise that this server has tools
    },
    // Configuration
    redisUrl: process.env.REDIS_URL,
    sseEndpoint: "/sse",
    httpEndpoint: "/mcp",
    enableLogs: true,
    maxDuration: 60 // Maximum duration for MCP requests in seconds
  }
);

// Export the handler for GET, POST, and DELETE methods
export const GET = handler;
export const POST = handler;
export const DELETE = handler;
```


### 5. Deploy to GitHub

```bash
git init
git add .
git commit -m "Initial MCP server setup"
git remote add origin your-github-repo-url
git push -u origin main
```


### 6. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Deploy with default settings[^1_1]

### 7. Set Up Redis Database

1. In Vercel dashboard, go to your project
2. Navigate to "Storage" tab
3. Create new database from marketplace
4. Choose "Upstash Redis"
5. Select free plan and create with default settings
6. Connect the database to your project
7. This automatically sets the `REDIS_URL` environment variable[^1_1]

### 8. Test Your MCP Server

Create a test script in `scripts/test-client.mjs`:

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const serverUrl = 'YOUR_VERCEL_URL'; // Replace with your Vercel URL

async function testMCPServer() {
  const transport = new SSEClientTransport(new URL('/api/sse', serverUrl));
  const client = new Client({ name: 'test-client', version: '1.0.0' }, { capabilities: {} });
  
  await client.connect(transport);
  
  console.log('Connected!');
  console.log('Server capabilities:', await client.getServerCapabilities());
  console.log('Available tools:', await client.listTools());
  
  await client.close();
}

testMCPServer().catch(console.error);
```

Run the test:

```bash
node scripts/test-client.mjs
```


### 9. Connect to AI Agents

**For GitHub Copilot:**

1. Open VS Code settings
2. Add MCP server configuration:
```json
{
  "github.copilot.chat.mcpServers": {
    "your-server-name": {
      "command": "http",
      "args": ["YOUR_VERCEL_URL/api/mcp"]
    }
  }
}
```

**For other AI agents:** Use the MCP server URL: `YOUR_VERCEL_URL/api/mcp`[^1_1]

## Key Features of This Setup

- **All-in-one application**: Combines standard Next.js website with MCP server
- **Standardized AI communication**: Uses MCP protocol for structured AI agent interactions
- **Scalable tools**: Can add multiple tools with different functionalities
- **Async operations**: Supports database calls, API requests, and complex logic
- **Input validation**: Uses Zod for type-safe input handling
- **Multiple transport protocols**: Supports both SSE and HTTP endpoints[^1_1]


## Customization Options

- **Add multiple tools**: Extend the server with additional `server.tool()` definitions
- **Database integration**: Use the Redis connection for state management
- **API integrations**: Make external API calls within tool handlers
- **Complex input schemas**: Use Zod for sophisticated input validation
- **Error handling**: Implement try-catch blocks for robust error management[^1_1]

This setup creates a production-ready MCP server that AI agents can interact with, providing structured access to your application's functionality beyond simple web scraping.

<div style="text-align: center">⁂</div>

[^1_1]: https://www.youtube.com/watch?v=LAxwvZUaaDE

