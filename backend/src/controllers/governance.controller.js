import { requestAccountDeletion } from '../services/governance.service.js';

export async function requestDeletion(req, res, next) {
  try {
    const { passwordConfirmation, reason } = req.body;
    const result = await requestAccountDeletion({
      userId: req.user.id,
      passwordConfirmation,
      reason,
      ip: req.ip
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getLegalInformation(req, res) {
  res.status(200).json({
    ley: 'Ley N.° 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales (Costa Rica)',
    responsable: 'MediVault Sistemas de Salud y Bóveda Segura S.A.',
    domicilio: 'San José, Costa Rica',
    derechosARCO: ['Acceso', 'Rectificación', 'Cancelación / Supresión', 'Oposición'],
    plazoRespuesta: '5 días hábiles conforme al Art. 15 de la Ley N.° 8968',
    contactoDPO: 'privacidad@medivault.cr'
  });
}
