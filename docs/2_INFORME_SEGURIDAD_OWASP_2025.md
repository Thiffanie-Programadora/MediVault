# 🛡️ Informe de Seguridad: OWASP Top 10:2025 y Criptografía
**Proyecto:** MediVault - Bóveda Médica y Expediente Clínico Seguro  
**Fecha:** Noviembre 2026  
**Estándar Aplicado:** OWASP Top 10:2025 / Ley N.° 8968 de Costa Rica  

---

## 1. Matriz de Mitigación y Evidencia Verificable (OWASP Top 10:2025)

Cada una de las diez categorías del estándar OWASP Top 10:2025 fue rigurosamente mitigada con código verificable en el backend de MediVault:

| Categoría OWASP Top 10:2025 | Medida de Seguridad Implementada en MediVault | Evidencia Verificable en el Código / Prueba |
| :--- | :--- | :--- |
| **A01: Broken Access Control (incluye SSRF)** | • Middleware RBAC en servidor (`requireRoles`).<br>• Cláusula SQL `WHERE owner_id = ?` forzosa en cada consulta de notas médicas.<br>• Denegación por defecto (Fail Closed).<br>• Lista blanca de destinos para peticiones salientes (Hacienda, BCCR, Open-Meteo). | • `backend/src/services/notes.service.js` (Línea 91: lanza error 403 si `note.owner_id !== userId`).<br>• Prueba Jest en `src/tests/api.test.js`: intento del Doctor de leer nota del Paciente devuelve **HTTP 403 Forbidden**. |
| **A02: Security Misconfiguration** | • Integración de `helmet` con estricta Content Security Policy (CSP).<br>• `app.disable('x-powered-by')` para evitar fingerprinting.<br>• Cabeceras HSTS, X-Content-Type-Options y Referrer-Policy activas.<br>• CORS restringido al origen frontend configurado.<br>• Supresión absoluta de stack traces en respuestas HTTP. | • `backend/src/app.js` (Líneas 14-36).<br>• Prueba Jest: endpoint `/health` y cabeceras verificadas; `X-Powered-By` está ausente. Calificación esperada en SecurityHeaders: **A+**. |
| **A03: Software Supply Chain Failures** | • Versionado estricto de dependencias en `package-lock.json`.<br>• Instalación determinista mediante `npm ci`.<br>• Sustitución de paquetes con vulnerabilidades por el módulo nativo `node:sqlite` de Node.js 24.<br>• Escaneo automatizado de vulnerabilidades (`npm audit`).<br>• Archivo `.github/dependabot.yml` activado para actualizaciones semanales. | • Salida de `npm audit`: **found 0 vulnerabilities**.<br>• Archivos `.github/dependabot.yml` y `.github/workflows/ci.yml` configurados en el repositorio. |
| **A04: Cryptographic Failures** | • Hashing de contraseñas con `bcrypt` (factor de costo 12 con sal criptográfica única).<br>• Cifrado simétrico autenticado `AES-256-GCM` para expedientes y PII sensible.<br>• Generación de IV aleatorio de 12 bytes por registro y Tag de autenticación de 16 bytes.<br>• Hash SHA-256 para tokens de recuperación de un solo uso.<br>• Claves maestras cargadas exclusivamente desde variables de entorno. | • `backend/src/services/crypto.service.js`.<br>• Inspección de base de datos: contraseñas inician con `$2a$12$` y notas se almacenan en formato `iv.tag.data` en Base64.<br>• Suite `crypto.test.js` con 10/10 pruebas unitarias aprobadas. |
| **A05: Injection (incluye XSS y SQLi)** | • Consultas SQL 100% parametrizadas con sentencias preparadas (`db.prepare(sql).all(...params)`).<br>• Validación estricta de entradas con esquemas tipados de `Zod` antes de llegar a los controladores.<br>• Escape automático en React contra XSS.<br>• Bloqueo de scripts inline en la cabecera CSP. | • `backend/src/config/db.js` y `backend/src/middlewares/schemas.js`.<br>• Prueba Jest: inyección `' OR 1=1 --` en email es rechazada de inmediato con HTTP 400 por Zod. |
| **A06: Insecure Design** | • Modelado de amenazas formal bajo metodología STRIDE.<br>• Límites de negocio estrictos: máximo 50 notas por usuario y 50,000 caracteres por nota para prevenir agotamiento de recursos.<br>• Cifrado de datos sensibles por diseño antes del almacenamiento. | • `backend/src/services/notes.service.js` (Línea 7: constante `MAX_NOTES_PER_USER = 50`).<br>• Esquema Zod limita longitud de texto y número de registros. |
| **A07: Authentication Failures** | • Rate limiting con `express-rate-limit` en rutas de login (5 intentos por ventana de 15 minutos).<br>• Bloqueo progresivo a nivel de base de datos con campo `lock_until`.<br>• Mensajes de error genéricos para evitar enumeración de usuarios.<br>• Tokens JWT con algoritmo fijo `HS256` y expiración corta (1 hora). | • `backend/src/middlewares/rateLimiter.middleware.js` y `backend/src/services/auth.service.js`.<br>• Al 5.° intento fallido devuelve **HTTP 429 Too Many Requests** y registra el evento en la bitácora. |
| **A08: Software or Data Integrity Failures** | • Verificación forzosa del algoritmo `HS256` en `jwt.verify` (evita ataques CVE-2015-9235 "none" o confusión RS/HS).<br>• Validación del tag de autenticación GCM (lanza excepción si el dato cifrado fue alterado).<br>• Pipeline CI en GitHub Actions que ejecuta pruebas unitarias antes de compilar. | • `backend/src/services/crypto.service.js` (Línea 56: `decipher.setAuthTag(tag)`).<br>• Prueba Jest en `crypto.test.js`: payload alterado lanza error y no descifra (Fail Closed). |
| **A09: Security Logging and Alerting Failures** | • Registro estructurado de eventos en formato JSON mediante `winston`.<br>• Registro en base de datos (`audit_logs`) de logins exitosos/fallidos, accesos denegados, cambios de rol y solicitudes de baja.<br>• Sanitización automática de campos sensibles (se enmascaran `password`, `token`, `content_enc`). | • `backend/src/config/logger.js`.<br>• Vista interactiva en el panel del administrador y auditor consumiendo `GET /api/admin/audit-logs`. |
| **A10: Mishandling of Exceptional Conditions** | • Manejador global centralizado de errores en Express.<br>• Respuestas genéricas al cliente (*Ocurrió un error interno seguro*); traza de depuración confinada a logs internos.<br>• Timeouts estrictos (5000 ms con `AbortSignal.timeout`) en llamadas a APIs externas (BCCR, Hacienda, Open-Meteo).<br>• Captura de eventos de proceso `unhandledRejection` y `uncaughtException`. | • `backend/src/middlewares/errorHandler.middleware.js` y `backend/src/server.js`.<br>• Prueba Jest: llamadas a APIs caídas ejecutan fallback seguro sin detener el servidor. |

