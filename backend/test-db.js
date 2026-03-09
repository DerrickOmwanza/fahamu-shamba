import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databasePath = path.join(__dirname, 'fahamu_shamba.db');

console.log('Testing database connection...');
console.log('Database path:', databasePath);

try {
  const db = new Database(databasePath, {});
  console.log('✅ Database connection successful');
  db.close();
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  console.error('Error stack:', error.stack);
}