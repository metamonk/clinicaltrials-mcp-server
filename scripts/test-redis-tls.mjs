import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || "rediss://default:AaxyAAIjcDFjMTQwMDc4MjU5YTU0MDViODRmNzE4NzRlMzk1MTFmMXAxMA@fond-peacock-44146.upstash.io:6379";

console.log('Testing Redis connection with TLS config...');

const client = createClient({
  url: redisUrl,
  socket: {
    tls: true,
    rejectUnauthorized: false, // Try without cert verification first
    connectTimeout: 30000, // 30 second timeout
  }
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err.message);
});

client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('ready', () => {
  console.log('Redis client ready');
});

try {
  console.log('Attempting to connect...');
  await client.connect();
  console.log('✓ Connected to Redis successfully');
  
  // Test ping
  const pong = await client.ping();
  console.log('✓ PING response:', pong);
  
  // Test basic operations
  await client.set('test:key', 'Hello from TLS test');
  const value = await client.get('test:key');
  console.log('✓ Test value:', value);
  
  await client.del('test:key');
  console.log('✓ Cleanup completed');
  
} catch (error) {
  console.error('✗ Failed:', error.message);
  console.error('Error details:', error);
} finally {
  if (client.isOpen) {
    await client.quit();
    console.log('Connection closed');
  }
}