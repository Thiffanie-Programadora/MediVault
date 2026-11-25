import {
  AI_AGENTS_METADATA,
  executeInvoiceReader,
  executeRagClinical,
  executeContentGenerator,
  executeAccountingAgent,
  executeHrMedical,
  executeTriageSupport,
  executeDataAnalyst,
  executeComplianceAdvisor,
  getAiExecutionHistory
} from '../services/aiAgents/index.js';

export async function listAgents(req, res) {
  const userRole = req.user ? req.user.role : 'cliente';
  const available = AI_AGENTS_METADATA.map(agent => ({
    ...agent,
    isAccessible: agent.allowedRoles.includes(userRole)
  }));

  res.status(200).json({
    success: true,
    userRole,
    agents: available
  });
}

export async function runAgent(req, res, next) {
  try {
    const { agentId } = req.params;
    const agentDef = AI_AGENTS_METADATA.find(a => a.id === agentId);

    if (!agentDef) {
      return res.status(404).json({
        success: false,
        error: `Agente de IA '${agentId}' no encontrado.`
      });
    }

    if (!agentDef.allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Acceso denegado: El rol '${req.user.role}' no tiene autorización para ejecutar el agente '${agentDef.name}'. Roles permitidos: ${agentDef.allowedRoles.join(', ')}`
      });
    }

    let output = null;
    const userId = req.user.id;
    const body = req.body || {};

    switch (agentId) {
      case 'invoice-reader':
        output = await executeInvoiceReader({ ...body, userId });
        break;
      case 'rag-clinical':
        output = await executeRagClinical({ ...body, userId, userRole: req.user.role });
        break;
      case 'content-generator':
        output = await executeContentGenerator({ ...body, userId });
        break;
      case 'accounting':
        output = await executeAccountingAgent({ ...body, userId });
        break;
      case 'hr-medical':
        output = await executeHrMedical({ ...body, userId });
        break;
      case 'triage-support':
        output = await executeTriageSupport({ ...body, userId });
        break;
      case 'data-analyst':
        output = await executeDataAnalyst({ ...body, userId });
        break;
      case 'compliance-advisor':
        output = await executeComplianceAdvisor({ ...body, userId });
        break;
      default:
        return res.status(400).json({ success: false, error: 'Agente no implementado' });
    }

    res.status(200).json({
      success: true,
      agentId,
      agentName: agentDef.name,
      result: output
    });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const history = await getAiExecutionHistory(req.user.id);
    res.status(200).json({
      success: true,
      history
    });
  } catch (err) {
    next(err);
  }
}
