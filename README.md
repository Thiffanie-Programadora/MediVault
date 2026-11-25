# 🛡️ SecureVault (MediVault) - Sistema Seguro en Node.js
> **Laboratorio Práctico: OWASP Top 10:2025, Cifrado, Hash y Despliegue a Producción**  
> *Aplicación web de alta seguridad para el resguardo confidencial de notas privadas y datos sensibles.*

---

## 📋 1. Propósito y Alcance del Sistema
En la industria del software, una aplicación no se considera terminada cuando «*funciona en mi computadora*», sino cuando está en producción, es accesible públicamente y resiste ataques reales. **SecureVault** es un sistema web pequeño y deliberadamente enfocado en Node.js que aplica de forma demostrable las diez categorías del **OWASP Top 10:2025**, distingue rigurosamente el uso de hash (irreversible) del cifrado (reversible) y está preparado para ser desplegado en producción con HTTPS y base de datos protegida.

### 🎨 Identidad Visual y Paleta de Colores
* **Nombre:** MediVault / SecureVault
* **Logotipo oficial:** Escudo con libreta y cruz médica (`public/mediV.jpg`).
* **Paleta cromática:**
  - Azul marino profundo (`#253852`): Encabezados, navegación, botones principales.
  - Azul pizarra / gris azulado (`#5A7B8C`): Acentos, bordes, elementos secundarios.
  - Gris carbón oscuro (`#303641`): Tipografía y textos principales de alta legibilidad.
  - Blanco / Superficie limpia (`#F9FAFB` y `#FFFFFF`): Fondos y tarjetas modulares.

---

## 📌 2. Requisitos Funcionales Mínimos (RF-01 a RF-08)

| ID | Requisito | Detalle de Implementación en SecureVault | Estado |
| :--- | :--- | :--- | :---: |
| **RF-01** | **Registro de usuario** | Correo, nombre y contraseña con política estricta de complejidad (mínimo 10 caracteres, mayúsculas, minúsculas, números y símbolos especiales). La contraseña se almacena exclusivamente como hash **Bcrypt (cost factor 12)** con sal criptográfica única. | ✅ |
| **RF-02** | **Inicio y cierre de sesión** | Sesión segura con JWT emitido en cookie con flags `HttpOnly`, `SameSite=Lax` y `Secure` (en producción), o bearer token con expiración de 1 hora. Cierre de sesión que invalida la sesión de inmediato. | ✅ |
| **RF-03** | **Roles** | Dos roles principales: `usuario` y `administrador`. El rol se verifica **siempre en el servidor** mediante el middleware `requireRole('admin')`. | ✅ |
| **RF-04** | **CRUD de notas privadas** | Cada usuario crea, lee, edita y elimina solo sus propias notas. El contenido de la nota se almacena cifrado en reposo con **AES-256-GCM** en formato `iv.tag.ciphertext`. Anti-IDOR estricto (`WHERE owner_id = ?`). | ✅ |
| **RF-05** | **Dato sensible de perfil** | Campo sensible (cédula o teléfono) almacenado cifrado con AES-256-GCM y presentado enmascarado (`***-***-1234`). Opción de revelado controlado para el propietario mediante verificación previa de contraseña. | ✅ |
| **RF-06** | **Recuperación de contraseña** | Token aleatorio de un solo uso generado con `crypto.randomBytes(32)` (256 bits de entropía) y expiración en 1 hora; en la base de datos se almacena únicamente el hash **SHA-256** del token. | ✅ |
| **RF-07** | **Panel de administración** | Lista de usuarios, gestión de roles y bitácora estructurada de eventos de seguridad (logins fallidos, cambios de rol, accesos denegados). | ✅ |
| **RF-08** | **Endpoint de salud** | Endpoint `GET /health` que responde HTTP 200 OK con el estado operativo (`UP`) sin revelar versiones de runtime ni datos internos del servidor. | ✅ |

---

## 🔒 3. Seguridad: OWASP Top 10:2025 (A01 a A10)

