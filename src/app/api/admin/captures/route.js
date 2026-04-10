import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function PUT(request) {
  try {
    const { password, id, userName, crushName } = await request.json();
    
    const db = await openDb();
    const setting = await db.get(`SELECT value FROM settings WHERE key = 'admin_password'`);
    if (!setting || setting.value !== password) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await db.run('UPDATE captures SET user_name = ?, crush_name = ? WHERE id = ?', [userName, crushName, id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating capture:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
     const { password, id } = await request.json();

     const db = await openDb();
     const setting = await db.get(`SELECT value FROM settings WHERE key = 'admin_password'`);
     if (!setting || setting.value !== password) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     
     // Get the photos to delete them from physical disk
     const capture = await db.get('SELECT photos FROM captures WHERE id = ?', [id]);
     if (capture && capture.photos) {
        const photoPaths = JSON.parse(capture.photos);
        photoPaths.forEach(photoUrl => {
            // Convert public URL like /captures/filename to physical path
            if (photoUrl.startsWith('/captures/')) {
               const fileName = photoUrl.replace('/captures/', '');
               const physicalPath = path.join(process.cwd(), 'public', 'captures', fileName);
               if (fs.existsSync(physicalPath)) {
                  fs.unlinkSync(physicalPath);
               }
            }
        });
     }

     // Remove from DB
     await db.run('DELETE FROM captures WHERE id = ?', [id]);
     
     return NextResponse.json({ success: true });
  } catch (error) {
     console.error('Error deleting capture:', error);
     return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
