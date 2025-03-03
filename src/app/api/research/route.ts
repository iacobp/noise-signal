import { NextRequest, NextResponse } from 'next/server';
import { processResearchQuery } from '@/services/researchService';
import { ResearchQuery, ApiResponse, ClassifiedData } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const data: ResearchQuery = await req.json();
    
    if (!data.query || typeof data.query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameter' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const result = await processResearchQuery(data.query);
    
    return NextResponse.json(
      { success: true, data: result } as ApiResponse<ClassifiedData>,
      { status: 200 }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process research query' } as ApiResponse<null>,
      { status: 500 }
    );
  }
} 