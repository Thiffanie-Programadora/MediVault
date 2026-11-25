# 🛡️ MediVault - Bóveda Médica y Expediente Clínico Seguro

> **Plataforma Hospitalaria Full-Stack de Alta Seguridad Criptográfica**  
> *Cumplimiento estricto de **OWASP Top 10:2025**, Cifrado en Reposo **AES-256-GCM**, Hashing **Bcrypt (costo 12)** y Gobernanza de Datos de Salud (**Ley N.° 8968 de Costa Rica**).*

---

## 🎨 1. Identidad Visual y Paleta de Colores Oficial

MediVault implementa rigurosamente la identidad de marca aprobada basada en el logotipo oficial (`mediV.jpg` / escudo con libreta y cruz médica):

| Elemento / Rol de Color | Valor HEX | Aplicación en la Interfaz MediVault |
| :--- | :--- | :--- |
| **Azul Marino Profundo** | `#253852` | Color principal de marca, encabezados, barra de navegación, botones primarios y badges de alta seguridad. |
| **Azul Pizarra / Gris Azulado** | `#5A7B8C` | Acentos visuales, bordes de separación, botones secundarios, iconos y estados de foco interactivo. |
| **Gris Carbón Oscuro** | `#303641` | Tipografía principal, cuerpos de texto, tablas y datos estructurados de alta legibilidad. |
| **Blanco Superficie Limpia** | `#F9FAFB` | Fondo general de la plataforma (`--bg-main`), creando una atmósfera clínica aséptica y sobria. |
| **Blanco Puro** | `#FFFFFF` | Contenedores modulares, tarjetas de notas médicas, ventanas modales y formularios (`--bg-card`). |
| **Estados Semánticos Suaves** | `#2E7D32` (Éxito)<br>`#EF6C00` (Alerta)<br>`#C62828` (Peligro) | Badges de estado, notificaciones toast y alertas sin romper la sobriedad cromática institucional. |

---

## 🏗️ 2. Arquitectura del Sistema

MediVault está construido bajo una arquitectura por capas desacoplada:

```
                          [ Cliente Web React 19 + Vite ]
                                        │
                         (HTTPS / TLS 1.3 - Let's Encrypt)
                                        │
                       [ Reverse Proxy / PaaS Ingress ]
                                        │ (trust proxy)
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │          Express Security Engine          │
                  │  • Helmet (CSP estricta, anti-clickjacking)│
                  │  • Rate Limiting (Anti-fuerza bruta)      │
                  │  • Cookie-Parser (HttpOnly, SameSite=Lax) │
                  │  • Zod (Validación de esquemas estricta)  │
                  └─────────────────────┬─────────────────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            ▼                           ▼                           ▼
  [ Módulo Criptográfico ]      [ Módulo de Negocio ]      [ Módulo de Gobernanza ]
  • AES-256-GCM (12B IV, 16B Tag) • CRUD Notas Médicas     • Ley N.° 8968 (Costa Rica)
  • Bcrypt (Costo 12)           • RBAC (admin/médico/user)  • Consentimiento explícito
  • SHA-256 Tokens              • 8 Agentes de IA           • Derecho al olvido / supresión
  • HMAC-SHA256 Firma           • APIs BCCR / Hacienda      • Enmascaramiento PII (***-1234)
            │                           │                           │
            └───────────────────────────┼───────────────────────────┘
                                        ▼
                   [ Relational Database: node:sqlite ]
                       (Prepared Statements 100% Anti-SQLi)
```

---

## 🔒 3. Matriz de Cumplimiento OWASP Top 10:2025

