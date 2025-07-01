import { NextResponse } from 'next/server';

// Simple test endpoint to verify MCP setup
export async function GET() {
  try {
    // Check if we can import the MCP adapter
    await import('@vercel/mcp-adapter');
    
    return NextResponse.json({
      success: true,
      message: 'MCP adapter imported successfully',
      redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}