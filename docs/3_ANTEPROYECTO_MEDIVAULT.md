# 📋 Anteproyecto: MediVault - Bóveda Médica y Expediente Clínico Seguro

**Programa:** Desarrollo Web Full Stack  
**Institución:** FWD Costa Rica  
**Nombre del Proyecto:** MediVault  
**Fecha:** Noviembre 2026  
**Documento:** Anteproyecto Oficial y Planificación Técnica  

---

## Índice de Contenidos

1. [Portada e Información del Proyecto](#1-portada-e-información-del-proyecto)
2. [Introducción](#2-introducción)
3. [Desarrollo de la Solución](#3-desarrollo-de-la-solución)
4. [Objetivos del Sistema](#4-objetivos-del-sistema)
   - 4.1 Objetivo General
   - 4.2 Objetivos Específicos
5. [Requerimientos del Sistema](#5-requerimientos-del-sistema)
   - 5.1 Requerimientos Funcionales (RF-01 a RF-08)
   - 5.2 Requerimientos No Funcionales (RNF-01 a RNF-08)
6. [Historias de Usuario (HU-01 a HU-08)](#6-historias-de-usuario)
7. [Mockups y Arquitectura Visual](#7-mockups-y-arquitectura-visual)
8. [Libro de Marca e Identidad](#8-libro-de-marca-e-identidad)
9. [Cronograma y Avances Obligatorios](#9-cronograma-y-avances-obligatorios)

---

## 1. Portada e Información del Proyecto

* **Título:** MediVault: Bóveda Médica Digital y Expediente Clínico de Alta Seguridad con Cifrado en Reposo, Cumplimiento OWASP Top 10:2025 y Gobernanza de Datos (Ley N.° 8968).
* **Organización:** FWD Costa Rica - Programa de Desarrollo Web Full Stack.
* **Ciclo:** Proyecto Final de Graduación - Noviembre / Diciembre 2026.
* **Modalidad:** Equipo de Desarrollo Web Full Stack.

---

## 2. Introducción

### Contexto del Negocio
En el sector salud costarricense, tanto en clínicas privadas, consultorios médicos independientes y centros hospitalarios, la transición desde el expediente médico en papel hacia plataformas digitales plantea enormes desafíos de seguridad y privacidad. Los datos de salud (diagnósticos, antecedentes familiares, resultados de laboratorios, recetas y prescripciones farmacológicas) son considerados **datos sensibles de categoría especial** según el artículo 9 de la **Ley N.° 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales** de Costa Rica.

### Problema que se Busca Resolver
La mayoría de sistemas médicos tradicionales presentan graves vulnerabilidades técnicas:
1. Almacenamiento de expedientes clínicos en texto plano en bases de datos relacionales, expuestos ante brechas o volcados no autorizados.
2. Controles de acceso deficientes (*Broken Access Control / IDOR*), permitiendo a usuarios curiosos consultar notas ajenas simplemente alterando el ID en la barra de direcciones.
3. Ausencia de consentimiento informado explícito y falta de mecanismos para ejercer los derechos ARCO de supresión y derecho al olvido.
4. Desconexión con los indicadores económicos nacionales (tipo de cambio oficial del BCCR) y carencia de automatizaciones inteligentes.

### A Quién va Dirigido el Sistema
* **Pacientes (Clientes):** Titulares del derecho a la salud que requieren consultar su historial clínico de forma confidencial, solicitar supresión de datos y recibir atención oportuna mediante triage con IA.
* **Médicos y Especialistas (Colaboradores):** Profesionales de la salud que gestionan notas de consulta, diagnósticos y recetas bajo estricto secreto profesional.
* **Administradores de Centros Médicos:** Encargados de la gestión de personal, control financiero y conciliación de tarifas en colones y dólares.
* **Oficiales de Cumplimiento y Auditores:** Encargados de velar por la trazabilidad forense de los accesos a datos y el cumplimiento de normativas sanitarias y de ciberseguridad.

---

## 3. Desarrollo de la Solución

MediVault es una solución web full stack construida bajo una arquitectura por capas desacoplada y modular:

### Módulos del Sistema
1. **Módulo de Autenticación y Criptografía:** Registro con política de contraseñas complejas, autenticación JWT con firma fija HS256, hashing lento con Bcrypt (costo 12) y cifrado simétrico autenticado AES-256-GCM.
2. **Módulo de Expedientes y Notas Privadas:** CRUD completo de historiales médicos, blindado contra IDOR mediante verificación de pertenencia (`WHERE owner_id = ?`).
3. **Módulo de Gobernanza de Datos (Ley N.° 8968):** Registro de consentimiento informado con sellado de tiempo e IP, visualización de términos y mecanismo interactivo de solicitud de baja con retención legal controlada.
4. **Módulo de Agentes de Inteligencia Artificial:** 8 agentes especializados integrados en la capa de servicios con auditoría en base de datos.
5. **Módulo de APIs Externas:** Consumo en backend de indicadores del Banco Central de Costa Rica (BCCR), validador de cédulas del Ministerio de Hacienda y alertas de salud ambiental de Open-Meteo.
6. **Módulo de Flujos de Automatización n8n:** Tres flujos de negocio que automatizan facturación médica, tipo de cambio diario y bienvenida legal.

### Roles del Sistema
* **Administrador (`admin`):** Gestión de usuarios y roles, visualización de bitácora completa de seguridad, auditoría forense, agente contable y configuración global.
* **Colaborador / Médico (`colaborador`):** Creación y consulta de notas clínicas, agentes de triage, RAG clínico, generador de contenido preventivo y lector de facturas.
* **Cliente / Paciente (`cliente`):** Consulta exclusiva de su propio expediente, agente conversacional RAG, triage de síntomas, perfil con datos enmascarados y derecho de supresión.
* **Auditor (`auditor`):** Acceso de solo lectura a métricas de seguridad, bitácoras de eventos (`audit_logs`) y solicitudes de baja.

---

## 4. Objetivos del Sistema

### 4.1 Objetivo General
**Desarrollar** e implementar un sistema web seguro full stack para la gestión de expedientes y notas clínicas médicas privadas denominado «MediVault», aplicando de forma demostrable las diez categorías del estándar OWASP Top 10:2025, cifrado autenticado AES-256-GCM, gobernanza de datos bajo la Ley N.° 8968 de Costa Rica y despliegue automatizado con HTTPS.

### 4.2 Objetivos Específicos
1. **Implementar** un mecanismo de autenticación y autorización robusto basado en tokens JWT y hashing con Bcrypt (cost factor 12) con mitigación activa contra ataques de fuerza bruta y enumeración de usuarios.
2. **Aplicar** cifrado simétrico autenticado AES-256-GCM con vectores de inicialización (IV) aleatorios únicos de 12 bytes y tags de autenticación de 16 bytes para garantizar la confidencialidad e integridad de las notas médicas en reposo.
3. **Construir** una arquitectura backend por capas en Node.js y Express con validación de entradas mediante esquemas Zod, consultas SQL estrictamente parametrizadas y registro estructurado de eventos en JSON.
4. **Integrar** al menos 8 agentes de inteligencia artificial y el consumo de APIs externas nacionales (BCCR y Ministerio de Hacienda) controlados por roles a nivel de servidor.
5. **Diseñar** tres flujos de automatización en n8n que repliquen procesos de negocio críticos de facturación, sincronización cambiaria y gobernanza de datos.
6. **Desplegar** la solución en un entorno de producción accesible mediante HTTPS obligatorio, con tubería CI/CD automatizada en GitHub Actions y verificación de vulnerabilidades.

---

## 5. Requerimientos del Sistema

### 5.1 Requerimientos Funcionales (RF)

| Código | Nombre del Requisito | Descripción | Prioridad | Módulo / Rol |
| :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Registro de Usuario Seguro | El sistema debe permitir el registro de usuarios solicitando nombre, correo, cédula costarricense, teléfono y contraseña con política estricta de complejidad (mayúscula, minúscula, número y símbolo). La contraseña se almacena exclusivamente como hash Bcrypt. | Alta | Autenticación / Todos |
| **RF-02** | Inicio y Cierre de Sesión | Autenticación con credenciales válidas, emisión de token JWT con expiración de 1 hora y cookies seguras (`HttpOnly`, `Secure`, `SameSite: Lax`). Cierre de sesión que invalida el token. | Alta | Autenticación / Todos |
| **RF-03** | Control de Roles (RBAC) | Verificación de cuatro roles en el servidor (`admin`, `colaborador`, `cliente`, `auditor`). El servidor deniega por defecto cualquier ruta sin autorización previa. | Alta | Seguridad / Servidor |
| **RF-04** | CRUD de Notas Privadas Cifradas | Creación, lectura, actualización y eliminación de notas médicas. Cada usuario accede únicamente a sus propias notas (`WHERE owner_id = ?`). El contenido se guarda cifrado en BD con AES-256-GCM. | Alta | Expedientes / Paciente, Médico |
| **RF-05** | Dato Sensible de Perfil Enmascarado | La cédula y el teléfono del usuario se almacenan cifrados con AES-256-GCM y se muestran enmascarados (`***-***-1234`). Se permite desenmascarar únicamente tras revalidar la contraseña. | Media | Perfil / Todos |
| **RF-06** | Recuperación de Contraseña Segura | Generación de token criptográfico aleatorio de 32 bytes de un solo uso con expiración de 1 hora. En la base de datos se almacena el hash SHA-256 del token, nunca el token en claro. | Alta | Autenticación / Todos |
| **RF-07** | Panel de Administración y Auditoría | Visualización de la lista de usuarios, cambio de roles en tiempo real y bitácora estructurada de eventos de seguridad (logins fallidos, accesos denegados, solicitudes de baja). | Alta | Administración / Admin, Auditor |
| **RF-08** | Endpoint de Salud del Sistema | Endpoint `GET /health` que responde con el estado operativo del servicio (`status: UP`) sin revelar versiones de software, dependencias ni datos internos. | Media | Monitoreo / Público |

### 5.2 Requerimientos No Funcionales (RNF)

| Código | Categoría | Descripción Técnica | Prioridad |
| :--- | :--- | :--- | :--- |
| **RNF-01** | Criptografía en Reposo | El contenido de los expedientes y los datos PII sensibles deben cifrarse con AES-256-GCM con IV único de 12 bytes por registro y tag de 16 bytes. Prohibido AES-ECB o IVs estáticos. | Alta |
| **RNF-02** | Criptografía de Tránsito | Todas las comunicaciones en producción deben forzar TLS 1.2/1.3 mediante HTTPS con cabecera HSTS activa (`Strict-Transport-Security`). | Alta |
| **RNF-03** | Resistencia a Inyección (SQLi/XSS) | Todas las consultas a la base de datos relacional deben emplear sentencias preparadas parametrizadas. Todas las entradas deben validarse con Zod antes de su procesamiento. | Alta |
| **RNF-04** | Disponibilidad y Anti-Fuerza Bruta | La ruta de inicio de sesión debe implementar limitación de tasa (máximo 5 intentos por IP en 15 minutos), devolviendo HTTP 429 Too Many Requests ante excesos. | Alta |
| **RNF-05** | Seguridad en Cabeceras HTTP | El servidor debe utilizar Helmet para implementar Content Security Policy (CSP), deshabilitar `X-Powered-By`, restringir CORS y configurar `trust proxy` para proxies inversos. | Alta |
| **RNF-06** | Integridad y Cadena de Suministro | El proyecto no debe contener vulnerabilidades altas o críticas en `npm audit` y debe versionar `package-lock.json` para despliegues reproducibles con `npm ci`. | Alta |
| **RNF-07** | Manejo de Excepciones y Fail Closed | El backend debe disponer de un manejador de errores global que devuelva mensajes genéricos al cliente sin filtrar trazas de pila (*stack traces*), confinando el error a los logs. | Alta |
| **RNF-08** | Gobernanza de Datos (Ley N.° 8968) | El sistema debe solicitar consentimiento explícito durante el registro y permitir la solicitud de baja y anonimización de datos de contacto (derecho al olvido). | Alta |

---

## 6. Historias de Usuario

* **HU-01: Registro de Paciente con Consentimiento Legal**
  * *Como* nuevo paciente de la clínica, *quiero* registrarme en MediVault aceptando los términos y la política de privacidad, *para* tener mi propio expediente médico seguro.
  * *Criterios de Aceptación:* Contraseña validada con 5 reglas de complejidad; registro del consentimiento en `governance_consents` con fecha e IP; emisión de token JWT.
  * *Prioridad:* Alta (5 pts). *Requerimientos:* RF-01, RNF-08.

* **HU-02: Consulta Confidencial de Notas Médicas (Anti-IDOR)**
  * *Como* paciente o médico, *quiero* ver únicamente mis notas clínicas descifradas en tiempo real, *para* consultar diagnósticos sin riesgo de que otros lean mi información.
  * *Criterios de Aceptación:* Verificación estricta de pertenencia en backend; intentos de acceso cruzado reciben HTTP 403 Forbidden; opción de ver el texto cifrado crudo como evidencia.
  * *Prioridad:* Alta (5 pts). *Requerimientos:* RF-04, RNF-01.

* **HU-03: Triage Clínico de Síntomas con Inteligencia Artificial**
  * *Como* paciente con dolor agudo, *quiero* describir mis síntomas en el agente de triage, *para* conocer de inmediato la prioridad de atención recomendada.
  * *Criterios de Aceptación:* Clasificación automática de nivel de urgencia (Rojo, Amarillo, Verde); advertencia de acudir al 9-1-1 si hay sospecha de infarto; registro en `ai_agent_logs`.
  * *Prioridad:* Media (3 pts). *Requerimientos:* RF-03, Sección 7.

* **HU-04: Conciliación Contable y Tipo de Cambio BCCR**
  * *Como* administrador de la clínica, *quiero* consultar el agente contable y el tipo de cambio oficial del BCCR, *para* liquidar servicios médicos en colones y dólares con precisión.
  * *Criterios de Aceptación:* Conexión al endpoint de Hacienda/BCCR; cálculo de ingresos, gastos y margen operativo en CRC y USD; acceso restringido al rol `admin`.
  * *Prioridad:* Media (5 pts). *Requerimientos:* RF-03, Sección 7 y 8.

* **HU-05: Solicitud de Supresión de Datos y Derecho al Olvido**
  * *Como* paciente que ya no desea usar la plataforma, *quiero* solicitar la eliminación de mi cuenta desde mi perfil, *para* ejercer mis derechos bajo la Ley N.° 8968.
  * *Criterios de Aceptación:* Requerir confirmación de contraseña; anonimizar nombre, correo y teléfono; registrar solicitud en BD explicando la retención legal de expedientes médicos.
  * *Prioridad:* Alta (5 pts). *Requerimientos:* RF-05, RNF-08.

* **HU-06: Auditoría de Seguridad Forense y Logins Fallidos**
  * *Como* oficial de auditoría, *quiero* revisar la bitácora de eventos de seguridad en tiempo real, *para* detectar intentos de fuerza bruta o escalamiento de privilegios.
  * *Criterios de Aceptación:* Filtrado por tipo de evento (`LOGIN_FAILED`, `ACCESS_DENIED`); ausencia de contraseñas en los registros; vista de solo lectura para el auditor.
  * *Prioridad:* Alta (3 pts). *Requerimientos:* RF-07, RNF-04.

* **HU-07: Asistencia Médica Basada en Literatura Clínica (RAG)**
  * *Como* médico o paciente, *quiero* realizar preguntas al asistente conversacional con RAG, *para* obtener recomendaciones basadas en manuales clínicos citando fuentes oficiales.
  * *Criterios de Aceptación:* Recuperación de fragmentos relevantes; inclusión obligatoria de citas bibliográficas de guías clínicas institucionales.
  * *Prioridad:* Media (3 pts). *Requerimientos:* Sección 7.

* **HU-08: Validación de Proveedores e Insumos en Hacienda**
  * *Como* colaborador administrativo, *quiero* consultar el número de cédula de un proveedor médico, *para* verificar su condición tributaria activa ante el Ministerio de Hacienda.
  * *Criterios de Aceptación:* Consulta por cédula de 9 o 10 dígitos; retorno de razón social y actividades económicas registradas.
  * *Prioridad:* Media (3 pts). *Requerimientos:* Sección 8.

---

## 7. Mockups y Arquitectura Visual

El anteproyecto define las pantallas principales de MediVault respetando la paleta de colores y el logotipo oficial:
1. **Pantalla de Autenticación (Login, Registro, Recuperación):** Fondo en degradado azul marino profundo (`#0F172A` a `#1E293B`), tarjeta blanca centralizada, medidor dinámico de complejidad de contraseña, casillas de aceptación de términos y botones de prueba rápida para evaluación.
2. **Dashboard de Expedientes Clínicos (CRUD):** Barra superior con escudo y badge de cifrado AES-256-GCM, barra lateral de navegación según rol, tarjetas de notas con badges de especialidad clínica, botón para inspeccionar el texto cifrado crudo en base de datos.
3. **Consola de los 8 Agentes de Inteligencia Artificial:** Cuadrícula con tarjetas de cada agente indicando su categoría y estado de acceso por rol; consola interactiva de ejecución y visualización de respuestas estructuradas.
4. **Pantalla de Integración de APIs Externas:** Tarjetas dedicadas para el Tipo de Cambio BCCR (con convertidor interactivo), Validador de Cédulas de Hacienda y Alertas Sanitarias de Clima.
5. **Panel de Seguridad y Administración:** Métricas de seguridad criptográfica, tabla de directorio de usuarios con cambio de rol y bitácora de auditoría forense con filtros.
6. **Pantalla de Perfil de Usuario y Gobernanza:** Visualización de cédula y teléfono enmascarados, modal de desenmascaramiento mediante contraseña y flujo de solicitud de baja de cuenta conforme a la Ley N.° 8968.

---

## 8. Libro de Marca e Identidad

La identidad de MediVault se construyó a partir del isotipo oficial aprobado: un escudo de seguridad con cuadrantes en azul marino pizarra (`#1E293B`, `#2C3E50`) que alberga un cuaderno de notas clínicas con la cruz médica centralizada (`+`), proyectando confianza, inviolabilidad criptográfica y vocación de salud. La especificación técnica completa (retícula, tamaños mínimos, paleta HEX/RGB/CMYK, tipografía y usos indebidos) se documenta en el archivo complementario `docs/4_LIBRO_DE_MARCA.md`.

---

## 9. Cronograma y Avances Obligatorios

| Fecha | Día | Actividad / Módulo | Requerimientos / HU | Entregable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **25/11/2026** | Miércoles | Investigación Deep Research sobre despliegue, arquitectura de capas y modelo de amenazas STRIDE | RNF-01 a RNF-08 | Documento de Deep Research y configuración de repositorio Git | **Completado** |
| **27/11/2026** | Viernes | Modelado relacional de base de datos con `node:sqlite` nativo y módulo criptográfico AES-256-GCM / Bcrypt 12 | RF-01, RF-04, RNF-01 | Esquema relacional 3FN, migraciones y seed con datos de prueba | **Completado** |
| **30/11/2026** | Lunes | Desarrollo de autenticación JWT (HS256), rate limiting anti-fuerza bruta y middlewares Zod | RF-01, RF-02, RNF-04 | Endpoints `/api/auth` y pruebas Jest de autenticación | **Completado** |
| **03/12/2026** | **Jueves** | **Primer Avance Obligatorio:** Presentación de arquitectura backend por capas, CRUD de notas privadas cifradas y prevención IDOR | RF-01 a RF-04, A01-A05 | **Demostración al Docente:** Ataque IDOR bloqueado (403) y BD cifrada | **Listo para Presentación** |
| **05/12/2026** | Sábado | Implementación de los 8 agentes de IA en servicios y consumo de APIs externas (BCCR, Hacienda, Open-Meteo) | Sección 7 y Sección 8 | Endpoints `/api/ai-agents` y `/api/external` con historial en BD | **Completado** |
| **07/12/2026** | Lunes | Construcción de 3 flujos automatizados en n8n y módulo de gobernanza Ley N.° 8968 (derecho al olvido) | RF-05, RF-07, Sección 9 y 13 | Workflows exportados en JSON y vista de gobernanza | **Completado** |
| **09/12/2026** | **Miércoles** | **Segundo Avance Obligatorio:** Integración completa de frontend React con logo y paleta, pipeline CI/CD y despliegue | RF-01 a RF-08, RNF-01 a RNF-08 | **Demostración al Docente:** Sistema funcional en producción y 28 pruebas | **Listo para Presentación** |
