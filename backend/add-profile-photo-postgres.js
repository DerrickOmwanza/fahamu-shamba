/**
 * Add profile_photo column to existing PostgreSQL users table
 * Run this on your Vercel PostgreSQL database
 * 
 * Usage: DATABASE_URL="your-postgres-url" node backend/add-profile-photo-postgres.js
 */

import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable not set');
  console.log('\nUsage:');
  console.log('  DATABASE_URL="postgresql://user:pass@host/db" node backend/add-profile-photo-postgres.js');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addProfilePhotoColumn() {
  try {
    console.log('🚀 Adding profile_photo column to users table...\n');
    await client.connect();
    console.log('✅ Connected to PostgreSQL database\n');

    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'profile_photo'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('ℹ️  Column profile_photo already exists in users table');
    } else {
      // Add the column
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN profile_photo TEXT
      `);
      console.log('✅ Column profile_photo added successfully to users table\n');
    }

    // Verify the column exists
    const verify = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('📋 Current users table structure:');
    console.table(verify.rows);

    console.log('\n🎉 Update completed successfully!\n');
    console.log('🔧 Next Steps:');
    console.log('   1. Redeploy your application to Vercel');
    console.log('   2. Test login and profile photo upload');
    console.log('   3. Verify photos persist after logout/login\n');

  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed\n');
  }
}

// Run update
addProfilePhotoColumn().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
