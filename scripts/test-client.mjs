import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

// Test configuration - update with your actual server URL when deployed
const serverUrl = process.env.MCP_SERVER_URL || 'http://localhost:3000';

async function testMCPServer() {
  console.log('🚀 Testing ClinicalTrials.gov MCP Server...\n');
  
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
    
    // Get server capabilities
    console.log('🔍 Server capabilities:');
    const capabilities = await client.getServerCapabilities();
    console.log(JSON.stringify(capabilities, null, 2));
    console.log();
    
    // List available tools
    console.log('🛠️  Available tools:');
    const tools = await client.listTools();
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description?.split('\n')[0]}`);
    });
    console.log();
    
    // Test 1: Search for breast cancer trials
    console.log('📋 Test 1: Searching for breast cancer trials...');
    const searchResult = await client.callTool('search_trials', {
      conditions: ['breast cancer'],
      location: {
        city: 'New York',
        state: 'NY',
        distance: 50
      },
      phases: ['2', '3'],
      recruitingOnly: true,
      pageSize: 5
    });
    
    const searchData = JSON.parse(searchResult.content[0].text);
    console.log(`Found ${searchData.totalCount} trials total`);
    console.log(`Showing ${searchData.trials.length} results\n`);
    
    if (searchData.trials.length > 0) {
      console.log('First trial:');
      const firstTrial = searchData.trials[0];
      console.log(`  - NCT ID: ${firstTrial.nctId}`);
      console.log(`  - Title: ${firstTrial.title}`);
      console.log(`  - Status: ${firstTrial.status}`);
      console.log(`  - Phase: ${firstTrial.phase?.join(', ')}`);
      console.log(`  - Sponsor: ${firstTrial.sponsor.name}`);
      console.log();
      
      // Test 2: Get details for the first trial
      console.log('📋 Test 2: Getting detailed information for first trial...');
      const detailsResult = await client.callTool('get_study_details', {
        nctId: firstTrial.nctId,
        includeEligibilityParsed: true
      });
      
      const detailsData = JSON.parse(detailsResult.content[0].text);
      if (detailsData.success && detailsData.study) {
        const study = detailsData.study;
        console.log('Study details:');
        console.log(`  - Official Title: ${study.officialTitle || 'N/A'}`);
        console.log(`  - Study Type: ${study.design?.studyType || 'N/A'}`);
        console.log(`  - Enrollment: ${study.design?.enrollment?.count || 'N/A'}`);
        console.log(`  - Locations: ${study.locations?.length || 0} sites`);
        
        if (study.eligibility?.parsedCriteria) {
          console.log(`  - Inclusion Criteria: ${study.eligibility.parsedCriteria.inclusion?.length || 0} items`);
          console.log(`  - Exclusion Criteria: ${study.eligibility.parsedCriteria.exclusion?.length || 0} items`);
        }
      }
    }
    
    console.log('\n✅ All tests completed successfully!');
    
    // Close connection
    await client.close();
    console.log('👋 Connection closed');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    process.exit(1);
  }
}

// Run tests
console.log('ClinicalTrials.gov MCP Server Test Client');
console.log('========================================\n');

testMCPServer().catch(console.error);