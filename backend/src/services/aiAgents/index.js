import { executeInvoiceReader } from './invoiceReader.agent.js';
import { executeRagClinical } from './ragClinical.agent.js';
import { executeContentGenerator } from './contentGenerator.agent.js';
import { executeAccountingAgent } from './accounting.agent.js';
import { executeHrMedical } from './hrMedical.agent.js';
import { executeTriageSupport } from './triageSupport.agent.js';
import { executeDataAnalyst } from './dataAnalyst.agent.js';
import { executeComplianceAdvisor } from './complianceAdvisor.agent.js';
import { query } from '../../config/db.js';

export const AI_AGENTS_METADATA = [
  {
    id: 'invoice-reader',
    name: 'Lector y Extractor de Facturas Médicas',
    description: 'Extrae automáticamente emisor, fecha, montos e IVA 13% de facturas electrónicas o comprobantes de salud.',
    allowedRoles: ['admin', 'colaborador'],
    category: 'Finanzas y Operaciones',
    inputSchema: { invoiceText: 'string', currency: 'CRC|USD' }
  },
  {
    id: 'rag-clinical',
    name: 'Asistente Conversacional Clínico con RAG',
    description: 'Responde consultas médicas y de confidencialidad consultando protocolos clínicos institucionales y citando fuentes.',
    allowedRoles: ['cliente', 'colaborador', 'admin'],
    category: 'Asistencia Médica',
    inputSchema: { query: 'string' }
  },
  {
    id: 'content-generator',
    name: 'Generador de Contenido y Campañas de Salud',
    description: 'Redacta boletines educativos, pautas preventivas y publicaciones de salud para pacientes y redes.',
    allowedRoles: ['admin', 'colaborador'],
    category: 'Comunicación',
    inputSchema: { topic: 'string', targetAudience: 'string' }
  },
  {
    id: 'accounting',
    name: 'Agente Contable y Conciliación Financiera',
    description: 'Clasifica ingresos y gastos médicos, concilia con el tipo de cambio del BCCR y calcula márgenes operativos.',
    allowedRoles: ['admin'],
    category: 'Finanzas',
    inputSchema: { transactions: 'array', period: 'string' }
  },
  {
    id: 'hr-medical',
    name: 'Agente de RRHH Médico y Evaluación de Perfiles',
    description: 'Analiza currículums frente a perfiles asistenciales, turnos y acreditación del Colegio de Médicos.',
    allowedRoles: ['admin', 'colaborador'],
    category: 'Recursos Humanos',
    inputSchema: { candidateText: 'string', targetPosition: 'string' }
  },
  {
    id: 'triage-support',
    name: 'Agente de Triage Clínico y Atención al Paciente',
    description: 'Clasifica la urgencia de síntomas (Escala de Triage), prioriza la atención y genera recomendaciones inmediatas.',
    allowedRoles: ['cliente', 'colaborador', 'admin'],
    category: 'Atención al Paciente',
    inputSchema: { symptoms: 'string', duration: 'string' }
  },
  {
    id: 'data-analyst',
    name: 'Analista de Datos y Reportes Epidemiológicos',
    description: 'Interpreta tendencias estadísticas, volumen de diagnósticos y ocupación clínica en lenguaje natural.',
    allowedRoles: ['admin', 'colaborador', 'auditor'],
    category: 'Analítica',
    inputSchema: { metricFocus: 'string' }
  },
  {
    id: 'compliance-advisor',
    name: 'Asistente de Cumplimiento Normativo (Ley 8968 / OWASP)',
    description: 'Audita procesos y expedientes frente a la Ley N.° 8968, HIPAA y las diez categorías del OWASP Top 10:2025.',
    allowedRoles: ['admin', 'auditor'],
    category: 'Gobernanza y Cumplimiento',
    inputSchema: { documentOrProcessText: 'string', standard: 'string' }
  }
];

export async function getAiExecutionHistory(userId, limit = 20) {
  return query(
    `SELECT id, agent_name, input_summary, output_summary, latency_ms, created_at
     FROM ai_agent_logs
     WHERE user_id = ? OR user_id IS NULL
     ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
}

export {
  executeInvoiceReader,
  executeRagClinical,
  executeContentGenerator,
  executeAccountingAgent,
  executeHrMedical,
  executeTriageSupport,
  executeDataAnalyst,
  executeComplianceAdvisor
};
