/**
 * Verify that market data was seeded successfully
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

console.log('📁 Loading env from:', envPath);
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not set');
  process.exit(1);
}

const { Pool } = pg;

// Create a fresh pool just for this query
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  try {
    console.log('🔍 Verifying market data in PostgreSQL...\n');

    // Check market_prices table
    const pricesResult = await pool.query('SELECT COUNT(*) as count FROM market_prices');
    const priceCount = pricesResult.rows[0].count;
    console.log(`✅ Market prices in database: ${priceCount}`);

    if (priceCount === 0) {
      console.log('⚠️  No market prices found - seed may not have worked');
    } else {
      console.log(`✅ GOOD! Expected ~50 prices, found ${priceCount}`);
    }

    // Check market_centers table
    const centersResult = await pool.query('SELECT COUNT(*) as count FROM market_centers');
    const centerCount = centersResult.rows[0].count;
    console.log(`✅ Market centers in database: ${centerCount}`);

    if (centerCount === 0) {
      console.log('⚠️  No market centers found - seed may not have worked');
    } else {
      console.log(`✅ GOOD! Expected 7 markets, found ${centerCount}`);
    }

    // Show sample data
    const sampleResult = await pool.query(
      'SELECT DISTINCT crop FROM market_prices LIMIT 5'
    );
    if (sampleResult.rows.length > 0) {
      console.log(`\n📊 Sample crops in database:`);
      sampleResult.rows.forEach(row => {
        console.log(`   - ${row.crop}`);
      });
    }

    console.log('\n✅ Database verification complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verify();
