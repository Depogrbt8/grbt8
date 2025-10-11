import { NextRequest, NextResponse } from 'next/server';
import { getUserFromAuthToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authToken = authHeader.substring(7); // "Bearer " kısmını çıkar
    
    const user = await getUserFromAuthToken(authToken);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Token user API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
