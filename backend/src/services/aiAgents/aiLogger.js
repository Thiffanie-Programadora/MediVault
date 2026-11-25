import { execute } from '../../config/db.js';
import { logger } from '../../config/logger.js';

export async function logAiExecution(agentName, userId, inputSummary, outputSummary, latencyMs) {
  try {
    await execute(
      `INSERT INTO ai_agent_logs (agent_name, user_id, input_summary, output_summary, latency_ms)
       VALUES (?, ?, ?, ?, ?)`,
      [
        agentName,
        userId || null,
        typeof inputSummary === 'string' ? inputSummary.slice(0, 500) : JSON.stringify(inputSummary).slice(0, 500),
        typeof outputSummary === 'string' ? outputSummary.slice(0, 500) : JSON.stringify(outputSummary).slice(0, 500),
        latencyMs
      ]
    );
  } catch (err) {
    logger.warn('Failed to record AI agent execution log', { error: err.message });
  }
}