| Categoría OWASP Top 10:2025 | Implementación en SecureVault | Evidencia Verificable |
| :--- | :--- | :--- |
| **A01: Broken Access Control (incluye SSRF)** | Middleware RBAC en servidor; verificación de propiedad en cada consulta (`WHERE owner_id = usuario actual`) para evitar IDOR; denegar por defecto; lista blanca de URLs salientes. | Prueba Jest: Usuario A intenta leer nota del Usuario B y recibe **HTTP 403 Forbidden**. |
| **A02: Security Misconfiguration** | `helmet` con CSP estricta; `app.disable('x-powered-by')`; CORS restringido; `NODE_ENV=production`; sin stack traces al cliente ni rutas de depuración. | Reporte de cabeceras (`securityheaders.com`) con calificación A+. |
| **A03: Software Supply Chain Failures** | `package-lock.json` versionado; instalación con `npm ci`; `npm audit` con **0 vulnerabilidades**; Dependabot activado; dependencias mínimas sin paquetes obsoletos. | Salida de `npm audit` en el pipeline CI y archivo `.github/dependabot.yml`. |
| **A04: Cryptographic Failures** | Bcrypt cost 12 / Argon2id; AES-256-GCM para notas y datos sensibles; llaves fuera del repositorio (`.env`); TLS obligatorio; cookies seguras. | Inspección de la BD mostrando datos en formato `iv.tag.data` y hashes `$2a$12$`. |
| **A05: Injection (incluye XSS)** | Consultas SQL 100% parametrizadas con sentencias preparadas; validación estricta de esquemas con **Zod**; escape automático en frontend; CSP sin scripts inline. | Intentos de inyección SQL `' OR 1=1 --` y `<script>` neutralizados de inmediato. |
| **A06: Insecure Design** | Modelo de amenazas **STRIDE** documentado; límites de negocio (máximo 50 notas por usuario y 50,000 caracteres por nota para prevenir agotamiento). | Tabla de amenazas y mitigaciones en el informe `docs/2_INFORME_SEGURIDAD_OWASP_2025.md`. |
| **A07: Authentication Failures** | Rate limiting con `express-rate-limit` (5 intentos por ventana de 15 min); bloqueo progresivo de cuentas; mensajes genéricos; MFA TOTP (RFC 6238). | Prueba de fuerza bruta bloqueada con **HTTP 429 Too Many Requests**. |
| **A08: Software or Data Integrity Failures** | Sin deserialización insegura; verificación de firma JWT con algoritmo fijo `HS256`; tag de autenticación GCM (falla si el dato es manipulado); pipeline de CI con pruebas antes del despliegue. | Archivo `.github/workflows/ci.yml` ejecutando `npm ci` y `npm test`. |
| **A09: Security Logging and Alerting Failures** | Logs estructurados en JSON con `winston`; registro de logins exitosos/fallidos, accesos denegados y cambios de rol sin filtrar contraseñas ni datos sensibles. | Bitácora visible en el panel del administrador y logs estructurados en consola/archivo. |
| **A10: Mishandling of Exceptional Conditions** | Manejador global centralizado de errores; respuestas genéricas al cliente; fail-closed; captura de `unhandledRejection` y `uncaughtException`; timeouts en BD. | Prueba de error forzado con respuesta genérica segura y traza confinada al log interno. |

---

## 🔐 4. Hash y Cifrado: Uso Correcto

> **Regla fundamental:** Si nunca necesitas recuperar el valor original, usa **hash**; si necesitas volver a leerlo, usa **cifrado**.

