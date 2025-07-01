import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const serverUrl = process.env.MCP_SERVER_URL || 'http://localhost:3000';

async function testMCPServer() {
  console.log('Testing MCP Server (Simple Version)...\n');
  
  const transport = new SSEClientTransport(new URL('/api/sse', serverUrl));
  const client = new Client(
    { name: 'test-client', version: '1.0.0' },
    { capabilities: {} }
  );
  
  try {
    await client.connect(transport);
    console.log('Connected!\n');
    
    // List tools to ensure they're available
    const toolsList = await client.listTools();
    console.log('Available tools:', toolsList.tools.map(t => t.name).join(', '));
    console.log();
    
    // Try the simplest possible call
    console.log('Calling search_trials with minimal parameters...');
    const result = await client.request({
      method: 'tools/call',
      params: {
        name: 'search_trials',
        arguments: {
          conditions: ['cancer'],
          pageSize: 5
        }
      }
    });
    
    console.log('Result:', result);
    
    await client.close();
  } catch (error) {
    console.error('Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

testMCPServer().catch(console.error);