---

## 2. Modelo de Amenazas (STRIDE) y Mitigaciones en MediVault

| Categoría STRIDE | Amenaza Potencial en MediVault | Vector de Ataque | Mitigación Implementada |
| :--- | :--- | :--- | :--- |
| **S** - *Spoofing* (Suplantación de Identidad) | Un atacante se hace pasar por un médico o paciente para leer expedientes. | Fuerza bruta en login o robo de token JWT en tránsito. | Hashing Bcrypt (costo 12), Rate Limiting (HTTP 429 tras 5 fallos), bloqueo de cuenta, expiración de token en 1 hora, cookies con flags `HttpOnly`, `Secure` y `SameSite: Lax`. |
| **T** - *Tampering* (Alteración de Datos) | Modificación maliciosa del contenido de un diagnóstico médico o receta. | Manipulación directa de los registros de la base de datos o interceptación en red. | Cifrado autenticado `AES-256-GCM`: si un solo bit del contenido o del tag es alterado, `decipher.setAuthTag()` falla y se rechaza el dato. Consultas parametrizadas anti-SQLi. |
| **R** - *Repudiation* (Repudio) | Un usuario afirma no haber realizado un cambio de rol o no haber aceptado la política de privacidad. | Falta de trazabilidad en las operaciones de administración y gobernanza. | Tabla relacional `audit_logs` y `governance_consents` que registran usuario, IP, User-Agent, fecha/hora y hash de auditoría de cada operación. |
| **I** - *Information Disclosure* (Fuga de Información) | Exposición de cédulas, teléfonos o notas clínicas ante volcados de BD o ataques IDOR. | Vulnerabilidad IDOR (`GET /notes/:id`) o robo de copias de seguridad de la BD. | Verificación de pertenencia forzosa `WHERE owner_id = ?` (IDOR bloqueado con 403), enmascaramiento de PII (`***-***-1234`) y cifrado en reposo con llave externa. |
| **D** - *Denial of Service* (Denegación de Servicio) | Agotamiento de CPU/RAM enviando notas gigantes o millones de peticiones por segundo. | Solicitudes masivas a endpoints de IA o subida de notas de 100 MB. | Límite de tamaño de body en Express (1 MB), límite de negocio de 50 notas por usuario, máximo 50,000 caracteres por nota (Zod) y Rate Limiting global por IP. |
| **E** - *Elevation of Privilege* (Elevación de Privilegios) | Un paciente ejecuta endpoints del panel de administración o del agente contable. | Modificación de peticiones en el cliente o llamadas directas a la API REST. | Middleware RBAC `requireRoles('admin')` ejecutado estrictamente en el backend en cada ruta sensible. Ocultar botones en frontend es solo una conveniencia visual. |

