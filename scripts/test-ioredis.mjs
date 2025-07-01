import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || "rediss://default:AaxyAAIjcDFjMTQwMDc4MjU5YTU0MDViODRmNzE4NzRlMzk1MTFmMXAxMA@fond-peacock-44146.upstash.io:6379";

console.log('Testing ioredis connection to Upstash...');
console.log('URL:', redisUrl.replace(/:[^:@]+@/, ':***@'));

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    console.log(`Retry attempt ${times}`);
    return Math.min(times * 50, 2000);
  },
  reconnectOnError: (err) => {
    console.log('Reconnect on error:', err.message);
    return true;
  }
});

redis.on('connect', () => {
  console.log('✓ Connected event fired');
});

redis.on('ready', () => {
  console.log('✓ Ready event fired');
});

redis.on('error', (err) => {
  console.error('✗ Error event:', err.message);
});

try {
  // Test basic operations
  console.log('\nTesting basic operations...');
  
  await redis.ping();
  console.log('✓ PING successful');
  
  await redis.set('test:ioredis', 'Hello from ioredis');
  console.log('✓ SET successful');
  
  const value = await redis.get('test:ioredis');
  console.log('✓ GET successful:', value);
  
  await redis.del('test:ioredis');
  console.log('✓ DEL successful');
  
  console.log('\n✅ All tests passed! ioredis works with Upstash.');
  
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  console.error('Error details:', error);
} finally {
  redis.disconnect();
  console.log('\nDisconnected');
}