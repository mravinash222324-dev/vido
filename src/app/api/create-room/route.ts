import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { roomName } = await request.json();
    const METERED_SECRET_KEY = process.env.METERED_SECRET_KEY;

    if (!METERED_SECRET_KEY) {
      return NextResponse.json({ error: 'Metered Secret Key not configured' }, { status: 500 });
    }

    const response = await fetch(`https://voughtinternational.metered.live/api/v1/room?secretKey=${METERED_SECRET_KEY}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roomName })
    });

    const data = await response.json();
    
    // Metered returns 200 or 201 for success. 
    // If the room already exists, it might return 400 or just return the existing room data depending on configuration.
    // For this specific logic, we just need to ensure the room exists.
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Create Room Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
