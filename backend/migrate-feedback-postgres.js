/**
 * PostgreSQL Migration Script for Feedback Tables
 * Run this to create all feedback-related tables in PostgreSQL (Neon)
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_C6XhoH8ZljQA@ep-hidden-cake-ad0a77ly-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateFeedbackTables() {
  const client = await pool.connect();
  
  try {
    console.log('🗄️  Starting PostgreSQL Feedback Tables Migration...\n');
    
    // 1. Enhanced feedback table
    console.log('📝 Creating enhanced_feedback table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS enhanced_feedback (
        id SERIAL PRIMARY KEY,
        prediction_id INTEGER,
        phone_number TEXT,
        crop_recommended TEXT DEFAULT NULL,
        crop_planted TEXT,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        was_helpful BOOLEAN,
        yield_achieved TEXT,
        yield_unit TEXT DEFAULT 'kg',
        cultivation_period TEXT,
        challenges TEXT,
        suggestions TEXT,
        would_recommend BOOLEAN,
        feedback_type TEXT DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ enhanced_feedback table created\n');
    
    // 2. Rating history table
    console.log('📝 Creating rating_history table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS rating_history (
        id SERIAL PRIMARY KEY,
        prediction_id INTEGER,
        phone_number TEXT,
        crop TEXT NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        sub_county TEXT,
        soil_type TEXT,
        season TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ rating_history table created\n');
    
    // 3. Yield records table
    console.log('📝 Creating yield_records table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS yield_records (
        id SERIAL PRIMARY KEY,
        phone_number TEXT NOT NULL,
        crop TEXT NOT NULL,
        sub_county TEXT,
        soil_type TEXT,
        season TEXT,
        yield_amount REAL,
        yield_unit TEXT DEFAULT 'kg',
        farm_size REAL,
        inputs_used TEXT,
        notes TEXT,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ yield_records table created\n');
    
    // 4. Feedback analytics table
    console.log('📝 Creating feedback_analytics table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback_analytics (
        id SERIAL PRIMARY KEY,
        crop TEXT NOT NULL,
        sub_county TEXT,
        total_ratings INTEGER DEFAULT 0,
        avg_rating REAL DEFAULT 0,
        positive_count INTEGER DEFAULT 0,
        negative_count INTEGER DEFAULT 0,
        yield_reports INTEGER DEFAULT 0,
        avg_yield REAL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(crop, sub_county)
      )
    `);
    console.log('✅ feedback_analytics table created\n');
    
    // 5. Price alerts table
    console.log('📝 Creating price_alerts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS price_alerts (
        id SERIAL PRIMARY KEY,
        phone_number TEXT NOT NULL,
        crop TEXT NOT NULL,
        threshold_type TEXT DEFAULT 'above',
        threshold_price REAL,
        notify_sms BOOLEAN DEFAULT TRUE,
        notify_push BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ price_alerts table created\n');
    
    // Create indexes
    console.log('📊 Creating indexes...');
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_feedback_phone ON enhanced_feedback(phone_number)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_feedback_crop ON enhanced_feedback(crop_recommended)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_feedback_created ON enhanced_feedback(created_at)`);
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rating_crop ON rating_history(crop)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rating_phone ON rating_history(phone_number)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_rating_created ON rating_history(created_at)`);
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_yields_phone ON yield_records(phone_number)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_yields_crop ON yield_records(crop)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_yields_recorded ON yield_records(recorded_at)`);
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_price_alerts_phone ON price_alerts(phone_number)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active)`);
    
    console.log('✅ All indexes created\n');
    
    // Verify tables
    console.log('🔍 Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'enhanced_feedback', 
        'rating_history', 
        'yield_records', 
        'feedback_analytics', 
        'price_alerts'
      )
      ORDER BY table_name
    `);
    
    console.log('✅ Tables found:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    console.log('\n🎉 Feedback tables migration completed successfully!');
    console.log('📊 Total tables created: 5');
    console.log('📈 Total indexes created: 10\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateFeedbackTables()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