| Dato | Técnica | Algoritmo y Parámetros | Motivo Criptográfico |
| :--- | :--- | :--- | :--- |
| **Contraseña** | Hash lento con sal | `Bcrypt (cost factor 12)` o `Argon2id` | Nunca se descifra; solo se compara. Lento a propósito contra ataques de fuerza bruta y GPU. |
| **Contenido de notas** | Cifrado autenticado | `AES-256-GCM` (IV aleatorio de 12 bytes + Auth Tag de 16 bytes) | El usuario debe leerlo; GCM detecta si el dato fue alterado por un tercero. |
| **Teléfono / Documento** | Cifrado autenticado | `AES-256-GCM` (enmascarado `***-***-1234`) | Se muestra enmascarado y solo se descifra completo al propietario tras validar clave. |
| **Token de recuperación** | Hash rápido | `SHA-256` del token aleatorio de 32 bytes (`crypto.randomBytes(32)`) | Alta entropía (256 bits): no requiere hash lento. Si comprometen la BD, los tokens no sirven. |
| **Firma / Integridad** | HMAC | `HMAC-SHA256` con llave secreta | Verifica que nadie alteró el contenido o metadata del registro. |
| **Datos en tránsito** | TLS | HTTPS con `TLS 1.2 / TLS 1.3` (Let's Encrypt) | Protege credenciales, tokens y cookies contra espionaje en la red. |

> 🚫 **Prácticas Prohibidas (Cumplidas estrictamente):**
> * ❌ NO se usa MD5, SHA-1 ni SHA-256 simple para contraseñas.
> * ❌ NO se usa AES en modo ECB ni `crypto.createCipher()` obsoleto.
> * ❌ NO se reutiliza el mismo IV (cada cifrado genera un IV CSPRNG único).
> * ❌ NO se escriben llaves en el código ni se sube el archivo `.env` al repositorio.
> * ❌ NO se usa `Math.random()` para tokens o generación de seguridad.

### 🔄 Análisis de Pérdida y Rotación de Llaves (Pregunta Sección 4)
* **¿Qué ocurre si se pierde la llave?** Matemáticamente los datos cifrados son irrecuperables.
* **¿Cómo rotar la llave sin perder información?** SecureVault implementa versionado de llave (`v1:iv.tag.ciphertext`, `v2:...`). La función `reEncryptData` descifra con la versión anterior y cifra atómicamente con la nueva clave sin pérdida de datos ni tiempo de inactividad.

---

## 🎁 5. Elementos de Bonificación Implementados (+10 Pts)
1. **Autenticación Multifactor (MFA / 2FA con TOTP):** Compatible con Google Authenticator y Authy bajo el estándar RFC 6238.
2. **Rotación de Llaves Versionadas:** Soporte para claves versionadas `v1` y `v2` con re-cifrado seguro en caliente.
3. **Contenedor Docker Seguro:** `Dockerfile` multi-etapa ejecutado bajo usuario no-root (`node`).
4. **Escaneo de Secretos en CI:** Integración de escaneo de secretos y auditoría automatizada en GitHub Actions.

---

## 🚀 6. Instalación y Ejecución Local

### Prerrequisitos
* Node.js v20.x o superior (LTS)
* npm v10.x o superior

### Pasos de Instalación
```bash
# 1. Clonar el repositorio
git clone https://github.com/Thiffanie-Programadora/MediVault.git
cd MediVault

# 2. Instalar dependencias con instalación limpia determinista
npm ci
cd backend && npm ci && cd ..

# 3. Configurar variables de entorno
cp .env.example .env
cp backend/.env.example backend/.env

# 4. Generar llave de cifrado de 32 bytes (AES-256)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Pegar el valor resultante en DATA_ENCRYPTION_KEY en backend/.env

# 5. Inicializar y sembrar la base de datos
npm run seed

# 6. Compilar el frontend React
npm run build

# 7. Iniciar el servidor
npm start
```
La aplicación quedará disponible en: **`http://localhost:5000`**

---

## 🧪 7. Pruebas Unitarias y de Seguridad (Un solo comando)

Para ejecutar la suite completa de 28 pruebas automatizadas de seguridad con Jest:
```bash
npm test
```
* **Cobertura de pruebas:**
  - `crypto.test.js`: Hashing Bcrypt, cifrado AES-256-GCM, resistencia ante manipulación (fail-closed), tokens SHA-256 y enmascaramiento PII.
  - `api.test.js`: Endpoint `/health` (RF-08), registro con validación de complejidad, login con rate-limiting, CRUD de notas con anti-IDOR (403 si otro usuario intenta leer), RBAC de administrador y neutralización de SQL Injection y XSS.

---

## 🚢 8. Guía de Despliegue a Producción

El repositorio cuenta con configuración para despliegue automatizado reproducible:

### Opción A: Despliegue en Render
1. Conectar el repositorio de GitHub en el panel de **Render** (`render.yaml`).
2. Configurar las variables en el gestor de secretos de la plataforma:
   - `NODE_ENV=production`
   - `JWT_SECRET=<clave_aleatoria_64_chars>`
   - `DATA_ENCRYPTION_KEY=<clave_base64_32_bytes>`
3. Build Command: `npm ci && npm run build`
4. Start Command: `node backend/src/server.js`

### Opción B: Despliegue con Docker
```bash
# Construir imagen con usuario no-root
docker build -t securevault:latest .

# Ejecutar contenedor seguro
docker run -d -p 5000:5000 --env-file backend/.env --name securevault securevault:latest
```

---

## 📑 9. Documentos de Entrega del Laboratorio

1. **Fase 0: Deep Research de Despliegue:** [`docs/1_DEEP_RESEARCH_DESPLIEGUE.md`](./docs/1_DEEP_RESEARCH_DESPLIEGUE.md) (Respuestas detalladas con citas a las 10 preguntas de la Sección 7, comparativa de 3 plataformas y plan de despliegue).
2. **Fase 4: Informe de Seguridad OWASP Top 10:2025:** [`docs/2_INFORME_SEGURIDAD_OWASP_2025.md`](./docs/2_INFORME_SEGURIDAD_OWASP_2025.md) (Matriz de mitigación con evidencias, modelo STRIDE, análisis de rotación de llaves y reporte de verificación).
3. **Fase 1: Modelo de Datos y Diseño:** [`docs/3_MODELO_DATOS_Y_DISENO.md`](./docs/3_MODELO_DATOS_Y_DISENO.md) (Diagrama ER, diccionario de datos relacional y flujo de autenticación).

---

## ✅ 10. Checklist de Verificación (Sección 10 del Laboratorio)

- [x] El archivo `.env` no aparece en ningún commit del historial de Git (`.gitignore` activo).
- [x] `npm audit` no reporta vulnerabilidades altas ni críticas (**0 vulnerabilities**).
- [x] Un usuario no puede ver, editar ni borrar notas de otro usuario (verificado en pruebas IDOR con HTTP 403).
- [x] Las contraseñas en la base de datos comienzan con `$2a$12$` o `$2b$12$`.
- [x] El contenido de las notas en la BD es ilegible (almacenado como `iv.tag.data` en Base64).
- [x] La aplicación responde bajo HTTPS en producción y las cookies tienen `HttpOnly`, `Secure` y `SameSite`.
- [x] Los errores muestran un mensaje genérico; el detalle y stack trace solo queda en los logs internos.
- [x] El login devuelve `429 Too Many Requests` después de varios intentos fallidos consecutivos.
- [x] Los logs estructurados no contienen contraseñas, tokens ni datos sensibles.
- [x] El `README.md` explica de forma completa cómo reproducir el despliegue.
