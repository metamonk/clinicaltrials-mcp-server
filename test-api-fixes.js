#!/usr/bin/env node

// Test script to verify the API fixes
const axios = require('axios');

const BASE_URL = 'https://clinicaltrials.gov/api/v2';

async function testLocationFormats() {
  console.log('Testing different location formats...\n');
  
  const testCases = [
    {
      name: 'City/State format with phase filtering',
      params: {
        'query.locn': 'New York, NY',
        'query.term': 'AREA[Phase]PHASE3',
        'pageSize': '5',
        'fields': 'NCTId,BriefTitle,LocationCity,LocationState,Phase',
        'format': 'json'
      }
    },
    {
      name: 'Distance function format with filter.geo',
      params: {
        'filter.geo': 'distance(40.7128,-74.0060,50mi)',
        'pageSize': '5',
        'fields': 'NCTId,BriefTitle,LocationCity,LocationState,LocationGeoPoint',
        'format': 'json'
      }
    },
    {
      name: 'Multiple phases using ESSIE expression',
      params: {
        'query.locn': 'Boston, MA',
        'query.term': 'AREA[Phase]PHASE2 OR AREA[Phase]PHASE3',
        'pageSize': '5',
        'fields': 'NCTId,BriefTitle,Phase',
        'format': 'json'
      }
    },
    {
      name: 'Filter by status (which is a proper filter parameter)',
      params: {
        'query.locn': 'San Francisco, CA',
        'filter.overallStatus': 'RECRUITING,ENROLLING_BY_INVITATION',
        'pageSize': '5',
        'fields': 'NCTId,BriefTitle,OverallStatus',
        'format': 'json'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    console.log('Parameters:', JSON.stringify(testCase.params, null, 2));
    
    try {
      const response = await axios.get(`${BASE_URL}/studies`, {
        params: testCase.params,
        timeout: 10000
      });
      
      console.log(`✓ Success! Found ${response.data.totalCount} trials`);
      
      if (response.data.studies && response.data.studies.length > 0) {
        console.log(`First result: ${response.data.studies[0].protocolSection.identificationModule.nctId}`);
      }
    } catch (error) {
      console.error(`✗ Error: ${error.response?.status} - ${error.response?.statusText}`);
      if (error.response?.data) {
        console.error('Details:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

async function testPaginationToken() {
  console.log('\n\nTesting pagination with pageToken...\n');
  
  try {
    // First request
    const firstResponse = await axios.get(`${BASE_URL}/studies`, {
      params: {
        'query.locn': 'Chicago, IL',
        'pageSize': '10',
        'fields': 'NCTId,BriefTitle',
        'format': 'json'
      }
    });
    
    console.log(`First page: Found ${firstResponse.data.studies.length} of ${firstResponse.data.totalCount} total`);
    
    if (firstResponse.data.nextPageToken) {
      console.log('Next page token:', firstResponse.data.nextPageToken);
      
      // Second request with pageToken
      const secondResponse = await axios.get(`${BASE_URL}/studies`, {
        params: {
          'query.locn': 'Chicago, IL',
          'pageSize': '10',
          'pageToken': firstResponse.data.nextPageToken,
          'fields': 'NCTId,BriefTitle',
          'format': 'json'
        }
      });
      
      console.log(`✓ Second page: Retrieved ${secondResponse.data.studies.length} more results`);
    }
  } catch (error) {
    console.error(`✗ Pagination error: ${error.response?.status}`);
  }
}

// Run tests
(async () => {
  console.log('=== ClinicalTrials.gov API Fix Verification ===\n');
  await testLocationFormats();
  await testPaginationToken();
  console.log('\n=== Tests Complete ===');
})();