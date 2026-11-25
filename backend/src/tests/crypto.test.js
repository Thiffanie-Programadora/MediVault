import {
  hashPassword,
  verifyPassword,
  encrypt,
  decrypt,
  generateSecureToken,
  hashToken,
  maskSensitiveValue
} from '../services/crypto.service.js';

describe('MediVault Cryptographic Service (A04 & Laboratorio Requisitos)', () => {

  describe('Password Hashing (Bcrypt cost factor 12)', () => {
    it('should hash a password and produce a valid bcrypt string with $2a$ or $2b$', async () => {
      const plain = 'ClinicaSegura2026!#';
      const hash = await hashPassword(plain);
      
      expect(hash).toBeDefined();
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
      expect(hash).not.toEqual(plain);
    });

    it('should verify correct password and reject incorrect password', async () => {
      const plain = 'ClinicaSegura2026!#';
      const hash = await hashPassword(plain);

      const isValid = await verifyPassword(plain, hash);
      const isInvalid = await verifyPassword('WrongPassword123!', hash);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('AES-256-GCM Authenticated Encryption', () => {
    it('should encrypt plaintext into iv.tag.ciphertext format', () => {
      const text = 'Expediente confidencial del paciente con cardiopatía';
      const encrypted = encrypt(text);

      expect(encrypted).toBeDefined();
      const parts = encrypted.split('.');
      expect(parts.length).toBe(3);

      const iv = Buffer.from(parts[0], 'base64');
      const tag = Buffer.from(parts[1], 'base64');
      const data = Buffer.from(parts[2], 'base64');

      expect(iv.length).toBe(12);
      expect(tag.length).toBe(16);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should decrypt back to original plaintext accurately', () => {
      const text = 'Diagnóstico médico: Glaucoma bilateral en tratamiento con Latanoprost';
      const encrypted = encrypt(text);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(text);
    });

    it('should produce different ciphertexts for the same plaintext due to random IV', () => {
      const text = 'Mismo dato clínico sensible';
      const enc1 = encrypt(text);
      const enc2 = encrypt(text);

      expect(enc1).not.toBe(enc2);
      expect(decrypt(enc1)).toBe(text);
      expect(decrypt(enc2)).toBe(text);
    });

    it('should fail-closed (throw error) if ciphertext or tag has been tampered with', () => {
      const text = 'Nota médica original sin alterar';
      const encrypted = encrypt(text);
      const parts = encrypted.split('.');
      
      const tamperedTag = Buffer.from('alteredtag123456').toString('base64');
      const tamperedPayload = `${parts[0]}.${tamperedTag}.${parts[2]}`;

      expect(() => decrypt(tamperedPayload)).toThrow();
    });
  });

  describe('One-Time Token Hashing (SHA-256)', () => {
    it('should generate a 32-byte (64 hex char) cryptographically secure random token', () => {
      const token = generateSecureToken();
      expect(token).toBeDefined();
      expect(token.length).toBe(64);
    });

    it('should hash token deterministically with SHA-256', () => {
      const token = 'abcdef1234567890abcdef1234567890';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64);
    });
  });

  describe('PII Data Masking (RF-05)', () => {
    it('should mask Costa Rican ID cédula to ***-***-XXXX', () => {
      const cedula = '1-1849-0234';
      const masked = maskSensitiveValue(cedula);
      expect(masked).toBe('***-***-0234');
    });

    it('should mask phone number to ***-***-XXXX', () => {
      const phone = '+506 8888-1122';
      const masked = maskSensitiveValue(phone);
      expect(masked).toBe('***-***-1122');
    });
  });
});
