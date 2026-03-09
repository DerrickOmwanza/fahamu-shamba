/**
 * Find all users and test login
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'fahamu_shamba.db');
const db = new Database(dbPath);

console.log('🔍 All users in database:\n');

const users = db.prepare('SELECT id, phone, username, name, created_at FROM users ORDER BY id DESC').all();

console.log(`Total users: ${users.length}\n`);
users.forEach((user, index) => {
    console.log(`User ${index + 1}:`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Phone: ${user.phone}`);
    console.log(`  Username: ${user.username}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Created: ${user.created_at}`);
    console.log('');
});

// Test password for user with name "Bukayo Saka" or similar
console.log('🧪 Testing password for user ID 3 (DERRICK OMWANZA):');
const user3 = db.prepare('SELECT * FROM users WHERE id = 3').get();
if (user3) {
    const testPassword = '258000';
    const isValid = bcryptjs.compare(testPassword, user3.password_hash);
    console.log(`  Password "258000": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
}

db.close();

