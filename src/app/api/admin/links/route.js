import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    const { password, id, isActive } = await request.json();
    
    const db = await openDb();
    const setting = await db.get(`SELECT value FROM settings WHERE key = 'admin_password'`);
    if (!setting || setting.value !== password) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await db.run('UPDATE links SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating link active status:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
