/**
 * Find user by partial phone match
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'fahamu_shamba.db');
const db = new Database(dbPath);

// Your phone: 0798989898 → 254798989898
const searchPhone = '254798989898';

console.log('🔍 Searching for users with phone containing "798989898"...\n');

const users = db.prepare(`
    SELECT id, phone, username, name 
    FROM users 
    WHERE phone LIKE ? OR phone LIKE ?
`).all(`%${searchPhone}%`, `%798989898%`);

if (users.length > 0) {
    console.log(`✅ Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
        console.log(`--- User ${index + 1} ---`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Phone: ${user.phone}`);
        console.log(`  Username: ${user.username || 'NULL'}`);
        console.log(`  Name: ${user.name || 'NULL'}`);
        console.log('');
    });
} else {
    console.log('❌ No users found with that phone number');
    console.log('\n📱 All phones in database:');
    const allPhones = db.prepare('SELECT phone, username, name FROM users').all();
    allPhones.forEach(u => {
        console.log(`  - "${u.phone}" (username: ${u.username}, name: ${u.name})`);
    });
}

db.close();