---

## 3. Decisiones Criptográficas y Justificación de Algoritmos

### A. Almacenamiento de Contraseñas: Bcrypt con Factor de Costo 12
* **Por qué NO SHA-256 o MD5:** SHA-256 y MD5 son funciones criptográficas rápidas diseñadas para verificar la integridad de archivos. Un atacante con una GPU moderna puede computar más de 10 mil millones de hashes SHA-256 por segundo, haciendo triviales los ataques por diccionario.
* **Justificación de Bcrypt:** Bcrypt implementa un algoritmo de derivación de claves deliberadamente lento basado en el cifrador Blowfish. El factor de costo 12 realiza $2^{12} = 4,096$ iteraciones con sal criptográfica única de 16 bytes generada automáticamente por `bcryptjs`, resistiendo ataques masivos de fuerza bruta con tablas *rainbow*.

### B. Cifrado de Datos en Reposo: AES-256-GCM
* **Por qué NO AES-ECB o AES-CBC simple:**
  - `AES-ECB` (Electronic Codebook) cifra bloques idénticos de texto plano en bloques idénticos de texto cifrado, preservando patrones visuales y estructuras de datos (prohibido taxativamente en la rúbrica).
  - `AES-CBC` no es autenticado y es susceptible a ataques de oráculo de relleno (*Padding Oracle Attacks*).
* **Justificación de AES-256-GCM (Galois/Counter Mode):**
  - Es un esquema de cifrado autenticado con datos asociados (AEAD).
  - Emplea una llave simétrica de 256 bits (32 bytes).
  - Genera un **IV único y aleatorio de 12 bytes** en cada llamada (`crypto.randomBytes(12)`). Reutilizar el mismo IV destruiría la seguridad de GCM.
  - Produce un **Tag de Autenticación de 16 bytes** (`cipher.getAuthTag()`) que garantiza matemáticamente que el mensaje no ha sido manipulado ni alterado en la base de datos.
  - El formato de almacenamiento en MediVault es: `Base64(IV) . Base64(Tag) . Base64(Ciphertext)`.

### C. Tokens de Recuperación: SHA-256 de Token Aleatorio
* El token de restablecimiento de contraseña generado por `crypto.randomBytes(32)` posee 256 bits de entropía real. Al ser de alta entropía, no requiere un hash lento como Bcrypt. Almacenar su hash `SHA-256` en la base de datos garantiza que, si un atacante obtiene un volcado de la BD, no podrá utilizar los tokens para secuestrar cuentas.

---

## 4. Preguntas de Análisis Obligatorias (Sección 4 del Enunciado)

### ¿Qué ocurre con los datos si se pierde la llave de cifrado (`DATA_ENCRYPTION_KEY`)?
Si la llave simétrica de 32 bytes se pierde o se destruye sin contar con un respaldo seguro, **los datos cifrados (notas médicas, cédulas y teléfonos) son irrecuperables matemáticamente**. Debido a que AES-256 es un estándar criptográfico robusto y no posee puertas traseras, no existe capacidad computacional en el mundo capaz de romper la llave por fuerza bruta en un tiempo razonable. Por este motivo, la llave maestra debe respaldarse en un gestor de secretos con alta disponibilidad y redundancia geográfica (ej. AWS Secrets Manager con replicación multi-región).

### ¿Cómo rotarían la llave criptográfica sin perder la información existente?
Para realizar una rotación de llaves (*Key Rotation*) en caliente sin caída del servicio (*zero-downtime*):
1. **Versionado de Llaves:** Se añade un prefijo o campo de metadatos al registro cifrado: `v1:iv.tag.data` o `key_version: 1`.
2. **Soporte de Múltiples Llaves en Memoria:** El servicio criptográfico almacena un anillo de llaves (*Keyring*):
   ```javascript
   const KEYS = {
     1: Buffer.from(process.env.ENCRYPTION_KEY_V1, 'base64'),
     2: Buffer.from(process.env.ENCRYPTION_KEY_V2, 'base64') // Llave activa actual
   };
   ```
