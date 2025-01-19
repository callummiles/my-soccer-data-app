import jwt from 'jsonwebtoken';
import AdminUser from '../models/adminUser.js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';
import { env } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

// In a real application, you would store this in a database
const ADMIN_USERNAME = env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = env.ADMIN_PASSWORD_HASH;

export const login = async (req, res) => {
  try {
    console.log('Login attempt - Request body:', req.body);
    console.log('Login attempt - Environment variables present:', {
      adminUsername: !!ADMIN_USERNAME,
      adminPasswordHash: !!ADMIN_PASSWORD_HASH,
      jwtSecret: !!env.JWT_SECRET
    });

    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Login attempt - Missing credentials');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    console.log('Login attempt - Comparing credentials:', {
      providedUsername: username,
      expectedUsername: ADMIN_USERNAME,
      hasPasswordHash: !!ADMIN_PASSWORD_HASH
    });

    if (username !== ADMIN_USERNAME) {
      console.log('Login attempt - Username mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await AdminUser.comparePassword(password, ADMIN_PASSWORD_HASH);
    console.log('Login attempt - Password validation result:', { isValid: isValidPassword });
    
    if (!isValidPassword) {
      console.log('Login attempt - Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login attempt - Creating JWT token');
    const token = jwt.sign(
      { username },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login attempt - Success, returning token');
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
