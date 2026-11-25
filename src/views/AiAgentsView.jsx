import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IconBot, IconCheck, IconAlert, IconLock } from '../components/Icons';

export function AiAgentsView({ user }) {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentInput, setAgentInput] = useState('');
  const [running, setRunning] = useState(false);
  const [agentOutput, setAgentOutput] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchAgents();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.getAgents();
      setAgents(res.agents || []);
      if (res.agents && res.agents.length > 0) {
        const firstAccessible = res.agents.find(a => a.isAccessible) || res.agents[0];
        setSelectedAgent(firstAccessible);
        loadDefaultInput(firstAccessible.id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.getAiHistory();
      setHistory(res.history || []);
    } catch (err) {
      // ignore
    }
  };

  const loadDefaultInput = (agentId) => {
    setError('');
    setAgentOutput(null);

    switch (agentId) {
      case 'invoice-reader':
        setAgentInput(`Farmacia y Distribuidora Hospitalaria MediVault S.A.
Cédula Jurídica: 3-101-892341
Fecha: 2026-11-25
Línea 1: Reactivos químicos para laboratorio clínico - Cantidad: 10 - Subtotal: ₡120,000
Línea 2: Mascarillas quirúrgicas N95 - Cantidad: 50 - Subtotal: ₡25,000
Subtotal: ₡145,000
IVA (13%): ₡18,850
Monto Total: ₡163,850 CRC`);
        break;
      case 'rag-clinical':
        setAgentInput('¿Cuáles son las pautas farmacológicas y metas tensionales para pacientes hipertensos según los protocolos institucionales de MediVault?');
        break;
      case 'content-generator':
        setAgentInput('Prevención y detección temprana del cáncer de colon y hábitos alimenticios ricos en fibra');
        break;
      case 'accounting':
        setAgentInput('Conciliación del mes: 25 consultas ambulatorias por ₡650,000, 3 cirugías menores por ₡1,200,000, compra de suministros por $350 USD.');
        break;
      case 'hr-medical':
        setAgentInput('Dr. Roberto Mora. Médico y Cirujano con incorporación activa al Colegio de Médicos de Costa Rica (Código 14209). 6 años de experiencia en servicio de urgencias hospitalarias. Certificación vigente ACLS y BLS.');
        break;
      case 'triage-support':
        setAgentInput('Paciente masculino de 58 años presenta dolor opresivo retroesternal que irradia a mandíbula izquierda y sudoración profusa desde hace 45 minutos.');
        break;
      case 'data-analyst':
        setAgentInput('Análisis global de expedientes clínicos y distribución por especialidad médica.');
        break;
      case 'compliance-advisor':
        setAgentInput('Auditoría del flujo de consentimiento informado y política de retención de diagnósticos bajo la Ley N.° 8968 y la Ley General de Salud N.° 5395.');
        break;
      default:
        setAgentInput('');
    }
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    loadDefaultInput(agent.id);
  };

  const handleRunAgent = async () => {
    if (!selectedAgent) return;
    setRunning(true);
    setError('');
    setAgentOutput(null);

    let payload = {};
    if (selectedAgent.id === 'invoice-reader') {
      payload = { invoiceText: agentInput, currency: 'CRC' };
    } else if (selectedAgent.id === 'rag-clinical') {
      payload = { query: agentInput };
    } else if (selectedAgent.id === 'content-generator') {
      payload = { topic: agentInput, targetAudience: 'pacientes y familias' };
    } else if (selectedAgent.id === 'accounting') {
      payload = { period: 'Noviembre 2026' };
    } else if (selectedAgent.id === 'hr-medical') {
      payload = { candidateText: agentInput, targetPosition: 'Médico Especialista en Urgencias' };
    } else if (selectedAgent.id === 'triage-support') {
      payload = { symptoms: agentInput, duration: '45 minutos' };
    } else if (selectedAgent.id === 'data-analyst') {
      payload = { metricFocus: 'general' };
    } else if (selectedAgent.id === 'compliance-advisor') {
      payload = { documentOrProcessText: agentInput, standard: 'Ley 8968 Costa Rica' };
    }

    try {
      const res = await api.runAgent(selectedAgent.id, payload);
      setAgentOutput(res.result);
      fetchHistory();
    } catch (err) {
      setError(err.message || 'Error al ejecutar agente');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>
          Ecosistema de 8 Agentes de Inteligencia Artificial
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
          Módulo requerido (Sección 7): Control de acceso por roles en servidor, auditoría en BD y lógica de negocio clínica.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <IconAlert size={18} />
          <div>{error}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {agents.map((agent) => {
          const isSelected = selectedAgent?.id === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => handleSelectAgent(agent)}
              style={{
                background: isSelected ? '#F0F9FF' : '#FFFFFF',
                border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.15)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>
                  {agent.category}
                </span>

                {agent.isAccessible ? (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                    Disponible
                  </span>
                ) : (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991B1B', background: '#FEE2E2', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <IconLock size={10} /> Bloqueado
                  </span>
                )}
              </div>

              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                {agent.name}
              </h4>

              <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                {agent.description}
              </p>

              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                Roles: <strong>{agent.allowedRoles.join(', ')}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {selectedAgent && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ background: '#0284C7', color: '#ffffff', padding: '0.5rem', borderRadius: '8px' }}>
                <IconBot size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>
                  Consola: {selectedAgent.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Categoría: {selectedAgent.category} | Su Rol: <strong>{user.role}</strong>
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => loadDefaultInput(selectedAgent.id)}
            >
              Restaurar Ejemplo
            </button>
          </div>

          {!selectedAgent.isAccessible ? (
            <div className="alert alert-error">
              <IconLock size={20} />
              <div>
                <strong>Acceso Denegado por Rol (A01):</strong> Este agente está reservado para los roles: <code>{selectedAgent.allowedRoles.join(', ')}</code>. Su rol actual es <code>{user.role}</code>. Puede cambiar de usuario usando los botones de prueba en el Login o solicitar cambio de rol al administrador.
              </div>
            </div>
          ) : (
            <div>
              <div className="form-group">
                <label className="form-label">
                  Parámetros de Entrada para el Agente ({selectedAgent.name}):
                </label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                />
              </div>

              <button
                className="btn btn-accent"
                onClick={handleRunAgent}
                disabled={running}
                style={{ width: '100%', marginBottom: '1.5rem' }}
              >
                <IconBot size={18} />
                <span>{running ? 'Procesando con IA...' : `Ejecutar ${selectedAgent.name}`}</span>
              </button>

              {agentOutput && (
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IconCheck size={18} style={{ color: '#10B981' }} />
                      Resultado del Agente (Auditado en BD):
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Registro de trazabilidad y auditoría clínica guardado
                    </span>
                  </div>

                  {selectedAgent.id === 'triage-support' && (
                    <div style={{ background: agentOutput.esEmergenciaVital ? '#FEF2F2' : '#EFF6FF', border: `1px solid ${agentOutput.esEmergenciaVital ? '#F87171' : '#93C5FD'}`, padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      <h4 style={{ color: agentOutput.esEmergenciaVital ? '#B91C1C' : '#1D4ED8', fontWeight: 800 }}>
                        {agentOutput.clasificacionTriage}
                      </h4>
                      <p style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>
                        {agentOutput.recomendacionAccion}
                      </p>
                    </div>
                  )}

                  {selectedAgent.id === 'rag-clinical' && agentOutput.citedSources && (
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.95rem', color: '#1E293B', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                        {agentOutput.answer}
                      </p>
                      <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                        <strong>📚 Fuentes Clínicas Citadas (RAG):</strong>
                        {agentOutput.citedSources.map((s, idx) => (
                          <div key={idx} style={{ color: '#0284C7', marginTop: '3px' }}>
                            • [{s.id}] {s.source}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <pre style={{ background: '#0F172A', color: '#38BDF8', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto', maxHeight: '300px' }}>
                    {JSON.stringify(agentOutput, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
          Bitácora de Ejecución de Agentes de IA (Últimas Actividades)
        </h3>

        {history.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '0.88rem' }}>No hay registros de IA previos.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agente</th>
                  <th>Entrada (Resumen)</th>
                  <th>Salida (Resumen)</th>
                  <th>Latencia</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 8).map((h) => (
                  <tr key={h.id}>
                    <td><strong>{h.agent_name}</strong></td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.input_summary}
                    </td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.output_summary}
                    </td>
                    <td>{h.latency_ms} ms</td>
                    <td style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {new Date(h.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AiAgentsView;
