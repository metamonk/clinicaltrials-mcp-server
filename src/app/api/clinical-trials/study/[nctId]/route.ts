import { NextRequest, NextResponse } from 'next/server';
import { getStudyDetailsHandler } from '../../../../../tools/get-study-details';
import { getStudyDetailsInputSchema } from '../../../../../tools/get-study-details';

export async function GET(
  request: NextRequest,
  { params }: { params: { nctId: string } }
) {
  try {
    const nctId = params.nctId;
    const searchParams = request.nextUrl.searchParams;
    
    const input = {
      nctId,
      includeEligibilityParsed: searchParams.get('includeEligibilityParsed') === 'true',
      fields: searchParams.get('fields')?.split(',').filter(Boolean)
    };
    
    // Validate input
    const validationResult = getStudyDetailsInputSchema.safeParse(input);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.format()
      }, { status: 400 });
    }
    
    // Call handler directly
    const result = await getStudyDetailsHandler(validationResult.data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Direct study details error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}