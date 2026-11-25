import React, { useState } from 'react';
import { api } from '../services/api';
import { UserIcon, ShieldIcon, KeyIcon, LockIcon, TrashIcon, CheckIcon, AlertTriangleIcon, EyeIcon } from '../components/Icons';

export default function ProfileView({ user, onUpdateUser }) {
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealPassword, setRevealPassword] = useState('');
  const [revealedPii, setRevealedPii] = useState(null);
  const [revealError, setRevealError] = useState('');
  const [revealLoading, setRevealLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionSuccess, setDeletionSuccess] = useState('');
  const [deletionError, setDeletionError] = useState('');
  const [deletionLoading, setDeletionLoading] = useState(false);

  const handleRevealPii = async (e) => {
    e.preventDefault();
    setRevealError('');
    setRevealLoading(true);
    try {
      const res = await api.revealPii(revealPassword);
      setRevealedPii(res.data);
      setShowRevealModal(false);
      setRevealPassword('');
    } catch (err) {
      setRevealError(err.message || 'Contraseña incorrecta');
    } finally {
      setRevealLoading(false);
    }
  };

  const handleRequestDeletion = async (e) => {
    e.preventDefault();
    setDeletionError('');
    setDeletionLoading(true);
    try {
      await api.requestDeletion(deletionReason);
      setDeletionSuccess('Su solicitud de supresión de datos bajo la Ley N.° 8968 ha sido registrada formalmente.');
      setShowDeleteModal(false);
      setDeletionReason('');
    } catch (err) {
      setDeletionError(err.message || 'Error al enviar solicitud de supresión');
    } finally {
      setDeletionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-dark)', marginBottom: '0.5rem' }}>
          Perfil de Usuario y Privacidad (Ley N.° 8968)
        </h1>
        <p style={{ color: 'var(--color-slate-light)', lineHeight: 1.6 }}>
          Gestión de identidad digital, revelación segura de PII bajo reautenticación y ejercicio de Derechos ARCO
          (Acceso, Rectificación, Cancelación y Oposición) ante la Agencia de Protección de Datos de los Habitantes (PRODHAB).
        </p>
      </div>

      {deletionSuccess && (
        <div className="alert alert-success">
          <CheckIcon /> {deletionSuccess}
        </div>
      )}

      {/* Profile Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-navy-primary), var(--color-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-navy-dark)', margin: 0 }}>
              {user?.fullName}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)' }}>{user?.email}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)', marginBottom: '0.25rem' }}>Identificador Único:</div>
            <div style={{ fontWeight: 600, color: 'var(--color-navy-dark)' }}>Usuario #{user?.id}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)', marginBottom: '0.25rem' }}>Consentimiento Informado:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-emerald)', fontWeight: 600 }}>
              <CheckIcon /> Otorgado (Ley N.° 8968)
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)', marginBottom: '0.35rem' }}>
              Identificación Oficial / Cédula (Protegida Criptográficamente):
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-bg)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.1em', fontWeight: 700, color: revealedPii ? 'var(--color-cyan)' : 'var(--color-navy-dark)' }}>
                {revealedPii?.national_id || user?.maskedId || '***-***-1234'}
              </div>
              {!revealedPii && (
                <button
                  className="btn btn-outline"
                  style={{ marginLeft: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => setShowRevealModal(true)}
                >
                  <EyeIcon /> Revelar (Requiere Clave)
                </button>
              )}
              {revealedPii && (
                <span className="badge badge-colaborador" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                  Descifrado AES-256-GCM
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)', marginTop: '0.35rem', display: 'block' }}>
              Cumplimiento OWASP A02: El dato está cifrado en reposo con AES-256-GCM. El backend jamás expone el valor plano sin verificación de contraseña previa.
            </span>
          </div>
        </div>
      </div>

      {/* Ley 8968 Actions */}
      <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-rose)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrashIcon /> Ejercicio de Derechos ARCO: Derecho al Olvido
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Conforme al Artículo 7 de la Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales (Ley N.° 8968),
          usted tiene el derecho inalienable de solicitar la cancelación, supresión y anonimización de sus registros personales
          y notas clínicas de nuestra base de datos.
        </p>
        <button
          className="btn"
          style={{ background: 'var(--color-rose)', color: '#fff', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          onClick={() => setShowDeleteModal(true)}
        >
          Solicitar Supresión de Mis Datos
        </button>
      </div>

      {/* Modal: Reveal PII */}
      {showRevealModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-navy-dark)', marginBottom: '0.5rem' }}>
              Verificación de Identidad Requerida
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)', marginBottom: '1.25rem' }}>
              Para descifrar su número de identificación oficial almacenado bajo AES-256-GCM, ingrese su contraseña actual:
            </p>

            {revealError && (
              <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
                <AlertTriangleIcon /> {revealError}
              </div>
            )}

            <form onSubmit={handleRevealPii}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">Contraseña Actual:</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••••••"
                  required
                  value={revealPassword}
                  onChange={(e) => setRevealPassword(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowRevealModal(false)}
                  disabled={revealLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={revealLoading}
                >
                  {revealLoading ? 'Descifrando...' : 'Confirmar y Revelar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Deletion */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '460px', width: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-rose)', marginBottom: '0.5rem' }}>
              Solicitud de Supresión de Datos
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)', marginBottom: '1.25rem' }}>
              Esta solicitud será procesada por el Oficial de Privacidad en un plazo máximo de 5 días hábiles conforme a la Ley N.° 8968.
            </p>

            {deletionError && (
              <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
                <AlertTriangleIcon /> {deletionError}
              </div>
            )}

            <form onSubmit={handleRequestDeletion}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label">Motivo de la solicitud (Opcional):</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Ej: Cierre de tratamiento médico y revocación de consentimiento..."
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletionLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: 'var(--color-rose)', color: '#fff' }}
                  disabled={deletionLoading}
                >
                  {deletionLoading ? 'Enviando...' : 'Confirmar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
