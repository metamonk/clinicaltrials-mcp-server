// Test using raw HTTP requests to understand the MCP protocol better
import fetch from 'node-fetch';

const serverUrl = 'http://localhost:3000';

async function testRawMCP() {
  console.log('Testing MCP Server with raw HTTP requests...\n');

  // Test 1: List tools via HTTP
  console.log('1. Testing HTTP endpoint - List tools:');
  try {
    const response = await fetch(`${serverUrl}/api/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/list',
        params: {},
        id: 1
      })
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n2. Testing HTTP endpoint - Call tool:');
  try {
    const response = await fetch(`${serverUrl}/api/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'search_trials',
          arguments: {
            conditions: ['cancer'],
            pageSize: 5
          }
        },
        id: 2
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// First install node-fetch if needed
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function main() {
  try {
    // Check if node-fetch is installed
    await import('node-fetch');
  } catch {
    console.log('Installing node-fetch...');
    await execAsync('pnpm add -D node-fetch', { cwd: '../clinicaltrials-mcp-server' });
  }
  
  await testRawMCP();
}

main().catch(console.error);