import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ valid: false });
  }

  try {
    const db = await openDb();
    const link = await db.get('SELECT * FROM links WHERE id = ? AND is_active = 1', [id]);
    
    if (link) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false });
    }
  } catch (e) {
    return NextResponse.json({ valid: false });
  }
}
