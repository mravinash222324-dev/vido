import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const domain = 'voughtinternational.metered.live';
    const apiKey = 'jq22-ASlzgFdCu1XVytufGZWFAvmbrtghXU2aGdrVt9Akywv';
    
    // Fetch live TURN server credentials from Metered API
    const res = await fetch(\`https://\${domain}/api/v1/turn/credentials?apiKey=\${apiKey}\`, {
        cache: 'no-store' // Ensure we get fresh temporary credentials
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch TURN credentials');
    }

    const iceServers = await res.json();
    return NextResponse.json(iceServers);
  } catch (error) {
    console.error("TURN Fetch Error:", error);
    // Fallback to Google STUN if API fails
    return NextResponse.json([
      { urls: 'stun:stun.l.google.com:19302' }
    ]);
  }
}
