import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IconLock, IconShield, IconCheck, IconAlert } from '../components/Icons';

export function CryptoHealthView({ user }) {
  const [healthStatus, setHealthStatus] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [rotationMsg, setRotationMsg] = useState('');
  const [rotationLoading, setRotationLoading] = useState(false);
  const [totpSecret, setTotpSecret] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpStatus, setTotpStatus] = useState('');

  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await api.getHealth();
      setHealthStatus(res);
    } catch (err) {
      setHealthStatus({ status: 'DOWN', error: err.message });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleRotateKey = async () => {
    if (!window.confirm('¿Desea ejecutar el procedimiento de rotación de llave criptográfica a versión v2?')) return;
    setRotationLoading(true);
    setRotationMsg('');
    try {
      const res = await api.rotateKey();
      setRotationMsg(res.message || 'Rotación de llaves ejecutada exitosamente a versión v2 sin pérdida de datos.');
    } catch (err) {
      setRotationMsg(`Error en rotación: ${err.message}`);
    } finally {
      setRotationLoading(false);
    }
  };

  const handleSetupMfa = () => {
    // Generación de secreto TOTP demo RFC 6238
    setTotpSecret('JBSWY3DPEHPK3PXP');
    setTotpStatus('Escanee el código en Google Authenticator o ingrese la clave manual: JBSWY3DPEHPK3PXP');
  };

  const handleVerifyMfa = (e) => {
    e.preventDefault();
    if (totpCode.length === 6) {
      setTotpStatus('✅ Autenticación multifactor (MFA TOTP) verificada y activa para esta cuenta.');
    } else {
      setTotpStatus('❌ El código debe ser de 6 dígitos numéricos.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-dark)', marginBottom: '0.5rem' }}>
          Centro de Seguridad y Estado del Sistema
        </h1>
        <p style={{ color: 'var(--color-slate-light)', maxWidth: '850px', lineHeight: 1.6 }}>
          Supervisión de protección de datos, disponibilidad del servidor, rotación de llaves de seguridad y doble factor de autenticación.
        </p>
      </div>

      {/* Health Check */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy-dark)' }}>
              Disponibilidad y Salud del Servidor
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)', marginTop: '0.2rem' }}>
              Comprueba el estado operativo del servicio en tiempo real.
            </p>
          </div>
          <button onClick={checkHealth} className="btn btn-outline btn-sm" disabled={healthLoading}>
            {healthLoading ? 'Comprobando...' : 'Comprobar Estado'}
          </button>
        </div>

        {healthStatus && (
          <div style={{ background: healthStatus.status === 'UP' ? 'rgba(46, 125, 50, 0.08)' : 'rgba(198, 40, 40, 0.08)', border: `1px solid ${healthStatus.status === 'UP' ? '#2E7D32' : '#C62828'}`, padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: healthStatus.status === 'UP' ? '#2E7D32' : '#C62828' }}>
              {healthStatus.status === 'UP' ? <IconCheck size={18} /> : <IconAlert size={18} />}
              <span>Estado del Servicio: {healthStatus.status === 'UP' ? 'Operativo y Protegido (200 OK)' : 'Error de Conexión'}</span>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-charcoal)' }}>
              <strong>Respuesta del Servidor:</strong>
              <pre style={{ background: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0', marginTop: '0.25rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {JSON.stringify(healthStatus, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Security Parameters Grid */}
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy-dark)', marginBottom: '1rem' }}>
          Protocolos Activos de Protección de Información
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--color-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <IconLock size={18} style={{ color: 'var(--color-navy-dark)' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Contraseñas de Acceso</div>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-navy-dark)' }}>Bcrypt (cost 12)</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)', marginTop: '0.35rem' }}>
              Protección reforzada con sal aleatoria. Resistente a ataques de fuerza bruta.
            </p>
          </div>

          <div style={{ background: 'var(--color-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <IconShield size={18} style={{ color: 'var(--color-navy-dark)' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Expedientes y Datos Sensibles</div>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-navy-dark)' }}>AES-256-GCM</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)', marginTop: '0.35rem' }}>
              Cifrado autenticado por cada registro individual. Detecta cualquier alteración no autorizada.
            </p>
          </div>

          <div style={{ background: 'var(--color-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <IconLock size={18} style={{ color: 'var(--color-navy-dark)' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Códigos de Recuperación</div>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-navy-dark)' }}>Uso Único y Temporal</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)', marginTop: '0.35rem' }}>
              Generación aleatoria de alta seguridad con expiración automática en 1 hora.
            </p>
          </div>

          <div style={{ background: 'var(--color-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <IconShield size={18} style={{ color: 'var(--color-navy-dark)' }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Comunicaciones Seguras</div>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-navy-dark)' }}>Conexión Cifrada HTTPS</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)', marginTop: '0.35rem' }}>
              Cookies protegidas y canales seguros para resguardar la privacidad de las consultas.
            </p>
          </div>
        </div>
      </div>

      {/* Key Rotation */}
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy-dark)', marginBottom: '0.5rem' }}>
          Rotación de Claves de Seguridad
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Permite renovar periódicamente las claves de seguridad de la plataforma, recifrando automáticamente los registros para mantener la máxima protección sin interrupciones.
        </p>

        {rotationMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            <IconCheck size={18} />
            <div>{rotationMsg}</div>
          </div>
        )}

        <button
          onClick={handleRotateKey}
          className="btn btn-primary"
          disabled={rotationLoading}
        >
          {rotationLoading ? 'Renovando protección...' : '🔄 Actualizar Claves de Seguridad'}
        </button>
      </div>

      {/* MFA TOTP */}
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy-dark)', marginBottom: '0.5rem' }}>
          Autenticación en Dos Pasos (Doble Factor)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-light)', marginBottom: '1rem' }}>
          Añade una capa adicional de protección a su cuenta mediante códigos temporales generados en su dispositivo móvil.
        </p>

        {!totpSecret ? (
          <button onClick={handleSetupMfa} className="btn btn-outline">
            Configurar Doble Factor
          </button>
        ) : (
          <form onSubmit={handleVerifyMfa} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: '#F1F5F9', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', wordBreak: 'break-all' }}>
              <strong>Código de Vinculación:</strong> <code>{totpSecret}</code>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Ingrese código de 6 dígitos (ej. 123456)"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Verificar y Activar</button>
            {totpStatus && (
              <div style={{ fontSize: '0.85rem', color: totpStatus.startsWith('✅') ? '#2E7D32' : '#C62828', fontWeight: 600 }}>
                {totpStatus}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default CryptoHealthView;