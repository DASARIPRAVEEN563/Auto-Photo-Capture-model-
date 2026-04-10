import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    const db = await openDb();
    const setting = await db.get(`SELECT value FROM settings WHERE key = 'admin_password'`);
    if (!setting || setting.value !== password) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const captures = await db.all('SELECT * FROM captures ORDER BY captured_at DESC');
    const links = await db.all('SELECT * FROM links ORDER BY created_at DESC');
    
    return NextResponse.json({ captures, links });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
