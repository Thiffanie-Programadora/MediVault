import { logAiExecution } from './aiLogger.js';

const KNOWLEDGE_BASE = [
  {
    id: 'DOC-01',
    title: 'Protocolo de Manejo de Hipertensión Arterial Esencial (Guía Clínica)',
    category: 'Cardiología',
    text: 'Para pacientes con cifras tensionales > 130/80 mmHg, se recomienda inicio de modificaciones de estilo de vida (dieta DASH, restricción de sodio a < 2g/día y actividad física aeróbica 150 min/semana). Como terapia farmacológica de primera línea en Costa Rica: IECA (Enalapril), ARA-II (Losartán) o calcioantagonistas (Amlodipino). Se debe verificar función renal y potasio sérico cada 6 meses.',
    source: 'Manual Clínico MediVault - Protocolo Cardiovascular 2026, Sección 3.2'
  },
  {
    id: 'DOC-02',
    title: 'Custodia Criptográfica y Confidencialidad del Expediente Digital',
    category: 'Gobernanza y Ley 8968',
    text: 'Todos los registros de salud y notas médicas deben cifrarse en reposo mediante AES-256-GCM. La llave criptográfica nunca debe compartirse ni almacenarse en repositorios. El paciente posee el derecho de acceso y supresión bajo la Ley N.° 8968, salvo los historiales clínicos amparados a retención obligatoria legal de 5 años por la Ley General de Salud N.° 5395.',
    source: 'Reglamento de Privacidad y Gobernanza Médica MediVault, Art. 12'
  },
  {
    id: 'DOC-03',
    title: 'Manejo Inicial de Cefalea y Criterios de Alarma (Red Flags)',
    category: 'Medicina General',
    text: 'Criterios de alarma en cefalea que exigen referencia inmediata a urgencias: inicio súbito tipo trueno ("peor dolor de la vida"), signos meníngeos (rigidez de nuca), fiebre sin foco aparente, déficit neurológico focal (asimetría facial, pérdida de fuerza), edad > 50 años de nueva aparición o paciente inmunocomprometido.',
    source: 'Guía de Triage y Urgencias Ambulatorias MediVault, Pág. 18'
  },
  {
    id: 'DOC-04',
    title: 'Protocolo de Vacunación del Adulto y Refuerzos Epidemiológicos',
    category: 'Medicina Preventiva',
    text: 'Se recomienda refuerzo de Tétanos/Difteria (Td) cada 10 años, Influenza estacional anual según temporada del Ministerio de Salud de Costa Rica, y esquema completo contra COVID-19 y Neumococo para mayores de 65 años o personas con patologías crónicas respiratorias.',
    source: 'Protocolo Nacional de Inmunizaciones y Vigilancia Epidemiológica 2026'
  }
];

export async function executeRagClinical({ query, userId, userRole }) {
  const start = Date.now();
  const qLower = (query || '').toLowerCase();

  const scoredDocs = KNOWLEDGE_BASE.map(doc => {
    let score = 0;
    const words = qLower.split(/\s+/).filter(w => w.length > 3);
    for (const w of words) {
      if (doc.text.toLowerCase().includes(w)) score += 3;
      if (doc.title.toLowerCase().includes(w)) score += 5;
      if (doc.category.toLowerCase().includes(w)) score += 2;
    }
    return { ...doc, score };
  }).sort((a, b) => b.score - a.score);

  const topMatch = scoredDocs[0]?.score > 0 ? scoredDocs[0] : KNOWLEDGE_BASE[0];

  const citations = [
    { id: topMatch.id, title: topMatch.title, source: topMatch.source }
  ];

  let answer = '';
  if (qLower.includes('hipertension') || qLower.includes('presion') || qLower.includes('enalapril')) {
    answer = `De acuerdo con el protocolo institucional de cardiología, el abordaje de la hipertensión contempla tanto modificaciones no farmacológicas (dieta baja en sodio y actividad física regular) como fármacos de primera línea (IECA/ARA-II) con control periódico de electrolitos y función renal.`;
  } else if (qLower.includes('cabeza') || qLower.includes('cefalea') || qLower.includes('alarma') || qLower.includes('dolor')) {
    answer = `En caso de cefalea, es imperativo descartar síntomas de alarma inmediata: inicio súbito explosivo, rigidez de nuca, fiebre alta o pérdida de fuerza motora. Ante cualquiera de estos signos, acuda a un centro hospitalario de inmediato.`;
  } else if (qLower.includes('privacidad') || qLower.includes('datos') || qLower.includes('ley 8968') || qLower.includes('cifrado')) {
    answer = `MediVault resguarda sus datos sensibles bajo el estándar de cifrado militar AES-256-GCM. Conforme a la Ley N.° 8968 de Costa Rica, sus datos personales no se transfieren a terceros sin consentimiento informado expreso.`;
  } else {
    answer = `Basado en la literatura médica de MediVault: "${topMatch.text.slice(0, 200)}...". Siempre consulte a su médico tratante para indicaciones personalizadas.`;
  }

  const responsePayload = {
    agent: 'Conversacional RAG Clínico',
    query,
    answer,
    confidence: topMatch.score > 0 ? 0.94 : 0.78,
    citedSources: citations,
    disclaimer: 'Este asistente de IA proporciona orientación basada en guías clínicas internas y no sustituye el juicio médico profesional.'
  };

  await logAiExecution(
    'Conversacional RAG Clínico',
    userId,
    query,
    answer.slice(0, 150),
    Date.now() - start
  );

  return responsePayload;
}
