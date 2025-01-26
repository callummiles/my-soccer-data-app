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
    const { username, password } = req.body;

    console.log('Login attempt with username:', username);
    console.log('Environment variables:', {
      ADMIN_USERNAME: env.ADMIN_USERNAME,
      HAS_PASSWORD_HASH: !!env.ADMIN_PASSWORD_HASH,
      PASSWORD_HASH_LENGTH: env.ADMIN_PASSWORD_HASH
        ? env.ADMIN_PASSWORD_HASH.length
        : 0,
    });

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username and password are required' });
    }

    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(
      'About to compare password with hash. Hash exists:',
      !!ADMIN_PASSWORD_HASH
    );
    const isValidPassword = await AdminUser.comparePassword(
      password,
      ADMIN_PASSWORD_HASH
    );

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
