import { NextResponse } from 'next/server';

const EXA_API_KEY = process.env.NEXT_PUBLIC_EXA_API_KEY;
const EXA_SEARCH_URL = 'https://api.exa.ai/search';
const EXA_CONTENTS_URL = 'https://api.exa.ai/contents';

export async function POST(request: Request) {
  try {
    if (!EXA_API_KEY) {
      return NextResponse.json({ error: 'EXA API key not found' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, data } = body;

    const url = endpoint === 'search' ? EXA_SEARCH_URL : EXA_CONTENTS_URL;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXA_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in Exa API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 