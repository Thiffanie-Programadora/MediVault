import { query, getOne, execute } from '../config/db.js';
import { encryptData, decryptData, calculateHmac, getActiveKeyVersion } from './crypto.service.js';
import { logger } from '../config/logger.js';

const MAX_NOTES_PER_USER = 50; // OWASP A06 Business limit mitigation
const MAX_CONTENT_LENGTH = 50000; // 50,000 characters limit

export async function createNote({ userId, title, content, category = 'general' }) {
  if (!content || typeof content !== 'string') {
    const err = new Error('El contenido de la nota es requerido.');
    err.status = 400;
    throw err;
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    const err = new Error(`El contenido excede el límite permitido de ${MAX_CONTENT_LENGTH} caracteres.`);
    err.status = 400;
    throw err;
  }

  const countRow = await getOne('SELECT COUNT(*) as count FROM notes WHERE owner_id = ?', [userId]);
  if (countRow && countRow.count >= MAX_NOTES_PER_USER) {
    const err = new Error(`Límite de negocio excedido: Se permite un máximo de ${MAX_NOTES_PER_USER} notas privadas por usuario.`);
    err.status = 400;
    throw err;
  }

  const keyVersion = getActiveKeyVersion();
  const encryptedContent = encryptData(content, keyVersion);
  const hmacSig = calculateHmac(encryptedContent);

  const res = await execute(
    `INSERT INTO notes (owner_id, title, content_enc, category, key_version, hmac_signature)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, title, encryptedContent, category, keyVersion, hmacSig]
  );

  logger.info('Note created and encrypted with AES-256-GCM', { noteId: res.lastID, ownerId: userId, category, keyVersion });

  return {
    id: res.lastID,
    owner_id: userId,
    title,
    content,
    category,
    key_version: keyVersion,
    content_enc: encryptedContent,
    created_at: new Date().toISOString()
  };
}

export async function getUserNotes(userId) {
  const rows = await query(
    `SELECT id, owner_id, title, content_enc, category, key_version, hmac_signature, created_at, updated_at
     FROM notes
     WHERE owner_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows.map(row => {
    let plainContent = '[Error de descifrado]';
    try {
      plainContent = decryptData(row.content_enc);
    } catch (e) {
      logger.error('Failed to decrypt note content', { noteId: row.id, error: e.message });
    }

    return {
      id: row.id,
      owner_id: row.owner_id,
      title: row.title,
      content: plainContent,
      content_enc: row.content_enc,
      category: row.category,
      key_version: row.key_version || 'v1',
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  });
}

export async function getNoteById(noteId, userId) {
  const note = await getOne(
    `SELECT id, owner_id, title, content_enc, category, key_version, hmac_signature, created_at, updated_at
     FROM notes
     WHERE id = ?`,
    [noteId]
  );

  if (!note) {
    const err = new Error('Nota no encontrada.');
    err.status = 404;
    throw err;
  }

  // IDOR check (OWASP A01)
  if (note.owner_id !== userId) {
    logger.warn('IDOR attempt blocked: User tried to access note of another user', {
      attemptedNoteId: noteId,
      actualOwnerId: note.owner_id,
      requestingUserId: userId
    });
    const err = new Error('Acceso denegado: No tiene autorización para acceder a esta nota.');
    err.status = 403;
    throw err;
  }

  return {
    id: note.id,
    owner_id: note.owner_id,
    title: note.title,
    content: decryptData(note.content_enc),
    content_enc: note.content_enc,
    category: note.category,
    key_version: note.key_version || 'v1',
    created_at: note.created_at,
    updated_at: note.updated_at
  };
}

export async function updateNote({ noteId, userId, title, content, category }) {
  const existing = await getNoteById(noteId, userId);

  const newTitle = title !== undefined ? title : existing.title;
  let newContentEnc = existing.content_enc;
  let newKeyVersion = existing.key_version;
  let newHmac = existing.hmac_signature;

  if (content !== undefined) {
    if (content.length > MAX_CONTENT_LENGTH) {
      const err = new Error(`El contenido excede el límite permitido de ${MAX_CONTENT_LENGTH} caracteres.`);
      err.status = 400;
      throw err;
    }
    newKeyVersion = getActiveKeyVersion();
    newContentEnc = encryptData(content, newKeyVersion);
    newHmac = calculateHmac(newContentEnc);
  }

  const newCategory = category !== undefined ? category : existing.category;

  await execute(
    `UPDATE notes
     SET title = ?, content_enc = ?, category = ?, key_version = ?, hmac_signature = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND owner_id = ?`,
    [newTitle, newContentEnc, newCategory, newKeyVersion, newHmac, noteId, userId]
  );

  logger.info('Note updated successfully', { noteId, ownerId: userId });

  return {
    id: noteId,
    owner_id: userId,
    title: newTitle,
    content: content !== undefined ? content : existing.content,
    category: newCategory,
    key_version: newKeyVersion,
    content_enc: newContentEnc
  };
}

export async function deleteNote({ noteId, userId }) {
  // Pre-check ownership to enforce proper 403 vs 404
  await getNoteById(noteId, userId);

  await execute('DELETE FROM notes WHERE id = ? AND owner_id = ?', [noteId, userId]);
  logger.info('Note deleted successfully', { noteId, ownerId: userId });

  return { success: true, message: 'Nota eliminada correctamente.' };
}