| Categoría OWASP Top 10:2025 | Implementación Técnica en MediVault | Ubicación en el Código |
| :--- | :--- | :--- |
| **A01: Broken Access Control (incluye SSRF)** | Middleware RBAC en servidor (`requireRoles`). Verificación forzosa anti-IDOR `WHERE owner_id = ?` (lanza 403 Forbidden ante intentos de acceso cruzado). Denegación por defecto (Fail Closed). Lista blanca estricta para peticiones salientes (BCCR, Hacienda, Open-Meteo). | `backend/src/services/notes.service.js`<br>`backend/src/middlewares/role.middleware.js` |
| **A02: Security Misconfiguration** | `helmet` con Content Security Policy (CSP) que bloquea scripts no autorizados; `app.disable('x-powered-by')`; cookies con `HttpOnly` y `Secure` en producción; supresión total de stack traces al cliente. | `backend/src/app.js`<br>`backend/src/controllers/auth.controller.js` |
| **A03: Software Supply Chain Failures** | Determinismo estricto con `package-lock.json` y `npm ci`. Motor nativo `node:sqlite` sin paquetes vulnerables ni dependencias de compilación. Escaneo automatizado con `npm audit` (**0 vulnerabilidades reportadas**). Configuración de `.github/dependabot.yml`. | `backend/package.json`<br>`.github/workflows/ci.yml` |
| **A04: Cryptographic Failures** | Claves maestras inyectadas vía variables de entorno. Hashing con `bcrypt` (factor de costo 12). Cifrado simétrico autenticado `AES-256-GCM` con IV aleatorio de 12 bytes por registro y tag de autenticación de 16 bytes. Hashing SHA-256 para tokens de restablecimiento de contraseña. | `backend/src/services/crypto.service.js`<br>`backend/src/config/env.js` |
| **A05: Injection (incluye XSS y SQLi)** | Consultas SQL 100% parametrizadas mediante sentencias preparadas de `node:sqlite` (`stmt.all(...params)`). Validación rigurosa de entradas antes de controladores con `zod`. Escape automático en React contra XSS. | `backend/src/config/db.js`<br>`backend/src/middlewares/schemas.js` |
| **A06: Insecure Design** | Modelado formal de amenazas STRIDE. Límites de negocio estrictos: máximo 50 notas por usuario y 50,000 caracteres por nota para prevenir denegación de servicio por agotamiento de recursos. | `backend/src/services/notes.service.js` |
| **A07: Authentication Failures** | Limitación de tasa de intentos (`express-rate-limit`) en login (10 por 15 min). Bloqueo de cuenta a nivel de BD tras 5 fallos consecutivos (`lock_until`). Respuestas genéricas anti-enumeración de usuarios. Tokens JWT con algoritmo forzoso `HS256` y expiración de 1 hora. | `backend/src/middlewares/rateLimiter.middleware.js`<br>`backend/src/services/auth.service.js` |
| **A08: Software or Data Integrity Failures** | Verificación forzosa del algoritmo `HS256` en `jwt.verify` (previene bypass "none" o confusión RS/HS). Validación del Tag de autenticación GCM (lanza excepción y rechaza el descifrado si los datos fueron alterados). Pipeline CI con pruebas previas al build. | `backend/src/services/crypto.service.js`<br>`backend/src/middlewares/auth.middleware.js` |
| **A09: Security Logging and Alerting Failures** | Registro estructurado JSON mediante `winston`. Registro relacional en base de datos (`audit_logs`) de logins exitosos/fallidos, accesos denegados, cambios de rol y revocaciones. Sanitización de contraseñas y tokens en logs. Alertas ante N fallos consecutivos. | `backend/src/config/logger.js`<br>`backend/src/services/admin.service.js` |
| **A10: Mishandling of Exceptional Conditions** | Manejador global centralizado de errores en Express. Respuestas genéricas y sanitizadas al cliente (*Fail-Closed*). Timeouts estrictos con `AbortSignal` en APIs externas. Captura global de `uncaughtException` y `unhandledRejection`. | `backend/src/middlewares/errorHandler.middleware.js`<br>`backend/src/server.js` |

---

## 🔑 4. Requerimientos Funcionales (RF-01 a RF-08)

