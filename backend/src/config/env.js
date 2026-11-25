import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATA_ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY || 'WjV4ODNrc3lMbmE5M1pRYWJDZEdISktMTU5PUFFSU1Q=';
const keyBuffer = Buffer.from(DATA_ENCRYPTION_KEY, 'base64');

if (keyBuffer.length !== 32) {
  throw new Error('CRITICAL SECURITY ERROR: DATA_ENCRYPTION_KEY must be a 32-byte Base64 encoded string.');
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DATA_ENCRYPTION_KEY: keyBuffer,
  DATA_ENCRYPTION_KEY_B64: DATA_ENCRYPTION_KEY,
  JWT_SECRET: process.env.JWT_SECRET || 'medivault_super_secret_jwt_key_costa_rica_2026_@#!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  LOGIN_MAX_ATTEMPTS: parseInt(process.env.LOGIN_MAX_ATTEMPTS, 10) || 5,
  LOGIN_WINDOW_MINUTES: parseInt(process.env.LOGIN_WINDOW_MINUTES, 10) || 15,
  BCCR_TOKEN: process.env.BCCR_TOKEN || 'demo_bccr_token',
  HACIENDA_API_URL: process.env.HACIENDA_API_URL || 'https://api.hacienda.go.cr/fe',
  OPEN_METEO_API_URL: process.env.OPEN_METEO_API_URL || 'https://api.open-meteo.com/v1/forecast'
};
