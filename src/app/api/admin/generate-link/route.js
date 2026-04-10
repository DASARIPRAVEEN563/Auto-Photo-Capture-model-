import { openDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password, customSlug } = await request.json();
    
    const db = await openDb();
    const setting = await db.get(`SELECT value FROM settings WHERE key = 'admin_password'`);
    if (!setting || setting.value !== password) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let linkId = customSlug ? customSlug.trim() : uuidv4();

    // Validation for custom slug
    if (customSlug) {
      if (!/^[a-zA-Z0-9_-]+$/.test(linkId)) {
        return NextResponse.json({ error: 'Custom link name must be alphanumeric and can include dashes (-)' }, { status: 400 });
      }
      if (linkId.length < 3) {
        return NextResponse.json({ error: 'Custom link name must be at least 3 characters long' }, { status: 400 });
      }

      const existing = await db.get('SELECT id FROM links WHERE id = ?', [linkId]);
      if (existing) {
        return NextResponse.json({ error: 'This custom link name is already taken. Please choose another one.' }, { status: 400 });
      }
    }
    
    await db.run('INSERT INTO links (id) VALUES (?)', [linkId]);
    
    return NextResponse.json({ linkId });
  } catch (error) {
    console.error('Error generating link:', error);
    return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 });
  }
}