- **RF-01 Registro de usuario:** Nombre, correo, contraseña con política estricta de complejidad (mínimo 10 caracteres, mayúscula, minúscula, número y carácter especial). La contraseña se almacena exclusivamente como hash Bcrypt (cost factor 12).
- **RF-02 Inicio y cierre de sesión:** Autenticación con cookie `HttpOnly`, `Secure` (en producción), `SameSite=Lax/Strict` o token Bearer en memoria, invalidación al salir.
- **RF-03 Roles:** Verificación estricta en servidor de roles (`admin`, `colaborador`, `cliente`, `auditor`). Denegación por defecto.
- **RF-04 CRUD de notas privadas:** Cada paciente o médico gestiona únicamente sus propias notas. El contenido de la nota se almacena cifrado en la base de datos con AES-256-GCM. Incluye botón para inspeccionar el texto cifrado crudo (`iv.tag.data`) en la BD.
- **RF-05 Dato sensible de perfil:** Cédula y teléfono almacenados cifrados con AES-256-GCM y mostrados enmascarados (`***-***-1234`). El usuario puede desenmascararlos en su perfil tras confirmar su contraseña.
- **RF-06 Recuperación de contraseña:** Token criptográfico de alta entropía generado con `crypto.randomBytes(32)` de un solo uso con expiración de 1 hora. En la base de datos se almacena únicamente el hash SHA-256 del token.
- **RF-07 Panel de administración:** Directorio de usuarios, cambio dinámico de roles, bitácora de eventos de auditoría forense (`audit_logs`) y métricas de seguridad en tiempo real.
- **RF-08 Endpoint de salud:** `GET /health` respondiendo `200 OK` con `{ status: "UP", timestamp: ... }` sin divulgar versiones de dependencias, Node ni datos internos.

---

## 🔐 5. Análisis Criptográfico: Pérdida y Rotación de Llaves

### ¿Qué ocurre con los datos si se pierde la llave de cifrado (`DATA_ENCRYPTION_KEY`)?
Si la llave simétrica de 32 bytes (256 bits) se destruye o se pierde sin respaldo, **los datos clínicos en reposo son matemáticamente irrecuperables**. El estándar AES-256 no contiene puertas traseras y requeriría $2^{256}$ operaciones para un ataque de fuerza bruta, superando la energía combinada del universo observable. Por esta razón, la llave debe residir en un gestor de secretos con respaldo cifrado redundante.

### ¿Cómo rotar la llave criptográfica sin caída del servicio (Zero-Downtime Key Rotation)?
MediVault implementa soporte nativo para **Keyring versionado** (`v1`, `v2`...):
1. **Identificador de versión:** Cada registro cifrado almacena o prefija la versión utilizada: `v1:iv.tag.data` o columna `key_version`.
2. **Anillo de llaves en memoria:** El servicio criptográfico (`crypto.service.js`) mantiene disponible la llave anterior (`v1`) y la nueva llave activa (`v2`).
3. **Escrituras inmediatas en la nueva versión:** Toda nueva nota o actualización se cifra con la versión activa (`v2`).
4. **Lectura retrocompatible:** Al descifrar, el servicio identifica la versión de la nota y utiliza la llave correspondiente.
5. **Migración en caliente (Hot Migration):** La función `rotateAllNotesKeys({ fromVersion: 'v1', toVersion: 'v2' })` disponible en el panel administrativo recorre las notas, descifra con `v1` y las re-cifra atómicamente con `v2` generando un nuevo IV aleatorio y un nuevo Tag de autenticación, registrando el evento en `key_rotation_logs`.

---

## 🧪 6. Suite de Pruebas Automatizadas (28/28 Aprobadas)

Para ejecutar la suite de pruebas unitarias y de integración de seguridad:

```bash
npm test
```

