import { Redis } from '@upstash/redis';

// Use the HTTP-based client as recommended by Upstash
const redis = new Redis({
  url: 'https://fond-peacock-44146.upstash.io',
  token: 'AaxyAAIjcDFjMTQwMDc4MjU5YTU0MDViODRmNzE4NzRlMzk1MTFmMXAxMA',
});

console.log('Testing Upstash HTTP client...\n');

try {
  // Test basic operations
  await redis.set('test:http', 'Hello from @upstash/redis');
  console.log('✓ SET successful');
  
  const value = await redis.get('test:http');
  console.log('✓ GET successful:', value);
  
  await redis.del('test:http');
  console.log('✓ DEL successful');
  
  // Test ping
  const pong = await redis.ping();
  console.log('✓ PING successful:', pong);
  
  console.log('\n✅ All tests passed! @upstash/redis HTTP client works perfectly.');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
}