/**
 * Add preferred_language column to users table for multilingual support
 * Run: node backend/migrate-add-language-preference.js
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function addLanguagePreference(db) {
  try {
    console.log('🔧 Adding language preference to users table...');

    // Check if column already exists
    const userColumns = db.prepare(`PRAGMA table_info(users)`).all().map(col => col.name);
    
    if (userColumns.includes('preferred_language')) {
      console.log('ℹ️  preferred_language column already exists');
      return true;
    }

    // Add preferred_language column with default 'english'
    db.exec(`
      ALTER TABLE users ADD COLUMN preferred_language VARCHAR(20) DEFAULT 'english';
    `);

    // Create index for faster queries
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_language ON users(preferred_language);
    `);

    console.log('✅ Language preference column added successfully');
    return true;
  } catch (error) {
    console.error('❌ Error adding language preference:', error);
    throw error;
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dbPath = path.join(__dirname, 'fahamu_shamba.db');
  const db = new Database(dbPath);
  
  try {
    addLanguagePreference(db);
    console.log('✅ Migration complete');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

export default addLanguagePreference;