### Resultados de la Ejecución:
```
PASS src/tests/crypto.test.js
  MediVault Cryptographic Service (A04 & Laboratorio Requisitos)
    Password Hashing (Bcrypt cost factor 12)
      √ should hash a password and produce a valid bcrypt string with $2a$ or $2b$
      √ should verify correct password and reject incorrect password
    AES-256-GCM Authenticated Encryption
      √ should encrypt plaintext into iv.tag.ciphertext format
      √ should decrypt back to original plaintext accurately
      √ should produce different ciphertexts for the same plaintext due to random IV
      √ should fail-closed (throw error) if ciphertext or tag has been tampered with
    One-Time Token Hashing (SHA-256)
      √ should generate a 32-byte (64 hex char) cryptographically secure random token
      √ should hash token deterministically with SHA-256
    PII Data Masking (RF-05)
      √ should mask Costa Rican ID cédula to ***-***-XXXX
      √ should mask phone number to ***-***-XXXX

PASS src/tests/api.test.js
  MediVault API Security & Functional Suite
    RF-08: Health Check Endpoint
      √ GET /health should respond 200 with status UP and without leaking runtime versions
    RF-01 & RF-02: Authentication & Password Policy
      √ should register a new patient user when password meets complexity
      √ should reject registration if password does not meet complexity (A07)
      √ should fail login with invalid password and not leak whether email exists (A07)
    RF-04 & A01: Encrypted Notes & Anti-IDOR Enforcement
      √ Patient should be able to create an encrypted private medical note
      √ Patient should be able to read their own note and receive decrypted content
      √ IDOR TEST: Another user (Doctor) attempting to read Patient note directly should receive 403 Forbidden
      √ IDOR TEST: Another user attempting to update Patient note should receive 403 Forbidden
    RF-03 & A01: Role-Based Access Control (RBAC)
      √ Patient should be forbidden (403) from accessing Admin Users list
      √ Admin should be authorized (200) to view Users list and Audit Logs
    A05: Injection Resistance (SQLi & XSS)
      √ should resist SQL Injection in login payload (A05)
      √ should store note with script tags safely without executing (XSS mitigation)
    Section 7: AI Agents Functionality
      √ should list all 8 AI agents with role permissions
      √ should execute Conversational RAG agent and return cited clinical sources
      √ should execute Triage agent and classify symptoms with urgency level
      √ should forbid patient from executing restricted Admin Accounting agent (403)
    Section 8: External APIs Consumption
      √ GET /api/external/exchange-rate should return BCCR currency rates
      √ GET /api/external/weather should return clinical environmental indices

Test Suites: 2 passed, 2 total
Tests:       28 passed, 28 total (100% éxito)
```

---

## 🚀 7. Instrucciones de Ejecución Local

### Prerrequisitos:
- Node.js versión `>= 20.0.0` (recomendado Node.js 24 LTS).
- npm versión `>= 10.0.0`.

### Instalación y Puesta en Marcha:

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd MediVault

# 2. Instalar dependencias del frontend y del backend
npm install
cd backend && npm install && cd ..

# 3. Poblar la base de datos con cuentas y notas de prueba cifradas
npm run seed

# 4. Iniciar el servidor backend seguro (Puerto 5000)
npm run server

# 5. En otra terminal, iniciar el cliente de desarrollo Vite (Puerto 5173)
npm run dev
```

### Cuentas Semilla Preconfiguradas para Pruebas:
| Rol | Correo Electrónico | Contraseña | Capacidades |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@medivault.cr` | `AdminPassword2026!` | Control total, gestión de usuarios, cambio de roles, bitácora forense y rotación de llaves. |
| **Médico (Colaborador)**| `medico@medivault.cr`| `MedicoPassword2026!`| Triage clínico, lectura de notas, RAG médico y generador de contenidos. |
| **Paciente (Cliente)** | `paciente@medivault.cr`| `PacientePassword2026!`| Bóveda personal de notas, datos sensibles enmascarados y ejercicio de derechos Ley 8968. |
| **Auditor** | `auditor@medivault.cr` | `AuditorPassword2026!`| Vista de solo lectura de auditoría (`audit_logs`) y solicitudes de baja. |

---

## 🐳 8. Despliegue en Producción (Docker & PaaS)

### Despliegue con Docker Compose:
```bash
docker compose up --build -d
```
El contenedor se ejecuta bajo el usuario no privilegiado `node` (no-root), con `no-new-privileges:true` y sin capacidades adicionales (`cap_drop: ALL`), garantizando aislamiento de contenedores según las mejores prácticas de OWASP.

### Despliegue en PaaS (Render / Fly.io):
El repositorio contiene manifiestos listos para producción:
- `render.yaml`: Configura el servicio Docker con disco persistente para `/app/backend/data`, inyección de variables de entorno seguras y health check en `/health`.
- `fly.toml`: Configura micro-VM en Fly.io con terminación TLS automática y volumen persistente.
