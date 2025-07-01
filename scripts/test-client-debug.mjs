import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// Test configuration
const serverUrl = process.env.MCP_SERVER_URL || 'http://localhost:3000';

async function testMCPServer() {
  console.log('🚀 Testing ClinicalTrials.gov MCP Server (Debug Version)...\n');
  
  try {
    // Create transport
    const transport = new SSEClientTransport(new URL('/api/sse', serverUrl));
    
    // Create client
    const client = new Client(
      { name: 'test-client', version: '1.0.0' },
      { capabilities: {} }
    );
    
    // Connect to server
    console.log('📡 Connecting to server at:', serverUrl);
    await client.connect(transport);
    console.log('✅ Connected successfully!\n');
    
    // Get server info
    console.log('🔍 Server info:');
    const serverInfo = client.getServerInfo();
    console.log(JSON.stringify(serverInfo, null, 2));
    console.log();
    
    // List available tools
    console.log('🛠️  Available tools:');
    const tools = await client.listTools();
    console.log(JSON.stringify(tools, null, 2));
    console.log();
    
    // Try a minimal search
    console.log('📋 Testing minimal search...');
    try {
      // Try different parameter formats
      const testInputs = [
        // Format 1: Direct parameters
        {
          conditions: ['cancer']
        },
        // Format 2: With all defaults
        {
          conditions: ['cancer'],
          pageSize: 5,
          pageNumber: 1,
          recruitingOnly: true
        }
      ];
      
      for (let i = 0; i < testInputs.length; i++) {
        console.log(`\nTest ${i + 1}: Input format:`, JSON.stringify(testInputs[i], null, 2));
        
        try {
          const result = await client.callTool('search_trials', testInputs[i]);
          console.log('✅ Success! Result type:', typeof result);
          console.log('Result keys:', Object.keys(result));
          if (result.content && result.content[0]) {
            const data = JSON.parse(result.content[0].text);
            console.log('Parsed data success:', data.success);
            console.log('Total trials found:', data.totalCount);
          }
          break; // If successful, don't try other formats
        } catch (err) {
          console.log(`❌ Format ${i + 1} failed:`, err.message);
        }
      }
    } catch (error) {
      console.error('All formats failed:', error);
    }
    
    // Close connection
    await client.close();
    console.log('\n👋 Connection closed');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run tests
console.log('ClinicalTrials.gov MCP Server Debug Test Client');
console.log('==============================================\n');

testMCPServer().catch(console.error);