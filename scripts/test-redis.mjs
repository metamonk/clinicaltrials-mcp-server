import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || "rediss://default:AaxyAAIjcDFjMTQwMDc4MjU5YTU0MDViODRmNzE4NzRlMzk1MTFmMXAxMA@fond-peacock-44146.upstash.io:6379";

console.log('Testing Redis connection...');
console.log('Redis URL:', redisUrl.replace(/:[^:@]+@/, ':***@')); // Hide password in logs

const client = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: false
  }
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('ready', () => {
  console.log('Redis client ready');
});

try {
  await client.connect();
  console.log('✓ Connected to Redis successfully');
  
  // Test basic operations
  await client.set('test:key', 'Hello from test script');
  const value = await client.get('test:key');
  console.log('✓ Test value:', value);
  
  await client.del('test:key');
  console.log('✓ Cleanup completed');
  
} catch (error) {
  console.error('✗ Failed to connect:', error.message);
} finally {
  await client.quit();
  console.log('Connection closed');
}