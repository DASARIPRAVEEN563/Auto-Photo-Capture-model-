import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { linkId, userName, crushName, photos, percentage } = await request.json();

    if (!linkId || !userName || !crushName || !photos) {
       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await openDb();
    
    const link = await db.get('SELECT * FROM links WHERE id = ? AND is_active = 1', [linkId]);
    if (!link) {
       return NextResponse.json({ error: 'Invalid or expired link' }, { status: 403 });
    }

    // Prepare public/captures directory
    const capturesDir = path.join(process.cwd(), 'public', 'captures');
    if (!fs.existsSync(capturesDir)) {
      fs.mkdirSync(capturesDir, { recursive: true });
    }

    const savedPhotoPaths = [];

    // Save each base64 string as a physical image onto the device hard drive
    for (let i = 0; i < photos.length; i++) {
        const base64Data = photos[i].replace(/^data:image\/jpeg;base64,/, "");
        const fileName = `${userName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}_${i}.jpg`;
        const filePath = path.join(capturesDir, fileName);
        
        fs.writeFileSync(filePath, base64Data, 'base64');
        savedPhotoPaths.push(`/captures/${fileName}`);
    }

    // Save the DB record pointing to the URLs
    await db.run(
      'INSERT INTO captures (link_id, user_name, crush_name, photos, percentage) VALUES (?, ?, ?, ?, ?)',
      [linkId, userName, crushName, JSON.stringify(savedPhotoPaths), percentage || 0]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving capture:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
