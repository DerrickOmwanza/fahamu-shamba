# Farmer Authentication & Profile Database Schema

## Overview
Lean, farmer-focused schema optimized for MVP. Phone number is the primary identifier.

---

## Table: users

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_phone ON users(phone);
```

**Fields:**
- `id`: Unique user identifier (internal).
- `phone`: Primary identifier (E.164 format: +2547XXXXXXXX).
- `password_hash`: Bcrypt-hashed password.
- `name`: Farmer's full name.
- `email`: Optional, for password reset.
- `created_at`, `updated_at`: Timestamps.
- `is_active`: Soft delete flag.

---

## Table: farms

```sql
CREATE TABLE farms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  location VARCHAR(100),
  ward VARCHAR(100),
  farm_size DECIMAL(10, 2),
  farm_size_unit VARCHAR(20) DEFAULT 'acres',
  soil_type VARCHAR(50),
  water_source VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id ON farms(user_id);
```

**Fields:**
- `user_id`: Links to user.
- `location`: County (e.g., Siaya).
- `ward`: Sub-county ward.
- `farm_size`: Numeric size (e.g., 2.5 acres).
- `farm_size_unit`: Unit of measurement (acres, hectares).
- `soil_type`, `water_source`: Optional, gathered later during onboarding.

---

## Table: farm_crops (Optional, gathered later)

```sql
CREATE TABLE farm_crops (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farm_id INT NOT NULL,
  crop_name VARCHAR(50),
  planting_date DATE,
  expected_harvest_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);
```

**Purpose:** Track crops per farm (gathered post-registration during onboarding).

---

## Table: sessions (JWT Token Tracking - Optional)

```sql
CREATE TABLE sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_jti VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_id ON sessions(user_id);
CREATE INDEX idx_jti ON sessions(token_jti);
```

**Purpose:** Track active sessions for logout/token invalidation (optional, can implement later).

---

## Initial Data Setup

```sql
-- No default data needed; users create their own accounts.
-- Populate locations (counties/wards) if using dropdowns:

CREATE TABLE locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  county VARCHAR(50) NOT NULL,
  ward VARCHAR(50) NOT NULL,
  UNIQUE KEY (county, ward)
);

INSERT INTO locations (county, ward) VALUES
('Siaya', 'West Gem'),
('Siaya', 'East Gem'),
('Siaya', 'Alego Usonga'),
('Siaya', 'Rarieda'),
('Siaya', 'Ugunja'),
('Siaya', 'Yimbo'),
('Siaya', 'Bondo');
-- Add more counties/wards as needed.
```

---

## API-to-Database Mapping

### POST /api/auth/register (Step 1)
- Create record in `users` table.
- Hash password with Bcrypt (10 rounds).

### POST /api/auth/register (Step 2)
- Create record in `farms` table linked to `user_id`.

### POST /api/auth/login
- Query `users` by phone.
- Validate password hash.
- Generate JWT token (store in `sessions` if tracking tokens).

### PUT /api/user/profile
- Update `farms` table (soil type, water source, etc.).
- Or create records in `farm_crops` for crop tracking.

---

## Security Notes

1. **Password Hashing**: Use Bcrypt (Node.js: `bcryptjs` package).
2. **Phone Validation**: Validate E.164 format (e.g., +2547XXXXXXXX).
3. **JWT Secret**: Store in environment variables, not hardcoded.
4. **SQL Injection Prevention**: Use parameterized queries (prepared statements).
5. **Rate Limiting**: Implement on login endpoint (prevent brute force).

---

## Performance Optimizations

- Index on `users.phone` for fast login lookups.
- Index on `farms.user_id` for fast farm retrieval.
- Keep `users` table lean; optional profile fields stored in `farms`.
- Use connection pooling for database queries.

---

## Future Extensions (Not MVP)

- `notifications` table for alerts.
- `orders` table for farm inputs (if marketplace feature added).
- `weather_data` table for location-based weather (if weather feature added).
- `farm_inputs` table for purchased/used inputs tracking.

---

## Summary

This schema is **minimal, lean, and farmer-focused**:
- Phone-first authentication.
- Separate `farms` table for profile data (keeps `users` clean).
- Optional tables for features added post-MVP.
- Ready for Bcrypt hashing and JWT tokens.