3. **Escrituras con la Nueva Llave:** Todas las notas nuevas o actualizadas se cifran inmediatamente con la versión más reciente (`v2`).
4. **Lecturas Compatibles:** Al leer un registro, se identifica su versión y se descifra con la llave correspondiente (`v1` o `v2`).
5. **Migración en Lote Asíncrona (Re-encryption Script):** Un proceso en segundo plano recorre los registros que aún tengan `version = 1`, los descifra con `v1`, los re-cifra con `v2` (generando nuevos IVs y Tags) y actualiza la base de datos. Una vez que ningún registro dependa de `v1`, la llave antigua se retira de forma segura.

---

## 5. Resultados de Pruebas Automatizadas y Auditoría de Dependencias

* **Suite de Pruebas Unitarias de Seguridad (Jest):**
  - **Pruebas Criptográficas (`crypto.test.js`):** 10/10 pasadas (Bcrypt cost 12, AES-256-GCM format, random IV uniqueness, tampered tag detection, SHA-256 token hashing, PII masking).
  - **Pruebas de la API REST (`api.test.js`):** 18/18 pasadas (Anti-IDOR 403, RBAC 403, Anti-SQLi 400, sanitización XSS, Health check UP sin versiones, Rate limit anti-fuerza bruta, 8 agentes de IA, APIs externas).
  - **Total:** **28 pruebas aprobadas exitosamente (100% éxito)**.
* **Auditoría de Dependencias (`npm audit`):**
  - **0 vulnerabilidades detectadas** (tras migrar a `node:sqlite` nativo y `zod@latest`).

---

## 6. Lista de Verificación Final de Cumplimiento (Checklist de Rúbrica)

| Control / Requisito | Estado | Evidencia en MediVault |
| :--- | :---: | :--- |
| **Identidad Visual y Paleta** | ✅ Cumplido | Logotipo `mediV.jpg` (escudo, libreta y cruz) integrado en UI. Paleta `#253852`, `#5A7B8C`, `#303641`, `#F9FAFB`, `#FFFFFF`. |
| **RF-01: Registro de Usuarios** | ✅ Cumplido | Validación de complejidad (min 10 caracteres, mayúscula, minúscula, número, especial), contraseña hasheada en BD con Bcrypt cost 12. |
| **RF-02: Inicio y Cierre de Sesión** | ✅ Cumplido | Cookie `HttpOnly`, `SameSite=Lax`, `Secure` en producción, regeneración de sesión, expiración de 1h y cierre seguro. |
| **RF-03: Roles RBAC en Servidor** | ✅ Cumplido | Middleware `requireRoles` denegando por defecto; `admin`, `colaborador`, `cliente`, `auditor` validados siempre en backend. |
| **RF-04: CRUD Notas Privadas (Anti-IDOR)** | ✅ Cumplido | `WHERE owner_id = ?` forzoso, cifrado en reposo con AES-256-GCM. Botón para inspeccionar el texto cifrado en BD (`iv.tag.data`). |
| **RF-05: PII Enmascarado y Revelado** | ✅ Cumplido | Cédula y teléfono cifrados con AES-256-GCM, enmascarados como `***-***-1234`, revelado condicionado a re-autenticación de contraseña. |
| **RF-06: Recuperación de Contraseña** | ✅ Cumplido | `crypto.randomBytes(32)` con expiración de 1 hora, de un solo uso; en BD solo se guarda el hash SHA-256 del token. |
| **RF-07: Panel de Administración** | ✅ Cumplido | Gestión de usuarios, cambio de roles en caliente, bitácora forense estructurada y rotación de llaves. |
| **RF-08: Health Check** | ✅ Cumplido | `GET /health` devuelve `200 OK` con `{ status: "UP" }` sin divulgar versiones ni tecnologías internas. |
| **OWASP Top 10:2025 (A01 a A10)** | ✅ Cumplido | Todas las 10 categorías mitigadas demostrablemente en código y validadas con 28 pruebas automatizadas. |
| **Prohibiciones Criptográficas** | ✅ Cumplido | Sin MD5, sin SHA-1 para contraseñas, sin AES-ECB, sin IVs fijos, sin `Math.random()`, sin claves en repositorio. |
| **Despliegue y CI/CD** | ✅ Cumplido | `Dockerfile` no-root (`USER node`), `render.yaml`, `fly.toml`, pipeline de GitHub Actions (`ci.yml`), `.gitignore` y `.env.example`. |
| **Bonificaciones Implementadas** | ✅ Cumplido | TOTP MFA (RFC 6238), rotación de llaves en caliente con versionado (`v1` -> `v2`), auditoría estructurada en JSON. |
