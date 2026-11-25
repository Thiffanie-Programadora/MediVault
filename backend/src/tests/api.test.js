import request from 'supertest';
import { app } from '../app.js';
import { initDatabaseSchema } from '../models/schema.js';
import { runDatabaseSeed } from '../models/seed.js';

let adminToken = '';
let doctorToken = '';
let patientToken = '';

beforeAll(async () => {
  await initDatabaseSchema();
  await runDatabaseSeed();

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@medivault.cr', password: 'AdminPassword2026!' });
  adminToken = adminRes.body.token;

  const doctorRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'medico@medivault.cr', password: 'MedicoPassword2026!' });
  doctorToken = doctorRes.body.token;

  const patientRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'paciente@medivault.cr', password: 'PacientePassword2026!' });
  patientToken = patientRes.body.token;
});

describe('MediVault API Security & Functional Suite', () => {

  describe('RF-08: Health Check Endpoint', () => {
    it('GET /health should respond 200 with status UP and without leaking runtime versions', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBeDefined();
      expect(res.body.version).toBeUndefined();
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('RF-01 & RF-02: Authentication & Password Policy', () => {
    it('should register a new patient user when password meets complexity', async () => {
      const randomEmail = `test_paciente_${Date.now()}@medivault.cr`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Carlos Ruiz',
          email: randomEmail,
          password: 'PasswordSeguro2026!#',
          doc: '1-1555-0888',
          phone: '+506 8777-6655',
          role: 'cliente',
          termsAccepted: true,
          privacyAccepted: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(randomEmail);
      expect(res.body.user.maskedDoc).toBe('***-***-0888');
    });

    it('should reject registration if password does not meet complexity (A07)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Usuario Débil',
          email: `debil_${Date.now()}@medivault.cr`,
          password: '123',
          doc: '1-1111-2222',
          phone: '+506 8000-0000',
          termsAccepted: true,
          privacyAccepted: true
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should fail login with invalid password and not leak whether email exists (A07)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@medivault.cr', password: 'WrongPassword2026!' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Credenciales inválidas');
    });
  });

  describe('RF-04 & A01: Encrypted Notes & Anti-IDOR Enforcement', () => {
    let createdNoteId;

    it('Patient should be able to create an encrypted private medical note', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          title: 'Historial de Alergias y Medicación',
          content: 'Alergia severa a Penicilina y derivados beta-lactámicos. Usar Macrólidos en caso de infección respiratoria.',
          category: 'diagnostico'
        });

      expect(res.status).toBe(201);
      expect(res.body.note.id).toBeDefined();
      expect(res.body.note.content_enc).toBeDefined();
      expect(res.body.note.content_enc).toContain('.');
      createdNoteId = res.body.note.id;
    });

    it('Patient should be able to read their own note and receive decrypted content', async () => {
      const res = await request(app)
        .get(`/api/notes/${createdNoteId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(res.body.note.content).toContain('Alergia severa a Penicilina');
    });

    it('IDOR TEST: Another user (Doctor) attempting to read Patient note directly should receive 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/notes/${createdNoteId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Acceso denegado');
    });

    it('IDOR TEST: Another user attempting to update Patient note should receive 403 Forbidden', async () => {
      const res = await request(app)
        .put(`/api/notes/${createdNoteId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ title: 'Título manipulado ilícitamente' });

      expect(res.status).toBe(403);
    });
  });

  describe('RF-03 & A01: Role-Based Access Control (RBAC)', () => {
    it('Patient should be forbidden (403) from accessing Admin Users list', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(403);
    });

    it('Admin should be authorized (200) to view Users list and Audit Logs', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toBeInstanceOf(Array);
      expect(res.body.users.length).toBeGreaterThan(0);
    });
  });

  describe('A05: Injection Resistance (SQLi & XSS)', () => {
    it('should resist SQL Injection in login payload (A05)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: "admin@medivault.cr' OR '1'='1",
          password: "' OR 1=1 --"
        });

      expect(res.status).toBe(400);
    });

    it('should store note with script tags safely without executing (XSS mitigation)', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          title: 'Prueba de Seguridad XSS',
          content: xssPayload,
          category: 'confidencial'
        });

      expect(res.status).toBe(201);
      const readRes = await request(app)
        .get(`/api/notes/${res.body.note.id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(readRes.body.note.content).toBe(xssPayload);
    });
  });

  describe('Section 7: AI Agents Functionality', () => {
    it('should list all 8 AI agents with role permissions', async () => {
      const res = await request(app)
        .get('/api/ai-agents')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.agents.length).toBe(8);
    });

    it('should execute Conversational RAG agent and return cited clinical sources', async () => {
      const res = await request(app)
        .post('/api/ai-agents/rag-clinical')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ query: '¿Cuáles son las pautas para el control de la hipertensión?' });

      expect(res.status).toBe(200);
      expect(res.body.result.answer).toBeDefined();
      expect(res.body.result.citedSources.length).toBeGreaterThan(0);
    });

    it('should execute Triage agent and classify symptoms with urgency level', async () => {
      const res = await request(app)
        .post('/api/ai-agents/triage-support')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ symptoms: 'Dolor de pecho opresivo y dificultad respiratoria', duration: '30 minutos' });

      expect(res.status).toBe(200);
      expect(res.body.result.esEmergenciaVital).toBe(true);
      expect(res.body.result.clasificacionTriage).toContain('EMERGENCIA INMEDIATA');
    });

    it('should forbid patient from executing restricted Admin Accounting agent (403)', async () => {
      const res = await request(app)
        .post('/api/ai-agents/accounting')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ period: 'Noviembre 2026' });

      expect(res.status).toBe(403);
    });
  });

  describe('Section 8: External APIs Consumption', () => {
    it('GET /api/external/exchange-rate should return BCCR currency rates', async () => {
      const res = await request(app)
        .get('/api/external/exchange-rate')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.compra).toBeDefined();
      expect(res.body.data.venta).toBeDefined();
    });

    it('GET /api/external/weather should return clinical environmental indices', async () => {
      const res = await request(app)
        .get('/api/external/weather')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.temperatura).toBeDefined();
      expect(res.body.data.alertaSanitaria).toBeDefined();
    });
  });
});
