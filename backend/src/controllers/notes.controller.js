import {
  createNote,
  getUserNotes,
  getNoteById,
  updateNote,
  deleteNote
} from '../services/notes.service.js';

export async function create(req, res, next) {
  try {
    const { title, content, category } = req.body;
    const note = await createNote({
      userId: req.user.id,
      title,
      content,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Nota médica resguardada y cifrada con AES-256-GCM exitosamente.',
      note
    });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const notes = await getUserNotes(req.user.id);
    res.status(200).json({
      success: true,
      total: notes.length,
      notes
    });
  } catch (err) {
    next(err);
  }
}

export async function getOneNote(req, res, next) {
  try {
    const noteId = parseInt(req.params.id, 10);
    const note = await getNoteById(noteId, req.user.id);
    res.status(200).json({
      success: true,
      note
    });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const noteId = parseInt(req.params.id, 10);
    const { title, content, category } = req.body;
    const updated = await updateNote({
      noteId,
      userId: req.user.id,
      title,
      content,
      category
    });

    res.status(200).json({
      success: true,
      message: 'Nota médica actualizada y re-cifrada con nuevo IV.',
      note: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const noteId = parseInt(req.params.id, 10);
    const result = await deleteNote(noteId, req.user.id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}
