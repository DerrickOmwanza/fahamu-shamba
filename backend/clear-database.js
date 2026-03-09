/**
 * Clear all users and farms from the database
 * WARNING: This deletes all user data
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'fahamu_shamba.db');
const db = new Database(dbPath);

console.log('⚠️  WARNING: This will delete ALL users and farms\n');

try {
  // Delete all farms first (foreign key constraint)
  const farmsDeleted = db.prepare('DELETE FROM farms').run().changes;
  console.log(`🗑️  Deleted ${farmsDeleted} farm records`);

  // Delete all users
  const usersDeleted = db.prepare('DELETE FROM users').run().changes;
  console.log(`🗑️  Deleted ${usersDeleted} user records`);

  // Delete all sessions
  const sessionsDeleted = db.prepare('DELETE FROM sessions').run().changes;
  console.log(`🗑️  Deleted ${sessionsDeleted} session records`);

  console.log('\n✅ Database cleared successfully');
  
  // Verify it's empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const farmCount = db.prepare('SELECT COUNT(*) as count FROM farms').get().count;
  
  console.log(`\nVerification:`);
  console.log(`  Users: ${userCount}`);
  console.log(`  Farms: ${farmCount}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  db.close();
}
