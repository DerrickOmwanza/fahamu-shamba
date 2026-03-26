#!/usr/bin/env node

/**
 * Create or Reset Default Admin User
 * Ensures the admin account uses credentials: cjoarogo@gmail.com / Jemo@721
 * Usage: node create-default-admin.js
 */

import Database from 'better-sqlite3';
import { hashPassword } from './admin-auth.js';
import * as adminDB from './admin-database.js';

let db;

try {
  db = new Database('./fahamu_shamba.db');
} catch (error) {
  console.error('❌ Error opening database:', error.message);
  process.exit(1);
}

const dbAsync = {
  run: async (sql, params = []) => {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return { lastID: result.lastInsertRowid, changes: result.changes };
  },
  get: async (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  }
};

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  🌱 Fahamu Shamba - Default Admin Account Setup        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Initialize database if needed
    adminDB.initializeAdminDatabase(db, dbAsync);

    const email = 'cjoarogo@gmail.com';
    const password = 'Jemo@721';
    const passwordHash = hashPassword(password);

    // Check if admin already exists
    const existingAdmin = await dbAsync.get(
      'SELECT id FROM admin_users WHERE email = ?',
      [email]
    );

    if (existingAdmin) {
      console.log('⚠️  Admin account already exists');
      console.log('⏳ Resetting admin credentials to the requested defaults...\n');

      await dbAsync.run(
        `UPDATE admin_users
         SET password_hash = ?,
             first_name = ?,
             last_name = ?,
             role = ?,
             status = 'active',
             failed_login_attempts = 0,
             updated_at = CURRENT_TIMESTAMP
         WHERE email = ?`,
        [passwordHash, 'System', 'Administrator', 'super_admin', email]
      );

      console.log('✅ Existing admin account updated successfully!\n');
    } else {
      console.log('⏳ Creating default admin account...\n');

      await adminDB.createAdminUser(
        dbAsync,
        email,
        passwordHash,
        'System',
        'Administrator',
        'super_admin',
        'setup-script'
      );

      console.log('✅ Admin account created successfully!\n');
    }
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log(`║  Email:    cjoarogo@gmail.com                          ║`);
    console.log(`║  Password: Jemo@721                                    ║`);
    console.log(`║  Role:     Super Admin (Full Access)                   ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📚 Next Steps:\n');
    console.log('1. Start the server: npm start');
    console.log('2. Open: http://localhost:5000/admin');
    console.log('3. Login with the credentials above');
    console.log('4. Check email for OTP verification code');
    console.log('5. Enter OTP to complete login\n');

    console.log('📧 Email Configuration:\n');
    console.log('The system is configured to send OTP codes via email.');
    console.log('Add these to your .env file for email functionality:\n');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASSWORD=your-app-password\n');
    console.log('Note: Use App Password, not your regular password\n');

    console.log('🔐 Security Reminder:\n');
    console.log('• Change password after first login');
    console.log('• Save the OTP email for authentication');
    console.log('• Keep credentials secure\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();
