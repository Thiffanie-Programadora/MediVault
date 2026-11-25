import React, { useState } from 'react';
import { api } from '../services/api';
import { IconShield, IconLock, IconUser, IconAlert, IconCheck } from '../components/Icons';

export function AuthView({ onAuthSuccess, onLoginSuccess }) {
  const handleSuccess = onLoginSuccess || onAuthSuccess;
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDoc, setRegDoc] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('cliente');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const hasMinLength = regPassword.length >= 10;
  const hasUpper = /[A-Z]/.test(regPassword);
  const hasLower = /[a-z]/.test(regPassword);
  const hasNumber = /\d/.test(regPassword);
  const hasSpecial = /[@$!%*?&#^._\-~+=\[\]]/.test(regPassword);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login({ email: loginEmail, password: loginPassword });
      localStorage.setItem('medivault_token', res.token);
      localStorage.setItem('medivault_user', JSON.stringify(res.user));
      handleSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Error en el inicio de sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!termsAccepted || !privacyAccepted) {
      setError('Debe aceptar los Términos y la Política de Privacidad de Datos (Ley N.° 8968).');
      return;
    }
    if (!isPasswordValid) {
      setError('La contraseña no cumple con la política de complejidad obligatoria.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        doc: regDoc,
        phone: regPhone,
        role: regRole,
        termsAccepted: true,
        privacyAccepted: true
      });
      localStorage.setItem('medivault_token', res.token);
      localStorage.setItem('medivault_user', JSON.stringify(res.user));
      handleSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Error en el registro.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      setSuccessMsg(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setTab('reset');
      }
    } catch (err) {
      setError(err.message || 'Error al solicitar token');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.resetPassword({ token: resetToken, newPassword });
      setSuccessMsg(res.message);
      setTab('login');
    } catch (err) {
      setError(err.message || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setTab('login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at 50% 0%, #253852 0%, #192537 100%)', color: '#f8fafc', padding: '2rem 1rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <img
          src="/mediV.jpg"
          alt="MediVault Escudo con libreta y cruz"
          style={{ width: '88px', height: '88px', borderRadius: '18px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', margin: '0 auto 1rem', border: '2px solid #5A7B8C' }}
        />
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
          MediVault
        </h1>
        <p style={{ color: '#CBD5E1', fontSize: '1rem', maxWidth: '480px', margin: '0.25rem auto 0' }}>
          Bóveda Médica y Expediente Clínico de Alta Confidencialidad
        </p>
        <div style={{ display: 'inline-flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <span className="badge-crypto">
            <IconLock size={13} />
            Cifrado AES-256-GCM
          </span>
          <span className="badge-crypto">
            <IconShield size={13} />
            OWASP Top 10:2025
          </span>
          <span className="badge-crypto">
            Ley N.° 8968 Costa Rica
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '520px', width: '100%', margin: '0 auto', background: '#ffffff', color: '#303641', borderRadius: '20px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}>
        
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '1.5rem', gap: '1rem' }}>
          <button
            onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
            style={{ flex: 1, padding: '0.75rem', fontWeight: 700, border: 'none', background: 'none', borderBottom: tab === 'login' ? '3px solid #253852' : '3px solid transparent', color: tab === 'login' ? '#253852' : '#5A7B8C' }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); setSuccessMsg(''); }}
            style={{ flex: 1, padding: '0.75rem', fontWeight: 700, border: 'none', background: 'none', borderBottom: tab === 'register' ? '3px solid #1E293B' : '3px solid transparent', color: tab === 'register' ? '#1E293B' : '#64748B' }}
          >
            Registrarse
          </button>
          <button
            onClick={() => { setTab('forgot'); setError(''); setSuccessMsg(''); }}
            style={{ flex: 1, padding: '0.75rem', fontWeight: 700, border: 'none', background: 'none', borderBottom: tab === 'forgot' ? '3px solid #1E293B' : '3px solid transparent', color: tab === 'forgot' ? '#1E293B' : '#64748B', fontSize: '0.82rem' }}
          >
            Recuperar
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <IconAlert size={18} />
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            <IconCheck size={18} />
            <div>{successMsg}</div>
          </div>
        )}

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico Institucional o Personal</label>
              <input
                type="email"
                className="form-input"
                placeholder="ejemplo@medivault.cr"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Verificando con Bcrypt...' : 'Acceder al Expediente Seguro'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Mariana Gómez"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="paciente@medivault.cr"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Cédula / Documento (CR)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1-1849-0234"
                  required
                  value={regDoc}
                  onChange={(e) => setRegDoc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono Móvil</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+506 8888-1122"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Usuario (Rol)</label>
              <select className="form-select" value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                <option value="cliente">Paciente / Cliente (Expediente propio)</option>
                <option value="colaborador">Médico / Especialista de Salud</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña de Alta Seguridad</label>
              <input
                type="password"
                className="form-input"
                placeholder="Mínimo 8 car., Mayúscula, Número y Símbolo"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />

              <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem' }}>
                <span style={{ color: hasMinLength ? '#10B981' : '#94A3B8' }}>{hasMinLength ? '✓' : '○'} Mínimo 8 car.</span>
                <span style={{ color: hasUpper ? '#10B981' : '#94A3B8' }}>{hasUpper ? '✓' : '○'} Mayúscula (A-Z)</span>
                <span style={{ color: hasLower ? '#10B981' : '#94A3B8' }}>{hasLower ? '✓' : '○'} Minúscula (a-z)</span>
                <span style={{ color: hasNumber ? '#10B981' : '#94A3B8' }}>{hasNumber ? '✓' : '○'} Número (0-9)</span>
                <span style={{ color: hasSpecial ? '#10B981' : '#94A3B8' }}>{hasSpecial ? '✓' : '○'} Símbolo (@$!%*?)</span>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>
                Consentimiento Informado Obligatorio:
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <span>Acepto los <strong>Términos y Condiciones</strong> del Servicio y limitación de IA de MediVault.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <span>Acepto la <strong>Política de Privacidad y Tratamiento de Datos</strong> (Ley N.° 8968 de Costa Rica).</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !isPasswordValid || !termsAccepted || !privacyAccepted}>
              {loading ? 'Creando y Cifrando Perfil...' : 'Registrar Cuenta Segura'}
            </button>
          </form>
        )}

        {tab === 'forgot' && (
          <form onSubmit={handleForgot}>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
              Ingrese su correo para generar un token criptográfico de recuperación de un solo uso (SHA-256).
            </p>
            <div className="form-group">
              <label className="form-label">Correo Registrado</label>
              <input
                type="email"
                className="form-input"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Generando...' : 'Generar Token de Recuperación'}
            </button>
          </form>
        )}

        {tab === 'reset' && (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">Token de Recuperación</label>
              <input
                type="text"
                className="form-input"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <input
                type="password"
                className="form-input"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '2rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem', textAlign: 'center' }}>
            Acceso Rápido para Evaluación Docente
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '0.5rem' }}
              onClick={() => quickLogin('admin@medivault.cr', 'AdminPassword2026!')}
            >
              👩‍⚕️ <strong>Admin</strong> (Dra. Elena)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '0.5rem' }}
              onClick={() => quickLogin('medico@medivault.cr', 'MedicoPassword2026!')}
            >
              👨‍⚕️ <strong>Médico</strong> (Dr. Vargas)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '0.5rem' }}
              onClick={() => quickLogin('paciente@medivault.cr', 'PacientePassword2026!')}
            >
              🧑 <strong>Paciente</strong> (Mariana G.)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '0.5rem' }}
              onClick={() => quickLogin('auditor@medivault.cr', 'AuditorPassword2026!')}
            >
              📋 <strong>Auditor</strong> (Lic. Roberto)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AuthView;
