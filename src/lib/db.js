import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export async function openDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'local_data.sqlite'),
      driver: sqlite3.Database
    });

    // Initialize tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS links (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS captures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link_id TEXT,
        user_name TEXT,
        crush_name TEXT,
        photos TEXT,
        percentage INTEGER,
        captured_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // Migration: Add percentage column if it doesn't exist in captures
    try {
      await db.exec(`ALTER TABLE captures ADD COLUMN percentage INTEGER`);
    } catch (e) {
      // Column already exists or table doesn't exist yet (handled by CREATE TABLE)
    }

    // Seed default admin password if not already set
    await db.run(
      `INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', '@Praveen123')`
    );
  }
  return db;
}
