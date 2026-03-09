#!/usr/bin/env node
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const dbPath = path.join(__dirname, 'fahamu_shamba.db');
  const db = new Database(dbPath, { readonly: true });

  // Check if auth tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'farms')").all();
  console.log('Tables found:', tables.map(t => t.name).join(', '));
  
  // Check if there are any users
  const users = db.prepare('SELECT id, phone, username FROM users').all();
  console.log('\nTotal users in database:', users.length);
  if (users.length > 0) {
    console.log('\nFirst 5 users:');
    users.slice(0, 5).forEach(u => {
      console.log(`  ID: ${u.id}, Username: ${u.username}, Phone: ${u.phone}`);
    });
  } else {
    console.log('\n❌ NO USERS IN DATABASE - This is the problem!');
  }
} catch (error) {
  console.error('Error:', error.message);
}
