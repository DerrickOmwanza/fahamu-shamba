/**
 * Test PostgreSQL connection
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from .env.local first
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Then load from .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('DATABASE_URL set:', process.env.DATABASE_URL ? 'YES' : 'NO');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not found');
  process.exit(1);
}

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    console.log('🔍 Testing connection...');
    const result = await pool.query('SELECT COUNT(*) as count FROM market_prices');
    console.log('✅ Connection successful');
    console.log('✅ Market prices in database:', result.rows[0].count);
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

test();
