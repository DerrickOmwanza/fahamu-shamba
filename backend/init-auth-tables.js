/**
 * Initialize authentication tables in SQLite database
 * Run this once before starting the server
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initializeAuthTables(db) {
  try {
    console.log('🔧 Initializing authentication tables...');

    // Check if users table exists and get its columns
    let userColumns = [];
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `).get();

    if (tableExists) {
      // Table exists, get its columns for migration
      userColumns = db.prepare(`PRAGMA table_info(users)`).all().map(col => col.name);
      console.log('ℹ️  users table already exists with columns:', userColumns.join(', '));
    } else {
      // Create users table with all columns
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone VARCHAR(20) UNIQUE NOT NULL,
          username VARCHAR(50) UNIQUE COLLATE NOCASE,
          password_hash VARCHAR(255),
          name VARCHAR(100),
          email VARCHAR(100),
          preferred_language VARCHAR(20) DEFAULT 'english',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1
        );
      `);
      console.log('✅ users table created');
      userColumns = ['id', 'phone', 'username', 'password_hash', 'name', 'email', 'preferred_language', 'created_at', 'updated_at', 'is_active'];
    }

    // Backward-compatible migration: Add missing columns to existing users table
    // Add username column if it doesn't exist
    if (!userColumns.includes('username')) {
      try {
        db.exec(`ALTER TABLE users ADD COLUMN username VARCHAR(50);`);
        console.log('✅ Added username column to existing users table');
      } catch (e) {
        console.log('⚠️  Could not add username column:', e.message);
      }
    }

    // Add preferred_language column if it doesn't exist
    if (!userColumns.includes('preferred_language')) {
      try {
        db.exec(`ALTER TABLE users ADD COLUMN preferred_language VARCHAR(20) DEFAULT 'english';`);
        console.log('✅ Added preferred_language column to existing users table');
      } catch (e) {
        console.log('⚠️  Could not add preferred_language column:', e.message);
      }
    }

    // Create indexes (use IF NOT EXISTS to handle existing indexes)
    try {
      db.exec(`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_users_language ON users(preferred_language);`);
      console.log('✅ User indexes created');
    } catch (e) {
      console.log('⚠️  Index creation note:', e.message);
    }

    console.log('✅ users table ready');

    // Create farms table
    db.exec(`
      CREATE TABLE IF NOT EXISTS farms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        location VARCHAR(100),
        ward VARCHAR(100),
        farm_size DECIMAL(10, 2),
        farm_size_unit VARCHAR(20) DEFAULT 'acres',
        soil_type VARCHAR(50),
        water_source VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create index on user_id for fast lookups
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
    `);

    console.log('✅ farms table created');

    // Create locations lookup table
    db.exec(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        county VARCHAR(50) NOT NULL,
        ward VARCHAR(50) NOT NULL,
        UNIQUE(county, ward)
      );
    `);

    console.log('✅ locations table created');

    // Populate locations (if not already populated)
    const checkLocations = db.prepare('SELECT COUNT(*) as count FROM locations');
    const locationCount = checkLocations.get().count;

    if (locationCount === 0) {
      const insertLocation = db.prepare('INSERT INTO locations (county, ward) VALUES (?, ?)');

      const locations = [
        ['Siaya', 'West Gem'],
        ['Siaya', 'East Gem'],
        ['Siaya', 'Alego Usonga'],
        ['Siaya', 'Rarieda'],
        ['Siaya', 'Ugunja'],
        ['Siaya', 'Yimbo'],
        ['Siaya', 'Bondo'],
        ['Kisumu', 'Nyando'],
        ['Kisumu', 'Muhoroni'],
        ['Kisumu', 'Kisumu West'],
        ['Kisumu', 'Kisumu East'],
        ['Kisumu', 'Kisumu Central'],
        ['Kisumu', 'Seme']
      ];

      locations.forEach(([county, ward]) => {
        insertLocation.run(county, ward);
      });

      console.log(`✅ Populated ${locations.length} locations`);
    }

    // Create sessions table (optional, for token tracking)
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_jti VARCHAR(255) UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_jti ON sessions(token_jti);
    `);

    console.log('✅ sessions table created');

    console.log('✅ All authentication tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing auth tables:', error);
    throw error;
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const dbPath = path.join(__dirname, 'fahamu_shamba.db');
  const db = new Database(dbPath);
  
  try {
    initializeAuthTables(db);
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

export default initializeAuthTables;
