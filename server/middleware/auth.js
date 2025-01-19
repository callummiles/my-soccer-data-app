/* eslint-disable no-undef */
import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log(
      'Auth middleware - JWT_SECRET exists:',
      !!process.env.JWT_SECRET
    );
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decoded successfully:', {
      username: decoded.username,
    });
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware - Error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};
