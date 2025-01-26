/* eslint-disable no-undef */
import express from 'express';
import ViteExpress from 'vite-express';
import marketRoutes from './routes/marketRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { auth } from './middleware/auth.js';
import promisedClient from './config/grpcConfig.js';
import { Query } from '@stargate-oss/stargate-grpc-node-client';

import dotenv from 'dotenv';
import cors from 'cors';
import https from 'https';
import fs from 'fs';

dotenv.config();

const app = express();

// Configure CORS with specific origin
const allowedOrigins = [
  'https://my-soccer-data-app.vercel.app',
  'http://localhost:5173',
  'https://server.cwm18.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Auth routes (unprotected)
app.use('/auth', authRoutes);

// Protected routes
app.use(
  '/api',
  auth,
  (req, res, next) => {
    // Check if DB is connected before allowing access to protected routes
    if (!global.dbConnected && !process.env.BYPASS_DB) {
      return res
        .status(503)
        .json({ message: 'Database connection not available' });
    }
    next();
  },
  marketRoutes
);

// app.use('/api', auth, (_, res) => {
//   res.json({ message: 'Hello from express!' });
// });

const port = process.env.PORT || 3000;
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

let httpServer, httpsServer;

if (process.env.NODE_ENV === 'production') {
  // HTTPS Server for production
  try {
    console.log('Attempting to start HTTPS server...');

    const sslOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH || '/app/ssl/private.key'),
      cert: fs.readFileSync(
        process.env.SSL_CERT_PATH || '/app/ssl/certificate.crt'
      ),
    };

    // Create HTTPS server
    httpsServer = https.createServer(sslOptions, app);
    httpsServer.on('error', (err) => {
      console.error('HTTPS Server Error:', err);
    });

    httpsServer.listen(443, host, () => {
      console.log('HTTPS Server running on port 443');
    });

    // Create HTTP server that only handles redirects
    const redirectApp = express();
    redirectApp.use((req, res) => {
      const host = req.headers.host?.split(':')[0] || 'server.cwm18.com';
      const httpsUrl = `https://${host}${req.url}`;
      res.redirect(301, httpsUrl);
    });

    httpServer = redirectApp.listen(8080, host, () => {
      console.log('HTTP Server running on port 8080');
    });

    // Bind Vite to HTTPS server
    ViteExpress.bind(app, httpsServer);
  } catch (error) {
    console.error('Error setting up HTTPS server:', error);
    process.exit(1);
  }
} else {
  // Development - HTTP only
  httpServer = app.listen(port, host, () => {
    console.log(
      `Server is running on ${host}:${port} in ${
        process.env.NODE_ENV || 'development'
      } mode`
    );
  });
  ViteExpress.bind(app, httpServer);
}

// Try to initialize DB connection
(async () => {
  if (process.env.BYPASS_DB === 'true') {
    console.log('Database connection bypassed');
    return;
  }

  try {
    const query = new Query();
    const queryStr = 'SELECT * FROM bfex_data.markets LIMIT 1;';
    query.setCql(queryStr);

    const result = await promisedClient.executeQuery(query);
    console.log('Astra DB initialized. Data: ', result.array[0][0][0]);
    global.dbConnected = true;
  } catch (e) {
    console.error('Warning: Failed to init Astra DB: ', e);
    global.dbConnected = false;
  }
})();
