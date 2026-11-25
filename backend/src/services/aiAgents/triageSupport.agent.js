import { logAiExecution } from './aiLogger.js';

export async function executeTriageSupport({ symptoms, duration, vitalSigns, userId }) {
  const start = Date.now();
  const text = `${symptoms || ''} ${duration || ''}`.toLowerCase();

  let priorityLevel = 'Nivel 4 - Menor / Estándar (Verde)';
  let actionRecommendation = 'Consulta médica programada en las próximas 24 a 48 horas.';
  let isEmergency = false;

  if (
    text.includes('dolor de pecho') ||
    text.includes('opresion') ||
    text.includes('dificultad para respirar') ||
    text.includes('asfixia') ||
    text.includes('desmayo') ||
    text.includes('convulsion') ||
    text.includes('paralisis')
  ) {
    priorityLevel = 'Nivel 1 / 2 - EMERGENCIA INMEDIATA (Rojo / Naranja)';
    actionRecommendation = 'ALERTA: Debe acudir inmediatamente al servicio de emergencias hospitalario más cercano o llamar al 9-1-1.';
    isEmergency = true;
  } else if (
    text.includes('fiebre alta') ||
    text.includes('vomito persistente') ||
    text.includes('deshidratacion') ||
    text.includes('dolor abdominal agudo')
  ) {
    priorityLevel = 'Nivel 3 - Urgencia Médica Prioritaria (Amarillo)';
    actionRecommendation = 'Se recomienda valoración médica dentro de las próximas 4 a 6 horas.';
  } else if (text.includes('control') || text.includes('receta') || text.includes('chequeo')) {
    priorityLevel = 'Nivel 5 - No Urgente / Administrativo (Azul)';
    actionRecommendation = 'Trámite ambulatorio o cita de control rutinario programable.';
  }

  const result = {
    agent: 'Agente de Triage Clínico y Atención al Paciente',
    sintomasReportados: symptoms,
    duracionReportada: duration || 'No especificada',
    clasificacionTriage: priorityLevel,
    esEmergenciaVital: isEmergency,
    recomendacionAccion: actionRecommendation,
    cuidadosInmediatos: isEmergency
      ? 'No conduzca usted mismo; solicite asistencia de ambulancia o acompañamiento urgente.'
      : 'Mantenga reposo, hidratación constante y registre su temperatura o presión si dispone de tensiómetro en casa.',
    advertenciaLegal: 'Esta evaluación es un pre-triage informativo automatizado y no reemplaza el examen físico presencial de un profesional de la salud.'
  };

  await logAiExecution(
    'Triage Clínico',
    userId,
    `Síntomas: ${symptoms?.slice(0, 80)}`,
    `Triage: ${priorityLevel}`,
    Date.now() - start
  );

  return result;
}
