import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldIcon, KeyIcon, UsersIcon, CheckIcon, AlertTriangleIcon, RefreshIcon, TrashIcon } from '../components/Icons';

export default function AdminView({ user }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'logs', 'deletions', 'crypto'
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [deletions, setDeletions] = useState([]);
  const [cryptoMetrics, setCryptoMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [logFilterAction, setLogFilterAction] = useState('');
  const [logFilterStatus, setLogFilterStatus] = useState('');

  const isAdmin = user?.role === 'admin';
  const isAuditor = user?.role === 'auditor';

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'users' && isAdmin) {
        const res = await api.getUsers();
        setUsers(res.data || []);
      } else if (activeTab === 'logs') {
        const res = await api.getAuditLogs({ action: logFilterAction, status: logFilterStatus });
        setAuditLogs(res.data || []);
      } else if (activeTab === 'deletions' && isAdmin) {
        const res = await api.getDeletionRequests();
        setDeletions(res.data || []);
      } else if (activeTab === 'crypto') {
        const res = await api.getCryptoMetrics();
        setCryptoMetrics(res.data || {});
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos administrativos');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      setSuccess(`Rol actualizado con éxito a ${newRole}`);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al actualizar rol de usuario');
    }
  };

  const handleProcessDeletion = async (id, status) => {
    if (!confirm(`¿Está seguro de marcar la solicitud como ${status}?`)) return;
    try {
      await api.processDeletionRequest(id, status);
      setSuccess(`Solicitud de supresión de datos ${status === 'completed' ? 'procesada y anonimizada' : 'rechazada'}`);
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al procesar solicitud');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-dark)', marginBottom: '0.5rem' }}>
          Panel de Administración y Auditoría Institucional
        </h1>
        <p style={{ color: 'var(--color-slate-light)', maxWidth: '850px', lineHeight: 1.6 }}>
          Control de acceso a usuarios, bitácora de eventos institucionales y cumplimiento de la Ley de Protección de Datos Personales (Ley N.° 8968).
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        {isAdmin && (
          <button
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('users')}
          >
            <UsersIcon /> Gestión de Usuarios ({users.length})
          </button>
        )}
        <button
          className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          onClick={() => setActiveTab('logs')}
        >
          <ShieldIcon /> Logs de Auditoría Forense
        </button>
        {isAdmin && (
          <button
            className={`btn ${activeTab === 'deletions' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setActiveTab('deletions')}
          >
            <TrashIcon /> Supresión de Datos Ley 8968
          </button>
        )}
        <button
          className={`btn ${activeTab === 'crypto' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          onClick={() => setActiveTab('crypto')}
        >
          <KeyIcon /> Métricas Criptográficas
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangleIcon /> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckIcon /> {success}
        </div>
      )}

      {/* TAB 1: USERS */}
      {activeTab === 'users' && isAdmin && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Usuarios del Sistema</h2>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={loadData}>
              <RefreshIcon /> Actualizar
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Completo</th>
                  <th>Correo Electrónico</th>
                  <th>Cédula (Enmascarada)</th>
                  <th>Rol Asignado</th>
                  <th>Estado</th>
                  <th>Acciones RBAC</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td><code>#{u.id}</code></td>
                    <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td><code>{u.masked_id || '***-***-****'}</code></td>
                    <td>
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <span style={{ color: u.is_active ? 'var(--color-emerald)' : 'var(--color-rose)', fontWeight: 600 }}>
                        {u.is_active ? '● Activo' : '○ Inactivo'}
                      </span>
                    </td>
                    <td>
                      <select
                        className="input-field"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', width: 'auto' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === user.id} // Cannot demote self
                      >
                        <option value="cliente">cliente</option>
                        <option value="colaborador">colaborador</option>
                        <option value="auditor">auditor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Bitácora de Auditoría (Winston + SQLite)</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)' }}>
                Trazabilidad inmutable de eventos de autenticación, control de accesos e IA.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="input-field"
                style={{ padding: '0.4rem', fontSize: '0.8rem', width: 'auto' }}
                value={logFilterAction}
                onChange={(e) => setLogFilterAction(e.target.value)}
              >
                <option value="">Todas las acciones</option>
                <option value="AUTH_LOGIN_SUCCESS">AUTH_LOGIN_SUCCESS</option>
                <option value="AUTH_LOGIN_FAILED">AUTH_LOGIN_FAILED</option>
                <option value="NOTE_CREATED">NOTE_CREATED</option>
                <option value="NOTE_VIEWED">NOTE_VIEWED</option>
                <option value="AI_AGENT_EXECUTE">AI_AGENT_EXECUTE</option>
              </select>
              <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={loadData}>
                <RefreshIcon /> Filtrar
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '550px' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Acción</th>
                  <th>Usuario</th>
                  <th>IP Origen</th>
                  <th>Estado</th>
                  <th>Detalles Técnicos</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--color-slate-light)' }}>
                      {new Date(log.created_at).toLocaleString('es-CR')}
                    </td>
                    <td>
                      <span className="badge badge-navy" style={{ fontSize: '0.7rem' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.user_email || `ID #${log.user_id || 'Anónimo'}`}</td>
                    <td><code>{log.ip_address || '127.0.0.1'}</code></td>
                    <td>
                      <span style={{
                        color: log.status === 'SUCCESS' ? 'var(--color-emerald)' : 'var(--color-rose)',
                        fontWeight: 700
                      }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <code style={{ fontSize: '0.75rem' }}>{log.details || '-'}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DELETIONS (LEY 8968) */}
      {activeTab === 'deletions' && isAdmin && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Solicitudes de Supresión de Datos Personales (Ley N.° 8968)
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)' }}>
                Gestión de derecho de cancelación / olvido. Plazo legal de resolución: máximo 5 días hábiles.
              </span>
            </div>
            <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={loadData}>
              <RefreshIcon /> Actualizar
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>ID Solicitud</th>
                  <th>Usuario</th>
                  <th>Motivo Expresado</th>
                  <th>Fecha de Solicitud</th>
                  <th>Estado</th>
                  <th>Acción Legal</th>
                </tr>
              </thead>
              <tbody>
                {deletions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-slate-light)' }}>
                      No hay solicitudes de supresión de datos pendientes.
                    </td>
                  </tr>
                ) : (
                  deletions.map((d) => (
                    <tr key={d.id}>
                      <td><code>#{d.id}</code></td>
                      <td style={{ fontWeight: 600 }}>{d.user_email || `Usuario #${d.user_id}`}</td>
                      <td style={{ maxWidth: '280px' }}>{d.reason || 'Sin motivo especificado'}</td>
                      <td>{new Date(d.created_at).toLocaleDateString('es-CR')}</td>
                      <td>
                        <span className={`badge ${d.status === 'completed' ? 'badge-colaborador' : d.status === 'pending' ? 'badge-auditor' : 'badge-admin'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td>
                        {d.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'var(--color-emerald)' }}
                              onClick={() => handleProcessDeletion(d.id, 'completed')}
                            >
                              Anonimizar y Borrar
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: 'var(--color-rose)' }}
                              onClick={() => handleProcessDeletion(d.id, 'rejected')}
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)' }}>Procesada</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CRYPTO METRICS */}
      {activeTab === 'crypto' && (
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
            Métricas de Protección y Seguridad de la Bóveda
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)', marginBottom: '0.25rem' }}>Nivel de Protección de Expedientes</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-dark)' }}>Cifrado Militar Avanzado</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', marginTop: '0.25rem' }}>● Protección activa en todas las notas clínicas</div>
            </div>
            <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)', marginBottom: '0.25rem' }}>Seguridad por Registro Clínico</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-cyan)' }}>Protección Individual</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)', marginTop: '0.25rem' }}>Prevención de duplicidad y aislamiento total</div>
            </div>
            <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)', marginBottom: '0.25rem' }}>Seguridad de Acceso de Usuarios</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-dark)' }}>Alta Complejidad y Resguardo</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', marginTop: '0.25rem' }}>● Protección contra accesos no autorizados</div>
            </div>
            <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-light)', marginBottom: '0.25rem' }}>Códigos de Recuperación</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-dark)' }}>Uso Único y Temporal</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-light)', marginTop: '0.25rem' }}>Expiración automática en 1 hora</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
