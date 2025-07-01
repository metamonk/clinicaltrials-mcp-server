import { createMcpHandler } from '@vercel/mcp-adapter';
import { toMCPError } from '../../../lib/mcp-errors';

// Import tools
import {
  searchTrialsInputSchema,
  searchTrialsHandler
} from '../../../tools/search-trials';
import {
  getStudyDetailsInputSchema,
  getStudyDetailsHandler
} from '../../../tools/get-study-details';

// Redis configuration
// Note: Upstash recommends HTTP client for serverless, but MCP adapter expects Redis protocol
// We'll let it fail gracefully if the connection doesn't work
const redisUrl = process.env.REDIS_URL;
console.log('Redis configuration:', redisUrl ? 'Attempting to connect...' : 'Disabled (no REDIS_URL)');

// Log if Redis connection fails
if (redisUrl) {
  console.log('Note: If Redis connection fails, MCP will work without SSE resumability');
}

// Create the MCP handler
const handler = createMcpHandler(
  (server) => {
    console.log('ClinicalTrials.gov MCP Server initializing...');

    // Register search_trials tool
    server.tool(
      'search_trials',
      'Search for clinical trials on ClinicalTrials.gov with advanced filtering options',
      searchTrialsInputSchema.shape,
      async (input) => {
        console.log('search_trials tool called with:', input);
        try {
          // Validate input with Zod schema
          const validatedInput = searchTrialsInputSchema.parse(input);
          const result = await searchTrialsHandler(validatedInput);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          const mcpError = toMCPError(error);
          console.error('Error in search_trials:', mcpError);
          throw mcpError;
        }
      }
    );

    // Register get_study_details tool
    server.tool(
      'get_study_details',
      'Get detailed information about a specific clinical trial from ClinicalTrials.gov',
      getStudyDetailsInputSchema.shape,
      async (input) => {
        console.log('get_study_details tool called with:', input);
        try {
          // Validate input with Zod schema
          const validatedInput = getStudyDetailsInputSchema.parse(input);
          const result = await getStudyDetailsHandler(validatedInput);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          const mcpError = toMCPError(error);
          console.error('Error in get_study_details:', mcpError);
          throw mcpError;
        }
      }
    );

    console.log('MCP Server initialized with 2 tools');
  },
  {}, // empty serverOptions - metadata is set elsewhere
  {
    // Use Redis URL if available, but don't require it
    redisUrl: redisUrl,
    basePath: '/api',
    verboseLogs: true // Enable verbose logging for debugging
  }
);

// Export handlers using named exports
export { handler as GET, handler as POST };