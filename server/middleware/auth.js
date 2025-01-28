/* eslint-disable no-undef */
import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  console.log('Auth middleware - Request received:', {
    path: req.path,
    method: req.method,
    headers: req.headers,
  });

  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token verified successfully');

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};
