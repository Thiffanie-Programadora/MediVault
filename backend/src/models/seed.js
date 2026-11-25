import { execute, queryOne, query } from '../config/db.js';
import { hashPassword, encryptData } from '../services/crypto.service.js';
import { logger } from '../config/logger.js';

export async function runDatabaseSeed() {
  logger.info('Starting database seeding...');

  // 1. Seed Roles
  const roles = [
    { name: 'admin', description: 'Administrador del sistema con control total y auditoría' },
    { name: 'user', description: 'Usuario estándar con acceso a su propia bóveda' },
    { name: 'usuario', description: 'Usuario estándar con acceso a su propia bóveda' },
    { name: 'colaborador', description: 'Médico o personal de salud asistencial' },
    { name: 'cliente', description: 'Paciente o usuario final con acceso a su expediente' },
    { name: 'auditor', description: 'Auditor de seguridad y cumplimiento normativo' }
  ];

  for (const r of roles) {
    const existing = queryOne('SELECT id FROM roles WHERE name = ?', [r.name]);
    if (!existing) {
      execute('INSERT INTO roles (name, description) VALUES (?, ?)', [r.name, r.description]);
    }
  }

  const roleMap = {};
  const allRoles = query('SELECT id, name FROM roles');
  allRoles.forEach(r => { roleMap[r.name] = r.id; });

  // 2. Seed Default Users
  const usersToSeed = [
    {
      name: 'Dr. Alejandro Soto (Admin)',
      email: 'admin@medivault.cr',
      password: 'AdminPassword2026!',
      role: 'admin',
      doc: '1-1122-3344',
      phone: '+506-8888-1111'
    },
    {
      name: 'Carlos Mendoza (Usuario)',
      email: 'user@medivault.cr',
      password: 'UserPassword2026!',
      role: 'user',
      doc: '3-0233-0455',
      phone: '+506-8888-5555'
    },
    {
      name: 'Dra. Elena Vargas (Médico)',
      email: 'medico@medivault.cr',
      password: 'MedicoPassword2026!',
      role: 'colaborador',
      doc: '2-0544-0899',
      phone: '+506-8888-2222'
    },
    {
      name: 'Carlos Solís (Paciente)',
      email: 'paciente@medivault.cr',
      password: 'PacientePassword2026!',
      role: 'cliente',
      doc: '1-1455-0677',
      phone: '+506-8888-3333'
    },
    {
      name: 'Licda. María Brenes (Auditora)',
      email: 'auditor@medivault.cr',
      password: 'AuditorPassword2026!',
      role: 'auditor',
      doc: '3-0233-0455',
      phone: '+506-8888-4444'
    }
  ];

  for (const u of usersToSeed) {
    const existingUser = queryOne('SELECT id FROM users WHERE email = ?', [u.email]);
    if (!existingUser) {
      const pwdHash = await hashPassword(u.password);
      const docEnc = encryptData(u.doc);
      const phoneEnc = encryptData(u.phone);
      const roleId = roleMap[u.role];

      const res = execute(
        `INSERT INTO users (name, email, password_hash, role_id, sensitive_document_enc, phone_enc, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [u.name, u.email, pwdHash, roleId, docEnc, phoneEnc]
      );

      // Seed consent
      execute(
        `INSERT INTO governance_consents (user_id, consent_type, accepted, ip_address, version)
         VALUES (?, 'PRIVACY_POLICY_LEY8968', 1, '127.0.0.1', '1.0')`,
        [res.lastInsertRowid]
      );
    }
  }

  // 3. Seed Sample Encrypted Clinical Notes
  const patientUser = queryOne('SELECT id FROM users WHERE email = ?', ['paciente@medivault.cr']);
  const doctorUser = queryOne('SELECT id FROM users WHERE email = ?', ['medico@medivault.cr']);

  if (patientUser) {
    const existingNotes = query('SELECT id FROM notes WHERE owner_id = ?', [patientUser.id]);
    if (existingNotes.length === 0) {
      execute(
        `INSERT INTO notes (owner_id, title, content_enc, category)
         VALUES (?, ?, ?, ?)`,
        [
          patientUser.id,
          'Evaluación Cardiometabólica de Control',
          encryptData('Paciente masculino de 42 años acude a chequeo de rutina. Presión arterial: 120/80 mmHg. Frecuencia cardíaca: 72 lpm. Perfil lipídico y glicemia en rangos normales. Se prescribe mantener actividad física aeróbica 150 min/semana y dieta hiposódica.'),
          'diagnostico'
        ]
      );

      execute(
        `INSERT INTO notes (owner_id, title, content_enc, category)
         VALUES (?, ?, ?, ?)`,
        [
          patientUser.id,
          'Receta Digital - Tratamiento Antihistamínico',
          encryptData('Levocetirizina 5mg comprimidos. Tomar 1 comprimido por vía oral cada 24 horas por la noche durante 10 días por rinitis alérgica estacional. Prohibida su duplicación no autorizada.'),
          'receta'
        ]
      );
    }
  }

  logger.info('Database seeding completed successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  import('./schema.js').then(async ({ initDatabaseSchema }) => {
    await initDatabaseSchema();
    await runDatabaseSeed();
    process.exit(0);
  });
}
