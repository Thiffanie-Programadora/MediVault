import { execRaw } from '../config/db.js';
import { logger } from '../config/logger.js';

export async function initDatabaseSchema() {
  logger.info('Initializing MediVault relational database schema...');

  await execRaw(`
    -- 1. Roles (Administrador, Colaborador, Cliente, Auditor)
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    );

    -- 2. Users (Normalized 3FN with AES-256-GCM encrypted PII, bcrypt passwords, and TOTP MFA)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      sensitive_document_enc TEXT,
      phone_enc TEXT,
      is_active INTEGER DEFAULT 1,
      failed_login_attempts INTEGER DEFAULT 0,
      lock_until DATETIME DEFAULT NULL,
      totp_secret TEXT DEFAULT NULL,
      totp_enabled INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
    );

    -- 3. Encrypted Notes & Clinical Records (RF-04, A01, A04)
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content_enc TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      key_version TEXT DEFAULT 'v1',
      hmac_signature TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 4. Password Reset Tokens (RF-06, A04)
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 5. Audit & Security Event Logs (RF-07, A09)
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      user_id INTEGER,
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 6. Key Rotation History (OWASP A04 cryptographic maintenance)
    CREATE TABLE IF NOT EXISTS key_rotation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_version TEXT NOT NULL,
      to_version TEXT NOT NULL,
      records_migrated INTEGER NOT NULL,
      performed_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. Data Governance Consents (Ley N.° 8968)
    CREATE TABLE IF NOT EXISTS governance_consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      consent_type TEXT NOT NULL,
      accepted INTEGER NOT NULL,
      ip_address TEXT,
      version TEXT NOT NULL,
      accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 8. Right to Erasure / Account Deletion Requests (Ley N.° 8968)
    CREATE TABLE IF NOT EXISTS deletion_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      reason TEXT,
      legal_hold_reason TEXT,
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 9. AI Agent Execution Log (Sec 7 requirement)
    CREATE TABLE IF NOT EXISTS ai_agent_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_name TEXT NOT NULL,
      user_id INTEGER,
      input_summary TEXT,
      output_summary TEXT,
      latency_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 10. External API Cache
    CREATE TABLE IF NOT EXISTS external_api_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_name TEXT UNIQUE NOT NULL,
      payload_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_notes_owner ON notes(owner_id);
    CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_logs(event_type);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
  `);

  logger.info('Database schema successfully initialized.');
}
