// Test Upstash REST API connection
const REST_URL = process.env.KV_REST_API_URL || "https://fond-peacock-44146.upstash.io";
const REST_TOKEN = process.env.KV_REST_API_TOKEN || "AaxyAAIjcDFjMTQwMDc4MjU5YTU0MDViODRmNzE4NzRlMzk1MTFmMXAxMA";

console.log('Testing Upstash REST API connection...');
console.log('REST URL:', REST_URL);

try {
  // Test SET command
  const setResponse = await fetch(`${REST_URL}/set/test:key/hello-from-rest`, {
    headers: {
      'Authorization': `Bearer ${REST_TOKEN}`
    }
  });
  
  if (!setResponse.ok) {
    throw new Error(`HTTP ${setResponse.status}: ${setResponse.statusText}`);
  }
  
  const setResult = await setResponse.json();
  console.log('✓ SET result:', setResult);
  
  // Test GET command
  const getResponse = await fetch(`${REST_URL}/get/test:key`, {
    headers: {
      'Authorization': `Bearer ${REST_TOKEN}`
    }
  });
  
  const getResult = await getResponse.json();
  console.log('✓ GET result:', getResult);
  
  // Cleanup
  await fetch(`${REST_URL}/del/test:key`, {
    headers: {
      'Authorization': `Bearer ${REST_TOKEN}`
    }
  });
  
  console.log('✓ Upstash REST API connection successful!');
  
} catch (error) {
  console.error('✗ REST API test failed:', error.message);
}