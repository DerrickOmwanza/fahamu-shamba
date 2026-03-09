/**
 * Debug script to check user credentials in database
 * Run: node debug-user.js
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'fahamu_shamba.db');
const db = new Database(dbPath);

console.log('🔍 Checking users table schema...\n');

// Check table schema
const tableInfo = db.prepare("PRAGMA table_info(users)").all();
console.log('Table columns:');
tableInfo.forEach(col => {
    console.log(`  ${col.name}: ${col.type}`);
});

console.log('\n🔍 Checking users in database...\n');

// Get all users - handle both old and new schema
let users;
try {
    users = db.prepare('SELECT id, phone, username, password_hash, name FROM users').all();
} catch(e) {
    // Try without username column (old schema)
    users = db.prepare('SELECT id, phone, password_hash, name FROM users').all();
    console.log('⚠️  Using old schema (no username column)\n');
}

if (users.length === 0) {
    console.log('❌ No users found in database!');
} else {
    console.log(`✅ Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
        console.log(`--- User ${index + 1} ---`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Phone: ${user.phone}`);
        console.log(`  Username: ${user.username || 'N/A'}`);
        console.log(`  Name: ${user.name || 'N/A'}`);
        console.log(`  Password Hash: ${user.password_hash?.substring(0, 30)}...`);
        console.log('');
    });
    
    // Test login with specific credentials
    console.log('🧪 Testing login simulation...\n');
    
    const testUsername = 'Saka';
    const testPassword = '258000';
    
    let user;
    try {
        user = db.prepare('SELECT * FROM users WHERE username = ? OR phone = ?').get(testUsername, testUsername);
    } catch(e) {
        // Try phone only for old schema
        user = db.prepare('SELECT * FROM users WHERE phone = ?').get(testUsername);
    }
    
    if (user) {
        console.log(`✅ User found: ${user.username || 'N/A'} (phone: ${user.phone})`);
        
        // Test password
        const isValid = bcryptjs.compare(testPassword, user.password_hash);
        console.log(`🔐 Password verification: ${isValid ? 'SUCCESS ✅' : 'FAILED ❌'}`);
        
        if (!isValid) {
            console.log(`   Stored hash: ${user.password_hash}`);
            console.log(`   Input password: ${testPassword}`);
        }
    } else {
        console.log(`❌ User not found with username/phone: ${testUsername}`);
        
        // Show all users to help debug
        console.log('\n   All users in database:');
        users.forEach(u => {
            console.log(`   - username: "${u.username}", phone: "${u.phone}"`);
        });
    }
}

db.close();

