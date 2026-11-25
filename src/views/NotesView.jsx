import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IconNotes, IconLock, IconAlert, IconCheck } from '../components/Icons';

export function NotesView({ user }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('diagnostico');
  const [saving, setSaving] = useState(false);

  const [revealedCipherId, setRevealedCipherId] = useState(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.getNotes();
      setNotes(res.notes || []);
    } catch (err) {
      setError(err.message || 'Error al cargar notas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('diagnostico');
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || 'general');
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingNote) {
        await api.updateNote(editingNote.id, { title, content, category });
        setSuccess('Nota actualizada y recifrada con éxito en la base de datos.');
      } else {
        await api.createNote({ title, content, category });
        setSuccess('Nota privada cifrada con AES-256-GCM y almacenada exitosamente.');
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta nota médica privada?')) return;
    try {
      await api.deleteNote(id);
      setSuccess('Nota médica eliminada correctamente.');
      fetchNotes();
    } catch (err) {
      setError(err.message || 'Error al eliminar');
    }
  };

  const categoryBadges = {
    diagnostico: { label: 'Diagnóstico Clínico', bg: '#EFF6FF', color: '#1D4ED8' },
    receta: { label: 'Receta Médica', bg: '#F0FDF4', color: '#15803D' },
    laboratorio: { label: 'Laboratorio Clínico', bg: '#FAF5FF', color: '#7E22CE' },
    confidencial: { label: 'Estrictamente Confidencial', bg: '#FEF2F2', color: '#B91C1C' },
    general: { label: 'Consulta General', bg: '#F1F5F9', color: '#475569' }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>
            Expedientes y Notas Privadas Cifradas
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Cumplimiento RF-04 y OWASP A01 (Anti-IDOR) / A04 (Cifrado AES-256-GCM autenticado en reposo)
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <IconNotes size={16} />
          <span>+ Nueva Nota Médica</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <IconAlert size={18} />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <IconCheck size={18} />
          <div>{success}</div>
        </div>
      )}

      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ background: '#E0F2FE', color: '#0284C7', padding: '0.6rem', borderRadius: '10px' }}>
          <IconLock size={22} />
        </div>
        <div style={{ fontSize: '0.86rem', color: '#334155' }}>
          <strong>Garantía Criptográfica:</strong> Las notas se almacenan en la base de datos relacional únicamente como cadenas cifradas en formato <code>iv.tag.ciphertext</code>. Si un atacante extrae la base de datos sin la variable <code>DATA_ENCRYPTION_KEY</code>, no podrá leer los historiales clínicos ni alterar sus firmas sin ser detectado.
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
          Cargando y descifrando notas médicas con AES-256-GCM...
        </div>
      ) : notes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <IconNotes size={40} className="text-muted" style={{ margin: '0 auto 1rem', color: '#94A3B8' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E293B' }}>No hay notas registradas</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
            Haga clic en "+ Nueva Nota Médica" para crear su primer expediente privado.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">Crear Primera Nota</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {notes.map((note) => {
            const cat = categoryBadges[note.category] || categoryBadges.general;
            const isCipherRevealed = revealedCipherId === note.id;

            return (
              <div key={note.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: cat.bg, color: cat.color }}>
                      {cat.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                    {note.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.5', marginBottom: '1rem' }}>
                    {note.content}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.72rem', color: '#0284C7' }}
                      onClick={() => setRevealedCipherId(isCipherRevealed ? null : note.id)}
                    >
                      <IconLock size={12} />
                      {isCipherRevealed ? 'Ocultar Cifrado' : 'Ver Cifrado en BD (AES-256)'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditModal(note)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                        onClick={() => handleDelete(note.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {isCipherRevealed && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B' }}>
                        Dato crudo en Base de Datos (iv.tag.data Base64):
                      </div>
                      <div className="cipher-code-block">
                        {note.content_enc}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
              {editingNote ? 'Editar Nota Médica Cifrada' : 'Nueva Nota Médica Privada'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Título de la Nota / Expediente</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ej. Chequeo Anual de Cardiología"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría Médica</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="diagnostico">Diagnóstico Clínico</option>
                  <option value="receta">Receta Médica</option>
                  <option value="laboratorio">Resultados de Laboratorio</option>
                  <option value="confidencial">Estrictamente Confidencial</option>
                  <option value="general">Consulta General</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Contenido Clínico (Se cifrará con AES-256-GCM)</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  placeholder="Escriba los datos clínicos, prescripción, antecedentes o notas privadas..."
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Cifrando con AES-256...' : editingNote ? 'Actualizar Nota' : 'Guardar y Cifrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesView;
