import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.NODE_ENV === 'test' 
  ? path.resolve(dbDir, 'medivault_test.db')
  : path.resolve(dbDir, 'medivault.db');

export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for relational integrity
try {
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  logger.info(`Connected to SQLite Relational Database via node:sqlite at ${dbPath}`);
} catch (err) {
  logger.error('Failed to configure database pragmas', { error: err.message });
}

export function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    logger.error('Database query error', { sql, error: error.message });
    throw error;
  }
}

export function queryOne(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  } catch (error) {
    logger.error('Database queryOne error', { sql, error: error.message });
    throw error;
  }
}

export function execute(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return {
      changes: result.changes,
      lastInsertRowid: result.lastInsertRowid,
      lastID: result.lastInsertRowid
    };
  } catch (error) {
    logger.error('Database execute error', { sql, error: error.message });
    throw error;
  }
}

export const getOne = queryOne;

export function execRaw(sql) {
  try {
    db.exec(sql);
  } catch (error) {
    logger.error('Database execRaw error', { error: error.message });
    throw error;
  }
}
