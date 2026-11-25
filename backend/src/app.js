import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { generalLimiter } from './middlewares/rateLimiter.middleware.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/errorHandler.middleware.js';
import apiRouter from './routes/index.js';
import { getHealth } from './controllers/health.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

// OWASP A02: Helmet with Content-Security-Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", env.FRONTEND_URL, "http://localhost:5000", "http://127.0.0.1:5000"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: env.NODE_ENV === 'production' && !env.FRONTEND_URL.includes('localhost') ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === env.FRONTEND_URL || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por política CORS de MediVault.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Cookie parsing middleware (zero dependency)
app.use((req, res, next) => {
  req.cookies = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach(pair => {
      const parts = pair.split('=');
      const name = parts[0]?.trim();
      const val = parts.slice(1).join('=').trim();
      if (name) {
        try {
          req.cookies[name] = decodeURIComponent(val);
        } catch {
          req.cookies[name] = val;
        }
      }
    });
  }
  next();
});

// JSON and URL-encoded parsing with strict size limits (OWASP A06 DoS prevention)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health endpoint (RF-08: responds 200 OK without disclosing software versions)
app.get('/health', getHealth);

// General rate limiting on API routes
app.use('/api', generalLimiter);

// Mount main API router
app.use('/api', apiRouter);

// Serve production static frontend if available
const distPath = path.resolve(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl === '/health') {
      return next();
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);
