import { NextRequest, NextResponse } from 'next/server';
import { searchTrialsHandler } from '../../../tools/search-trials';
import { searchTrialsInputSchema } from '../../../tools/search-trials';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = searchTrialsInputSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.format()
      }, { status: 400 });
    }
    
    // Call handler directly
    const result = await searchTrialsHandler(validationResult.data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Direct test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}