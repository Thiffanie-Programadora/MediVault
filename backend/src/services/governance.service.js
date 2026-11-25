import { getOne, execute, query } from '../config/db.js';
import { verifyPassword, decrypt, maskSensitiveValue } from './crypto.service.js';
import { logger } from '../config/logger.js';

export async function getUserProfile(userId, reveal = false, password = null) {
  const user = await getOne(
    `SELECT u.id, u.name, u.email, u.role_id, u.is_active, u.sensitive_document_enc, u.phone_enc,
            u.created_at, r.name as role_name
     FROM users u
     JOIN roles r ON u.role_id = r.id
     WHERE u.id = ?`,
    [userId]
  );

  if (!user) {
    const err = new Error('Usuario no encontrado.');
    err.status = 404;
    throw err;
  }

  const rawDoc = decrypt(user.sensitive_document_enc);
  const rawPhone = decrypt(user.phone_enc);

  let doc = maskSensitiveValue(rawDoc);
  let phone = maskSensitiveValue(rawPhone);

  if (reveal) {
    if (!password) {
      const err = new Error('Se requiere confirmar la contraseña para visualizar datos no enmascarados.');
      err.status = 400;
      throw err;
    }
    const fullUser = await getOne('SELECT password_hash FROM users WHERE id = ?', [userId]);
    const valid = await verifyPassword(password, fullUser.password_hash);
    if (!valid) {
      const err = new Error('Contraseña incorrecta.');
      err.status = 401;
      throw err;
    }
    doc = rawDoc;
    phone = rawPhone;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role_name,
    document: doc,
    phone: phone,
    isMasked: !reveal,
    createdAt: user.created_at
  };
}

export async function requestAccountDeletion({ userId, passwordConfirmation, reason, ip = '127.0.0.1' }) {
  const user = await getOne('SELECT id, email, password_hash FROM users WHERE id = ?', [userId]);
  if (!user) {
    const err = new Error('Usuario no encontrado.');
    err.status = 404;
    throw err;
  }

  const isMatch = await verifyPassword(passwordConfirmation, user.password_hash);
  if (!isMatch) {
    const err = new Error('Contraseña incorrecta. Se requiere verificación de identidad para solicitar la eliminación de datos.');
    err.status = 401;
    throw err;
  }

  const legalHoldReason = 'Conforme a la Ley General de Salud N.° 5395 y el Reglamento del Expediente de Salud, los historiales diagnósticos y recetas se conservan bajo custodia criptográfica durante el plazo de prescripción legal. Sus datos de contacto han sido anonimizados.';

  await execute(
    `INSERT INTO deletion_requests (user_id, status, reason, legal_hold_reason, requested_at, processed_at)
     VALUES (?, 'PROCESSED', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [userId, reason, legalHoldReason]
  );

  const anonymizedEmail = `deleted_user_${userId}_${Date.now()}@anonymized.medivault.cr`;
  await execute(
    `UPDATE users
     SET name = 'Usuario Suprimido (Ley 8968)',
         email = ?,
         is_active = 0,
         phone_enc = NULL,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [anonymizedEmail, userId]
  );

  await execute(
    `INSERT INTO audit_logs (event_type, user_id, ip_address, details)
     VALUES ('DATA_ERASURE_REQUEST', ?, ?, ?)`,
    [userId, ip, JSON.stringify({ originalEmail: '[REDACTED]', reason, status: 'PROCESSED' })]
  );

  logger.info('User account deletion and data scrubbing processed under Ley 8968', { userId });

  return {
    success: true,
    message: 'Su solicitud de baja y supresión de datos (Ley N.° 8968) ha sido procesada con éxito.',
    legalNotice: legalHoldReason
  };
}

export async function getDeletionRequests() {
  return query(`
    SELECT dr.id, dr.user_id, dr.status, dr.reason, dr.legal_hold_reason, dr.requested_at, dr.processed_at,
           u.name as user_name
    FROM deletion_requests dr
    LEFT JOIN users u ON dr.user_id = u.id
    ORDER BY dr.requested_at DESC
  `);
}
