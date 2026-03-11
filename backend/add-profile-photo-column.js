import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'fahamu_shamba.db'));

console.log('Adding profile_photo column to users table...');

try {
  // Check if column exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasColumn = tableInfo.some(col => col.name === 'profile_photo');
  
  if (hasColumn) {
    console.log('✅ profile_photo column already exists');
  } else {
    // Add profile_photo column
    db.prepare('ALTER TABLE users ADD COLUMN profile_photo TEXT').run();
    console.log('✅ profile_photo column added successfully');
  }
  
  // Check users table
  const users = db.prepare('SELECT id, username, name, profile_photo FROM users LIMIT 5').all();
  console.log('\nSample users:');
  console.table(users);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

db.close();
console.log('\n✅ Migration complete!');
