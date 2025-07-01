import { NextResponse } from 'next/server';
import { createClient } from 'redis';

export async function GET() {
  if (!process.env.REDIS_URL) {
    return NextResponse.json({ 
      success: false, 
      error: 'REDIS_URL not configured' 
    });
  }

  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: false
    }
  });

  try {
    await client.connect();
    await client.ping();
    await client.disconnect();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Redis connection successful' 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}