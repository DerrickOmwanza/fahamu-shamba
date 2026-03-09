#!/usr/bin/env node
const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(__dirname, 'backend', 'fahamu_shamba.db');
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
