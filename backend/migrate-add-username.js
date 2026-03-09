/**
 * Migration script to add username column to users table
 * Run: node migrate-add-username.js
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'fahamu_shamba.db');
const db = new Database(dbPath);

console.log('🔧 Running username migration...\n');

try {
    // Check if username column exists
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasUsername = tableInfo.some(col => col.name === 'username');
    
    if (!hasUsername) {
        console.log('➕ Adding username column to users table...');
        db.exec(`ALTER TABLE users ADD COLUMN username VARCHAR(50)`);
        console.log('✅ Username column added!');
    } else {
        console.log('ℹ️  Username column already exists');
    }
    
    // Also add index
    console.log('➕ Creating username index...');
    db.exec(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    console.log('✅ Index created!');
    
    // Verify
    const newTableInfo = db.prepare("PRAGMA table_info(users)").all();
    console.log('\n📋 Updated table schema:');
    newTableInfo.forEach(col => {
        console.log(`  ${col.name}: ${col.type}`);
    });
    
    console.log('\n✅ Migration complete!');
    
} catch (error) {
    console.error('❌ Migration failed:', error.message);
} finally {
    db.close();
}

