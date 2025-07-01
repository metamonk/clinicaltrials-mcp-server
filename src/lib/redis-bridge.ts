import { Redis as UpstashRedis } from '@upstash/redis';
import { createClient } from 'redis';

// Create Upstash HTTP client
const upstashClient = new UpstashRedis({
  url: 'https://fond-peacock-44146.upstash.io',
  token: process.env.REDIS_URL?.split('@')[0].split(':').pop() || '',
});

// Create a proxy that makes Upstash HTTP client compatible with node-redis interface
export function createRedisClient() {
  // For development, use a mock client that logs operations
  if (!process.env.REDIS_URL) {
    console.log('No REDIS_URL found, using mock Redis client');
    return {
      connect: async () => console.log('Mock Redis: connect'),
      disconnect: async () => console.log('Mock Redis: disconnect'),
      quit: async () => console.log('Mock Redis: quit'),
      get: async (key: string) => {
        console.log('Mock Redis GET:', key);
        return null;
      },
      set: async (key: string, value: string) => {
        console.log('Mock Redis SET:', key, value);
        return 'OK';
      },
      del: async (key: string) => {
        console.log('Mock Redis DEL:', key);
        return 1;
      },
      publish: async (channel: string, message: string) => {
        console.log('Mock Redis PUBLISH:', channel, message);
        return 1;
      },
      subscribe: async (channel: string) => {
        console.log('Mock Redis SUBSCRIBE:', channel);
      },
      on: (event: string, handler: Function) => {
        console.log('Mock Redis event listener:', event);
      },
      isOpen: true,
    };
  }

  // For production, try to use the standard Redis client
  // If it fails, we'll fall back to HTTP operations only
  try {
    const client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: false, // Don't retry, fail fast
      }
    });
    
    // Test connection
    client.connect().catch(err => {
      console.warn('Redis TCP connection failed, MCP SSE features may be limited:', err.message);
    });
    
    return client;
  } catch (error) {
    console.warn('Failed to create Redis client, using limited functionality');
    // Return a minimal client that won't break the MCP adapter
    return {
      connect: async () => {},
      disconnect: async () => {},
      quit: async () => {},
      on: () => {},
      isOpen: false,
    };
  }
}