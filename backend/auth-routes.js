import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Initialize auth routes with database instance
export function initAuthRoutes(db) {
  const JWT_SECRET = process.env.JWT_SECRET || 'farmer_secret_key_change_in_production';

  // Helper: Hash password
  const hashPassword = async (password) => {
    return await bcryptjs.hash(password, 10);
  };

  // Helper: Verify password
  const verifyPassword = async (password, hash) => {
    return await bcryptjs.compare(password, hash);
  };

  // Helper: Generate JWT token
  const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  };

  // Helper: Validate phone format
  const isValidPhone = (phone) => {
    const phoneRegex = /^\+?254[0-9]{9}$/; // E.164: +2547XXXXXXXX or 2547XXXXXXXX
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Helper: Validate password strength
  const isStrongPassword = (password) => {
    return password.length >= 6; // Minimum 6 chars for MVP
  };

  // POST /api/auth/register - Step 1: Phone + Password
  router.post('/register', async (req, res) => {
    try {
      const { phone, password } = req.body;

      // Validate input
      if (!phone || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Phone and password are required'
        });
      }

      if (!isValidPhone(phone)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid phone format. Use: +2547XXXXXXXX or 2547XXXXXXXX'
        });
      }

      if (!isStrongPassword(password)) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters'
        });
      }

      // Check if phone already exists
      const stmt = db.prepare('SELECT id FROM users WHERE phone = ?');
      const existingUser = stmt.get(phone);

      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Phone number already registered'
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const insertStmt = db.prepare(
        'INSERT INTO users (phone, password_hash, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
      );
      const result = insertStmt.run(phone, passwordHash);

      res.status(201).json({
        status: 'success',
        message: 'Step 1 complete. Proceed to profile setup.',
        userId: result.lastInsertRowid
      });
    } catch (error) {
      console.error('Registration Step 1 error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Registration failed. Please try again.'
      });
    }
  });

  // POST /api/auth/register-profile - Step 2: Profile Details
  router.post('/register-profile', async (req, res) => {
    try {
      const { userId, name, location, ward, farm_size, farm_size_unit = 'acres' } = req.body;

      // Validate input
      if (!userId || !name || !location) {
        return res.status(400).json({
          status: 'error',
          message: 'userId, name, and location are required'
        });
      }

      // Verify user exists
      const userStmt = db.prepare('SELECT id FROM users WHERE id = ?');
      const user = userStmt.get(userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Create farm profile
      const farmStmt = db.prepare(
        'INSERT INTO farms (user_id, location, ward, farm_size, farm_size_unit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)'
      );
      const farmResult = farmStmt.run(userId, location, ward || null, farm_size || null, farm_size_unit);

      // Update user name
      const updateStmt = db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      updateStmt.run(name, userId);

      // Generate JWT token
      const token = generateToken(userId);

      // Fetch updated user
      const getUserStmt = db.prepare('SELECT id, phone, name FROM users WHERE id = ?');
      const updatedUser = getUserStmt.get(userId);

      res.status(201).json({
        status: 'success',
        message: 'Account created successfully',
        token,
        user: {
          id: updatedUser.id,
          phone: updatedUser.phone,
          name: updatedUser.name,
          location,
          ward: ward || null,
          farm_size: farm_size || null,
          farm_size_unit: farm_size_unit || 'acres'
        }
      });
    } catch (error) {
      console.error('Registration Step 2 error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Profile setup failed. Please try again.'
      });
    }
  });

  // POST /api/auth/login
  router.post('/login', async (req, res) => {
    try {
      const { phone, password } = req.body;

      // Validate input
      if (!phone || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Phone and password are required'
        });
      }

      // Find user
      const stmt = db.prepare('SELECT id, phone, password_hash, name FROM users WHERE phone = ?');
      const user = stmt.get(phone);

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid phone or password'
        });
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid phone or password'
        });
      }

      // Generate token
      const token = generateToken(user.id);

      // Fetch farm profile
      const farmStmt = db.prepare('SELECT location, ward, farm_size, farm_size_unit FROM farms WHERE user_id = ?');
      const farm = farmStmt.get(user.id);

      res.json({
        status: 'success',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          location: farm ? farm.location : null,
          ward: farm ? farm.ward : null,
          farm_size: farm ? farm.farm_size : null,
          farm_size_unit: farm ? farm.farm_size_unit : 'acres'
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Login failed. Please try again.'
      });
    }
  });

  // Middleware: Verify JWT token
  router.use((req, res, next) => {
    req.verifyToken = (token) => {
      try {
        return jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return null;
      }
    };
    next();
  });

  // GET /api/auth/user - Fetch current user (requires token in Authorization header)
  router.get('/user', (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          status: 'error',
          message: 'No token provided'
        });
      }

      const decoded = req.verifyToken(token);

      if (!decoded) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid or expired token'
        });
      }

      const userStmt = db.prepare('SELECT id, phone, name FROM users WHERE id = ?');
      const user = userStmt.get(decoded.userId);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      const farmStmt = db.prepare('SELECT location, ward, farm_size, farm_size_unit FROM farms WHERE user_id = ?');
      const farm = farmStmt.get(user.id);

      res.json({
        status: 'success',
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          location: farm ? farm.location : null,
          ward: farm ? farm.ward : null,
          farm_size: farm ? farm.farm_size : null,
          farm_size_unit: farm ? farm.farm_size_unit : 'acres'
        }
      });
    } catch (error) {
      console.error('Fetch user error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch user'
      });
    }
  });

  // POST /api/auth/logout
  router.post('/logout', (req, res) => {
    // JWT is stateless; client should discard token
    res.json({
      status: 'success',
      message: 'Logged out. Please discard your token.'
    });
  });

  return router;
}

export default router;
