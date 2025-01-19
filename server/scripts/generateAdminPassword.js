import AdminUser from '../models/adminUser.js';
import { randomBytes } from 'crypto';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';
import { argv, exit } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const generatePasswordHash = async () => {
  const password = argv[2];
  
  if (!password) {
    console.error('Please provide a password as an argument');
    exit(1);
  }

  try {
    const hashedPassword = await AdminUser.hashPassword(password);
    console.log('\nAdd these to your .env file:\n');
    console.log(`ADMIN_PASSWORD_HASH=${hashedPassword}`);
    console.log(`JWT_SECRET=${randomBytes(64).toString('hex')}`);
  } catch (error) {
    console.error('Error generating password hash:', error);
    exit(1);
  }
};

generatePasswordHash();
