# 🔄 Workflows de Automatización con n8n - MediVault

En cumplimiento de la **Sección 9** y la **Lista de Verificación (Sección 15)** del documento oficial del Proyecto Final Full Stack de FWD Costa Rica, esta carpeta contiene los tres (3) workflows de automatización de negocio en n8n exportados en formato JSON.

---

## 📋 Resumen de los Workflows Implementados

| # | Archivo Exportado | Proceso de Negocio | Disparador (Trigger) | Normativa / Integración |
|---|---|---|---|---|
| **1** | [`workflow-1-onboarding-pacientes.json`](./workflow-1-onboarding-pacientes.json) | Onboarding de usuarios y registro de consentimiento informado | Webhook HTTP POST (`/medivault-onboarding`) | Ley N.° 8968 (Art. 9) / Notificación por Correo |
| **2** | [`workflow-2-tipo-cambio-bccr.json`](./workflow-2-tipo-cambio-bccr.json) | Consulta diaria y sincronización de tipo de cambio del BCCR | Cron / Horario programado (`0 6 * * 1-5`) | BCCR Indicadores Económicos / Auditoría Médica |
| **3** | [`workflow-3-derecho-al-olvido-ley8968.json`](./workflow-3-derecho-al-olvido-ley8968.json) | Proceso de baja y anonimización de datos personales | Webhook HTTP POST (`/medivault-derecho-olvido`) | Ley N.° 8968 (Art. 7) / Derecho de Supresión ARCO |

---

## 🔍 Detalle Técnico de Cada Workflow

### 1. Workflow 1: Onboarding de Pacientes y Registro de Consentimiento (Ley N.° 8968)
* **Archivo:** `workflow-1-onboarding-pacientes.json`
* **Problema de Negocio que Resuelve:** Al registrarse un paciente en la clínica, la Ley N.° 8968 exige contar con una prueba auditable del consentimiento previo, expreso e informado para el tratamiento de sus datos sensibles de salud. Este flujo valida la aceptación de los términos antes de activar la cuenta y automatiza el envío del correo institucional de bienvenida.
* **Disparador (Trigger):** `Webhook: Registro de Usuario` escuchando en `POST /webhook/medivault-onboarding`.
* **Pasos del Flujo:**
  1. **Webhook:** Recibe el payload con datos del nuevo usuario (`email`, `fullName`, `termsAccepted`, `privacyAccepted`).
  2. **Validar Consentimiento:** Nodo condicional IF que confirma que las políticas fueron explícitamente aceptadas.
  3. **Registrar Consentimiento en BD:** Invoca la API interna `POST /api/governance/consent` para persistir la traza inmutable (IP, timestamp y marco legal).
  4. **Notificación de Bienvenida:** Envía correo de confirmación de apertura de cuenta y recordatorio de confidencialidad al paciente.
  5. **Respuesta Webhook:** Retorna código HTTP `200 OK` al frontend para desbloquear la sesión.

---

### 2. Workflow 2: Sincronización Diaria del Tipo de Cambio Oficial del BCCR
* **Archivo:** `workflow-2-tipo-cambio-bccr.json`
* **Problema de Negocio que Resuelve:** Las clínicas privadas en Costa Rica facturan honorarios médicos y procedimientos especializados tanto en colones (₡) como en dólares ($). Este flujo evita la digitación manual y discrepancias contables sincronizando cada mañana el tipo de cambio oficial de compra y venta del Banco Central de Costa Rica (BCCR).
* **Disparador (Trigger):** `Cron Diario (6:00 AM L-V)` configurado con expresión `0 6 * * 1-5`.
* **Pasos del Flujo:**
  1. **Schedule Trigger:** Se dispara automáticamente de lunes a viernes a las 6:00 AM hora de Costa Rica.
  2. **Consultar API BCCR MediVault:** Llama al endpoint de backend `GET /api/external/exchange-rate`.
  3. **Validar Rango Razonable:** Comprueba que los valores de compra y venta sean numéricos válidos dentro de límites esperados (> ₡400).
  4. **Registrar en Auditoría MediVault:** Guarda en la bitácora de auditoría el evento de actualización para transparencia contable.
  5. **Notificar a Administración y Contabilidad:** Envía un resumen por correo electrónico a la gerencia con los tipos de cambio aplicables al día.
  6. **Ruta de Excepción:** Si el servicio del BCCR falla o está fuera de rango, envía una alerta al equipo técnico.

---

### 3. Workflow 3: Gestión y Anonimización por Derecho al Olvido (Ley N.° 8968)
* **Archivo:** `workflow-3-derecho-al-olvido-ley8968.json`
* **Problema de Negocio que Resuelve:** El Artículo 7 de la Ley N.° 8968 concede al titular de los datos el derecho de solicitar la supresión de sus datos personales. El centro médico debe contar con un proceso formal de desvinculación, anonimizando la información privada en base de datos mientras conserva los registros legalmente obligatorios (histórico fiscal durante 5 años según la normativa tributaria costarricense).
* **Disparador (Trigger):** `Webhook: Solicitud de Supresión ARCO` en `POST /webhook/medivault-derecho-olvido`.
* **Pasos del Flujo:**
  1. **Webhook:** Recibe la solicitud de baja iniciada desde el perfil del usuario.
  2. **Verificar Identidad y Token:** Comprueba la autenticidad de la petición para evitar supresiones maliciosas o accidentales.
  3. **Ejecutar Anonimización en BD:** Llama al backend en `POST /api/governance/process-deletion` que reemplaza datos personales por hashes irreversibles y desactiva credenciales.
  4. **Enviar Certificado de Supresión ARCO:** Envía notificación legal formal al correo del titular con su número de expediente ARCO generado.
  5. **Respuesta Webhook:** Retorna código `200 OK` indicando el cumplimiento de la baja conforme a la ley.

---

## 🚀 Cómo Importar en n8n
1. Abra su instancia local o nube de n8n.
2. Haga clic en el botón superior **Workflows** -> **Import from File...**.
3. Seleccione cualquiera de los archivos `.json` ubicados en esta carpeta.
4. Active el switch **Active** en la esquina superior derecha para habilitar los disparadores.
