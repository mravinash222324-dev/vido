import { NextResponse } from 'next/server';

export async function GET() {
  const domain = 'voughtinternational.metered.live';
  const apiKey = 'jq22-ASlzgFdCu1XVytufGZWFAvmbrtghXU2aGdrVt9Akywv';
  
  return NextResponse.json([
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    {
      urls: `turn:${domain}:80`,
      username: 'voughtinternational',
      credential: apiKey
    },
    {
      urls: `turn:${domain}:443`,
      username: 'voughtinternational',
      credential: apiKey
    },
    {
      urls: `turn:${domain}:443?transport=tcp`,
      username: 'voughtinternational',
      credential: apiKey
    }
  ]);
}
