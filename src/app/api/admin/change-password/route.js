import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';

// Helper: verify password against DB
export async function verifyPassword(password) {
  const db = await openDb();
  const row = await db.get(`SELECT value FROM settings WHERE key = 'admin_password'`);
  return row && row.value === password;
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const valid = await verifyPassword(currentPassword);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const db = await openDb();
    await db.run(`UPDATE settings SET value = ? WHERE key = 'admin_password'`, [newPassword]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
