/**
 * Quick script to seed ONLY the market prices (tables already exist)
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not set');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedPricesOnly() {
  try {
    console.log('🌱 Seeding market prices...');

    const prices = [
      // Alego Usonga (Siaya Town)
      { crop: 'Maize', market: 'Siaya Town Market', price: 65, unit: 'kg' },
      { crop: 'Beans', market: 'Siaya Town Market', price: 85, unit: 'kg' },
      { crop: 'Cowpeas', market: 'Siaya Town Market', price: 70, unit: 'kg' },
      { crop: 'Tomatoes', market: 'Siaya Town Market', price: 75, unit: 'kg' },
      { crop: 'Rice', market: 'Siaya Town Market', price: 120, unit: 'kg' },
      { crop: 'Sorghum', market: 'Siaya Town Market', price: 95, unit: 'kg' },
      { crop: 'Sweet Potatoes', market: 'Siaya Town Market', price: 40, unit: 'kg' },
      { crop: 'Groundnuts', market: 'Siaya Town Market', price: 110, unit: 'kg' },
      { crop: 'Kales', market: 'Siaya Town Market', price: 50, unit: 'kg' },
      { crop: 'Cassava', market: 'Siaya Town Market', price: 35, unit: 'kg' },
      // Bondo
      { crop: 'Sorghum', market: 'Bondo Market', price: 95, unit: 'kg' },
      { crop: 'Cassava', market: 'Bondo Market', price: 35, unit: 'kg' },
      { crop: 'Maize', market: 'Bondo Market', price: 65, unit: 'kg' },
      { crop: 'Beans', market: 'Bondo Market', price: 85, unit: 'kg' },
      { crop: 'Rice', market: 'Bondo Market', price: 120, unit: 'kg' },
      { crop: 'Groundnuts', market: 'Bondo Market', price: 110, unit: 'kg' },
      { crop: 'Tomatoes', market: 'Bondo Market', price: 75, unit: 'kg' },
      { crop: 'Sweet Potatoes', market: 'Bondo Market', price: 40, unit: 'kg' },
      { crop: 'Kales', market: 'Bondo Market', price: 50, unit: 'kg' },
      { crop: 'Cowpeas', market: 'Bondo Market', price: 70, unit: 'kg' },
      // Ugunja (includes Yala Market)
      { crop: 'Rice', market: 'Yala Market', price: 125, unit: 'kg' },
      { crop: 'Vegetables', market: 'Yala Market', price: 45, unit: 'kg' },
      { crop: 'Beans', market: 'Yala Market', price: 88, unit: 'kg' },
      { crop: 'Maize', market: 'Yala Market', price: 62, unit: 'kg' },
      { crop: 'Groundnuts', market: 'Ugunja Market', price: 110, unit: 'kg' },
      { crop: 'Cowpeas', market: 'Ugunja Market', price: 68, unit: 'kg' },
      { crop: 'Maize', market: 'Ugunja Market', price: 68, unit: 'kg' },
      { crop: 'Beans', market: 'Ugunja Market', price: 82, unit: 'kg' },
      { crop: 'Rice', market: 'Ugunja Market', price: 118, unit: 'kg' },
      { crop: 'Sorghum', market: 'Ugunja Market', price: 92, unit: 'kg' },
      // Gem
      { crop: 'Maize', market: 'Gem Market', price: 66, unit: 'kg' },
      { crop: 'Kales', market: 'Gem Market', price: 49, unit: 'kg' },
      { crop: 'Beans', market: 'Gem Market', price: 84, unit: 'kg' },
      { crop: 'Sorghum', market: 'Gem Market', price: 94, unit: 'kg' },
      { crop: 'Rice', market: 'Gem Market', price: 119, unit: 'kg' },
      { crop: 'Groundnuts', market: 'Gem Market', price: 109, unit: 'kg' },
      { crop: 'Cassava', market: 'Gem Market', price: 34, unit: 'kg' },
      { crop: 'Tomatoes', market: 'Gem Market', price: 74, unit: 'kg' },
      { crop: 'Cowpeas', market: 'Gem Market', price: 70, unit: 'kg' },
      { crop: 'Sweet Potatoes', market: 'Gem Market', price: 39, unit: 'kg' },
      // Rarieda
      { crop: 'Maize', market: 'Rarieda Market', price: 63, unit: 'kg' },
      { crop: 'Beans', market: 'Rarieda Market', price: 86, unit: 'kg' },
      { crop: 'Sorghum', market: 'Rarieda Market', price: 97, unit: 'kg' },
      { crop: 'Rice', market: 'Rarieda Market', price: 122, unit: 'kg' },
      { crop: 'Groundnuts', market: 'Rarieda Market', price: 111, unit: 'kg' },
      { crop: 'Tomatoes', market: 'Rarieda Market', price: 76, unit: 'kg' },
      { crop: 'Kales', market: 'Rarieda Market', price: 51, unit: 'kg' },
      { crop: 'Cassava', market: 'Rarieda Market', price: 38, unit: 'kg' },
      { crop: 'Sweet Potatoes', market: 'Rarieda Market', price: 41, unit: 'kg' },
      { crop: 'Cowpeas', market: 'Rarieda Market', price: 70, unit: 'kg' },
      // Ugenya
      { crop: 'Maize', market: 'Ugenya Market', price: 64, unit: 'kg' },
      { crop: 'Beans', market: 'Ugenya Market', price: 83, unit: 'kg' },
      { crop: 'Cassava', market: 'Ugenya Market', price: 38, unit: 'kg' },
      { crop: 'Rice', market: 'Ugenya Market', price: 125, unit: 'kg' },
      { crop: 'Sorghum', market: 'Ugenya Market', price: 98, unit: 'kg' },
      { crop: 'Groundnuts', market: 'Ugenya Market', price: 112, unit: 'kg' },
      { crop: 'Tomatoes', market: 'Ugenya Market', price: 78, unit: 'kg' },
      { crop: 'Kales', market: 'Ugenya Market', price: 52, unit: 'kg' },
      { crop: 'Sweet Potatoes', market: 'Ugenya Market', price: 42, unit: 'kg' },
      { crop: 'Cowpeas', market: 'Ugenya Market', price: 70, unit: 'kg' }
    ];

    let inserted = 0;
    for (const p of prices) {
      try {
        await pool.query(
          `INSERT INTO market_prices (crop, market, price, unit)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [p.crop, p.market, p.price, p.unit]
        );
        inserted++;
      } catch (err) {
        console.warn(`⚠️  Failed to insert ${p.crop} at ${p.market}: ${err.message}`);
      }
    }

    console.log(`✅ Inserted ${inserted}/${prices.length} market prices`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedPricesOnly();
