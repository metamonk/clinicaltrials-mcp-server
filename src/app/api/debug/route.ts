import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try importing and using the handler
    const { createMcpHandler } = await import('@vercel/mcp-adapter');
    
    // Check environment
    const env = {
      nodeVersion: process.version,
      hasRedis: !!process.env.REDIS_URL,
      cwd: process.cwd()
    };
    
    // Try creating a minimal handler
    let handlerCreated = false;
    let handlerError = null;
    
    try {
      createMcpHandler(
        (server) => {
          server.tool(
            'test',
            'Test tool',
            {},
            async () => ({ content: [{ type: 'text', text: 'test' }] })
          );
        },
        {},
        { redisUrl: process.env.REDIS_URL }
      );
      handlerCreated = true;
    } catch (e) {
      handlerError = e instanceof Error ? e.message : String(e);
    }
    
    return NextResponse.json({
      success: true,
      env,
      handlerCreated,
      handlerError
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}