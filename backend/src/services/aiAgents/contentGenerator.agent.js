import { logAiExecution } from './aiLogger.js';

export async function executeContentGenerator({ topic, targetAudience = 'pacientes', tone = 'cercano y profesional', userId }) {
  const start = Date.now();
  const theme = topic || 'Prevención de Enfermedades Cardiovasculares y Estilo de Vida Saludable';

  const campaign = {
    agent: 'Generador de Contenido Multimedia Clínico',
    campaña: `Campaña de Salud: ${theme}`,
    publicoObjetivo: targetAudience,
    tono: tone,
    articulosBoletin: [
      {
        titulo: `Cuide su bienestar: ${theme}`,
        extracto: `Adoptar pequeños hábitos cotidianos genera un impacto profundo en su calidad de vida. Conozca las recomendaciones de los especialistas de MediVault.`,
        puntosClave: [
          'Mantenga chequeos médicos preventivos semestrales.',
          'Consuma al menos 2 litros de agua diarios y reduzca el consumo de azúcares refinados.',
          'Priorice un descanso reparador de entre 7 y 8 horas diarias.'
        ]
      }
    ],
    redesSociales: {
      instagramPost: {
        caption: `💙 En MediVault, su salud es nuestra prioridad más valiosa. Hoy le compartimos 3 consejos indispensables sobre: ${theme}. ¡Agende su chequeo preventivo con nuestros especialistas! #SaludCostaRica #MediVault #Bienestar #MedicinaPreventiva`,
        callToAction: 'Consulte su expediente digital y notas clínicas en su portal MediVault.',
        sugerenciaGrafica: 'Imagen con escudo protector MediVault en azul pizarra (#1E293B) y fondo médico límpido.'
      },
      whatsappNewsletter: `🔔 *Boletín de Salud MediVault*: Estimado paciente, recuerde que la prevención es la clave de una vida plena. Consulte en nuestra plataforma sus últimos resultados de laboratorio y recomendaciones médicas actualizadas.`
    }
  };

  await logAiExecution(
    'Generador de Contenido',
    userId,
    `Tema: ${theme} / Audiencia: ${targetAudience}`,
    `Campaña generada para ${targetAudience} sobre ${theme}`,
    Date.now() - start
  );

  return campaign;
}
