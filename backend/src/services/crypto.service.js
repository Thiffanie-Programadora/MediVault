import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

const BCRYPT_ROUNDS = 12;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM per NIST SP 800-38D
const TAG_LENGTH = 16; // 128 bits authentication tag

// Multi-key keyring for hot zero-downtime key rotation
const KEYRING = {
  v1: env.DATA_ENCRYPTION_KEY,
  v2: process.env.DATA_ENCRYPTION_KEY_V2 
    ? Buffer.from(process.env.DATA_ENCRYPTION_KEY_V2, 'base64') 
    : crypto.createHash('sha256').update(env.DATA_ENCRYPTION_KEY_B64 + '_v2_rotated').digest()
};

let activeKeyVersion = 'v1';

export function setActiveKeyVersion(version) {
  if (!KEYRING[version]) {
    throw new Error(`Versión de llave desconocida: ${version}`);
  }
  activeKeyVersion = version;
}

export function getActiveKeyVersion() {
  return activeKeyVersion;
}

export async function hashPassword(plainTextPassword) {
  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    throw new Error('Contraseña inválida para hash');
  }
  return bcrypt.hash(plainTextPassword, BCRYPT_ROUNDS);
}

export async function verifyPassword(plainTextPassword, hashedPassword) {
  if (!plainTextPassword || !hashedPassword) {
    return false;
  }
  return bcrypt.compare(plainTextPassword, hashedPassword);
}

export function encryptData(plainText, keyVersion = activeKeyVersion) {
  if (plainText === null || plainText === undefined) {
    return null;
  }
  const key = KEYRING[keyVersion] || KEYRING['v1'];
  const str = typeof plainText === 'string' ? plainText : JSON.stringify(plainText);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(str, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Storage format: Base64(IV) . Base64(Tag) . Base64(Ciphertext)
  return `${iv.toString('base64')}.${authTag.toString('base64')}.${encrypted}`;
}

export const encrypt = encryptData;

export function decryptData(encryptedString, keyVersion = null) {
  if (!encryptedString) {
    return null;
  }

  let version = keyVersion || activeKeyVersion;
  let payload = encryptedString;

  if (encryptedString.includes(':')) {
    const splitIndex = encryptedString.indexOf(':');
    version = encryptedString.substring(0, splitIndex);
    payload = encryptedString.substring(splitIndex + 1);
  }

  const key = KEYRING[version] || KEYRING['v1'];
  if (!key) {
    throw new Error(`No se encontró la llave para la versión: ${version}`);
  }

  const parts = payload.split('.');
  if (parts.length !== 3) {
    throw new Error('Formato cifrado inválido: Se esperaba iv.tag.ciphertext');
  }

  const [ivPart, tagPart, encPart] = parts;
  // Support Base64 (primary) with hex fallback
  const isHex = (str) => /^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0;
  
  const iv = (ivPart.length === 24 && isHex(ivPart))
    ? Buffer.from(ivPart, 'hex')
    : Buffer.from(ivPart, 'base64');

  const authTag = (tagPart.length === 32 && isHex(tagPart))
    ? Buffer.from(tagPart, 'hex')
    : Buffer.from(tagPart, 'base64');

  if (iv.length !== IV_LENGTH) {
    throw new Error(`Longitud de IV inválida: se esperaba ${IV_LENGTH} bytes, obtenido ${iv.length}`);
  }

  if (authTag.length !== TAG_LENGTH) {
    throw new Error(`Longitud de Tag de autenticación inválida: se esperaba ${TAG_LENGTH} bytes, obtenido ${authTag.length}`);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  try {
    const inputEncoding = (isHex(encPart) && encPart.length > 32 && !encPart.includes('+') && !encPart.includes('/'))
      ? 'hex'
      : 'base64';

    let decrypted = decipher.update(encPart, inputEncoding, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    throw new Error(`Fallo de integridad criptográfica (OWASP A04/A08): Los datos fueron alterados o la llave es inválida. ${err.message}`);
  }
}

export const decrypt = decryptData;

export function reEncryptData(encryptedString, targetVersion = 'v2') {
  const plainText = decryptData(encryptedString);
  return encryptData(plainText, targetVersion);
}

export function calculateHmac(data, secret = env.JWT_SECRET) {
  return crypto.createHmac('sha256', secret).update(String(data)).digest('hex');
}

export function verifyHmac(data, signature, secret = env.JWT_SECRET) {
  const expected = calculateHmac(data, secret);
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}

export function generateSecureToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString('hex');
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function maskSensitiveId(documentId) {
  if (!documentId) return '';
  const str = String(documentId).trim();
  if (str.length <= 4) return '***';
  return `***-***-${str.slice(-4)}`;
}

export function maskPhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';
  const str = String(phoneNumber).trim();
  if (str.length <= 4) return '***';
  return `***-***-${str.slice(-4)}`;
}

export const maskSensitiveValue = maskSensitiveId;

// RFC 6238 TOTP Multi-Factor Authentication Helpers
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateTotpSecret(length = 20) {
  const randomBytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[randomBytes[i] % 32];
  }
  return secret;
}

function base32ToBuffer(base32) {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean[i]);
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTotpCode(secret, timeStep = 30, time = Date.now()) {
  const counter = Math.floor(time / 1000 / timeStep);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));

  const key = base32ToBuffer(secret);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();

  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

export function verifyTotpCode(token, secret, window = 1) {
  if (!token || !secret) return false;
  const now = Date.now();
  for (let i = -window; i <= window; i++) {
    const checkTime = now + i * 30000;
    const expected = generateTotpCode(secret, 30, checkTime);
    if (expected === String(token).trim()) {
      return true;
    }
  }
  return false;
}
