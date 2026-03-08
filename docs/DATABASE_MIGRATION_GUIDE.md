# Database Migration Guide - Critical for Production

## ⚠️ Why This Matters

Your backend uses **SQLite** (`backend/fahamu_shamba.db`), which has a critical problem:

- ✅ Works locally on your computer
- ❌ **Does NOT work on Vercel** - files don't persist between deployments
- ❌ Every Vercel update = database wiped
- ❌ All user data lost on each deployment

---

## 🎯 Three Options

### Option 1: MongoDB (RECOMMENDED - Free & Easy)

**Pros:**
- Free tier is generous
- No setup required
- Automatic backups
- Works perfectly on Vercel

**Cons:**
- Need to rewrite database code

**Steps:**

1. Go to https://atlas.mongodb.com and sign up (free)

2. Create a cluster (free tier)

3. Create database user and get connection string like:
   ```
   mongodb+srv://myuser:mypassword@cluster0.mongodb.net/fahamu-shamba?retryWrites=true&w=majority
   ```

4. Add to `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.mongodb.net/fahamu-shamba?retryWrites=true&w=majority
   ```

5. Install MongoDB package:
   ```bash
   cd backend
   npm install mongodb mongoose
   ```

6. Update `backend/server.js` to use MongoDB instead of SQLite

**Example replacement (simplified):**

```javascript
// OLD CODE (SQLite)
import Database from 'better-sqlite3';
const db = new Database('./fahamu_shamba.db');

// NEW CODE (MongoDB)
import { MongoClient } from 'mongodb';
const mongoUrl = process.env.MONGODB_URI;
const client = new MongoClient(mongoUrl);
const db = client.db('fahamu-shamba');
```

---

### Option 2: Vercel PostgreSQL

**Pros:**
- Integrated with Vercel
- Very reliable
- Good for relational data

**Cons:**
- Paid service
- More setup required

**Steps:**

1. In Vercel dashboard, go to your project
2. Integrations → Postgres → Add
3. Get connection URL
4. Install PostgreSQL driver:
   ```bash
   npm install pg
   ```
5. Update `backend/server.js` to use PostgreSQL

---

### Option 3: Keep SQLite + Local Backend

**Pros:**
- No code changes needed
- Data stays on your computer

**Cons:**
- Frontend on Vercel can't reach local backend
- Only works when your computer is on
- Not suitable for production

**How:**
- Deploy backend on your local machine using ngrok or Replit
- Frontend calls the remote backend URL

---

## 🚀 Quick MongoDB Setup (5 minutes)

### Step 1: Create Free MongoDB Account
```
1. Go to https://atlas.mongodb.com
2. Sign up (free)
3. Email verification
4. Create organization
```

### Step 2: Create Free Cluster
```
1. Click "Create Deployment"
2. Select "Shared" (free)
3. Choose AWS region closest to you
4. Click "Create"
5. Wait 1-3 minutes for setup
```

### Step 3: Get Connection String
```
1. Click "Connect"
2. Click "Drivers"
3. Select "Node.js" and "Latest version"
4. Copy connection string
5. Replace <username>, <password>, <database-name>
```

Example:
```
mongodb+srv://admin:MyPassword123@fahamu.abc123.mongodb.net/fahamu-shamba?retryWrites=true&w=majority
```

### Step 4: Add to .env
```
MONGODB_URI=mongodb+srv://admin:MyPassword123@fahamu.abc123.mongodb.net/fahamu-shamba?retryWrites=true&w=majority
```

### Step 5: Install Package
```bash
cd backend
npm install mongodb
```

### Step 6: Update Code

Replace SQLite imports in `backend/server.js`:

```javascript
// Remove this:
// import Database from 'better-sqlite3';

// Add this:
import { MongoClient } from 'mongodb';

// Initialize MongoDB
const mongoUrl = process.env.MONGODB_URI;
const mongoClient = new MongoClient(mongoUrl);
await mongoClient.connect();
const db = mongoClient.db('fahamu-shamba');

// Now use: db.collection('farmers').find(), etc.
```

---

## 📊 Database Schema

Your current SQLite tables (if known):

```
farmers
├── id
├── name
├── email
├── phone
├── village
├── sub_county
├── farm_size
├── crops

users
├── id
├── username
├── email
├── password_hash
├── role
├── created_at

predictions
├── id
├── farmer_id
├── crop
├── confidence
├── date

market_prices
├── id
├── crop
├── price
├── date
├── trend
```

Same schema works in MongoDB.

---

## 🔄 Data Migration from SQLite to MongoDB

If you have existing data:

```javascript
import Database from 'better-sqlite3';
import { MongoClient } from 'mongodb';

const sqlite_db = new Database('./fahamu_shamba.db');
const mongo_url = 'mongodb+srv://...';
const mongoClient = new MongoClient(mongo_url);

await mongoClient.connect();
const mongo_db = mongoClient.db('fahamu-shamba');

// Export SQLite data
const farmers = sqlite_db.prepare('SELECT * FROM farmers').all();
const users = sqlite_db.prepare('SELECT * FROM users').all();

// Import to MongoDB
await mongo_db.collection('farmers').insertMany(farmers);
await mongo_db.collection('users').insertMany(users);

console.log('Migration complete!');
```

---

## ✅ After Migration

1. Remove SQLite dependency:
   ```bash
   npm uninstall better-sqlite3
   ```

2. Update all database queries from SQLite to MongoDB syntax

3. Test locally:
   ```bash
   npm run dev
   ```

4. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

---

## 🚨 DO THIS BEFORE FINAL DEPLOYMENT

You MUST fix the database issue, otherwise:
- All user data lost on each update
- Can't track farmer registrations
- Can't store market prices
- Can't save feedback
- System unusable in production

---

## Timeline

- **Now (Today):** Choose Option 1 (MongoDB) or 3 (Local)
- **Tomorrow:** Migrate database code
- **Next Day:** Test everything
- **Then:** Deploy to Vercel

---

## Help Needed?

Let me know if you need help with:
- [ ] Setting up MongoDB
- [ ] Migrating SQLite code to MongoDB
- [ ] Testing after migration
- [ ] Deploying with new database

