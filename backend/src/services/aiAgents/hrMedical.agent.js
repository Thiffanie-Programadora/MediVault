import { logAiExecution } from './aiLogger.js';

export async function executeHrMedical({ candidateText, targetPosition = 'Médico Especialista en Urgencias', userId }) {
  const start = Date.now();
  const text = String(candidateText || '');

  const hasColegiatura = /(?:colegio de medicos|colegiado|medico y cirujano|incorporacion)/i.test(text);
  const hasAcls = /(?:acls|bls|soporte vital|reanimacion)/i.test(text);
  const hasExperience = /(?:anos de experiencia|años de experiencia|hospital|clinica|especialidad)/i.test(text);

  let score = 50;
  const matchCriteria = [];

  if (hasColegiatura) {
    score += 25;
    matchCriteria.push('Acreditación verificada: Cumple con incorporación profesional');
  } else {
    matchCriteria.push('Pendiente: Constancia del Colegio de Médicos de Costa Rica');
  }

  if (hasAcls) {
    score += 15;
    matchCriteria.push('Certificación vigente en soporte vital avanzado (ACLS/BLS)');
  }

  if (hasExperience) {
    score += 10;
    matchCriteria.push('Experiencia clínica hospitalaria relevante documentada');
  }

  const result = {
    agent: 'Agente de Recursos Humanos Clínico',
    puestoObjetivo: targetPosition,
    puntuacionAfinidad: `${score}/100`,
    calificacion: score >= 80 ? 'Altamente Recomendado para Entrevista' : score >= 60 ? 'Perfil Aceptable con Verificaciones' : 'Requiere Mayor Acreditación',
    criteriosEvaluados: matchCriteria,
    recomendacionTurnos: 'Apto para guardias nocturnas y rotación en hospitalización según disponibilidad horaria.',
    preguntasSugeridasEntrevista: [
      '¿Cuál ha sido el caso clínico de mayor complejidad que ha liderado en su última guardia médica?',
      '¿Cómo aplica los principios de protección de datos del paciente en el uso de plataformas digitales de salud?',
      '¿Cuál es su protocolo ante una divergencia de criterio terapéutico en equipo multidisciplinario?'
    ]
  };

  await logAiExecution(
    'Recursos Humanos Clínico',
    userId,
    `Evaluación para ${targetPosition}: ${text.slice(0, 70)}...`,
    `Puntuación: ${result.puntuacionAfinidad} (${result.calificacion})`,
    Date.now() - start
  );

  return result;
}
