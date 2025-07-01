import { createMcpHandler } from '@vercel/mcp-adapter';

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
          const result = await searchTrialsHandler(input);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          console.error('Error in search_trials:', error);
          throw error;
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
          const result = await getStudyDetailsHandler(input);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          };
        } catch (error) {
          console.error('Error in get_study_details:', error);
          throw error;
        }
      }
    );

    console.log('MCP Server initialized with 2 tools');
  },
  {}, // empty serverOptions
  {
    // Use Redis URL if available, but don't require it
    redisUrl: redisUrl,
    basePath: '/api',
    verboseLogs: true, // Enable verbose logging for debugging
    // Add error handling for Redis connection failures
    onError: (error: Error) => {
      if (error.message.includes('Redis') || error.message.includes('ETIMEDOUT')) {
        console.warn('Redis connection issue (non-fatal):', error.message);
        // Don't throw - let MCP work without Redis
      } else {
        throw error;
      }
    }
  }
);

// Export handlers using named exports
export { handler as GET, handler as POST };