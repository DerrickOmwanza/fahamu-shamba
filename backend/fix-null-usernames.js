/**
 * Migrate NULL usernames to be based on phone number
 * Converts phone +254712345678 -> username: farmer_254712345678
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'fahamu_shamba.db');
const db = new Database(dbPath);

console.log('🔧 Fixing NULL usernames...\n');

// Get all users with NULL username
const usersWithNullUsername = db.prepare('SELECT id, phone, username FROM users WHERE username IS NULL').all();

console.log(`Found ${usersWithNullUsername.length} users with NULL username\n`);

if (usersWithNullUsername.length === 0) {
  console.log('✅ No users to fix');
  db.close();
  process.exit(0);
}

const updateStmt = db.prepare('UPDATE users SET username = ? WHERE id = ?');

usersWithNullUsername.forEach((user) => {
  // Generate username from phone: remove + and use "farmer_" prefix
  const phoneDigits = user.phone.replace(/\D/g, ''); // Remove all non-digits
  const newUsername = `farmer_${phoneDigits}`.toLowerCase();
  
  try {
    updateStmt.run(newUsername, user.id);
    console.log(`✅ User ${user.id} (${user.phone}): username set to "${newUsername}"`);
  } catch (error) {
    console.log(`❌ User ${user.id} (${user.phone}): ERROR - ${error.message}`);
  }
});

console.log('\n🔍 Verifying updates...\n');

const updatedUsers = db.prepare('SELECT id, phone, username FROM users').all();
updatedUsers.forEach((user) => {
  console.log(`User ${user.id}: phone=${user.phone}, username=${user.username}`);
});

db.close();
console.log('\n✅ Migration complete');
