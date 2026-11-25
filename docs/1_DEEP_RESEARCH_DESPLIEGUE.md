# 🌐 Deep Research: Despliegue de Aplicaciones Node.js en Producción
**Proyecto:** MediVault - Bóveda Médica y Expediente Clínico Seguro  
**Asignatura:** Desarrollo Web Full Stack & Seguridad de Software  
**Fecha:** Noviembre 2026  
**Autores:** Equipo de Desarrollo MediVault  

---

## Resumen Ejecutivo

El paso de un prototipo de software en Node.js desde el entorno de desarrollo local («*funciona en mi máquina*») hacia un entorno de producción accesible por Internet requiere satisfacer estrictos estándares de disponibilidad, rendimiento, aislamiento de red y seguridad perimetral. Este reporte de investigación profunda analiza exhaustivamente los paradigmas de alojamiento modernos (PaaS, contenedores Docker e IaaS/VPS), la gestión segura de variables de entorno y secretos criptográficos sin exposición en repositorios, la arquitectura de proxies inversos y certificados TLS/HTTPS automáticos, los pipelines de integración y entrega continua (CI/CD) mediante GitHub Actions, y las estrategias de verificación post-despliegue bajo los estándares de la industria y el OWASP Top 10:2025.

---

## 1. Comparativa Arquitectónica: PaaS vs. Contenedores (Docker) vs. VPS / IaaS

| Criterio | PaaS (Platform as a Service)<br>*(Render, Railway, Fly.io)* | Contenedores (Docker / CaaS)<br>*(Google Cloud Run, AWS ECS)* | VPS / IaaS (Infrastructure as a Service)<br>*(AWS EC2, DigitalOcean)* |
| :--- | :--- | :--- | :--- |
| **Nivel de Control** | Bajo a Medio. La plataforma gestiona el SO, parches de seguridad, balanceo y runtime. | Alto sobre el entorno de ejecución (Dockerfile); medio sobre el clúster subyacente. | Total. Acceso root al sistema operativo (Linux), configuración de kernel y redes. |
| **Ventajas** | Despliegue inmediato desde Git, HTTPS automático, cero administración de servidores, integración de CI/CD nativa. | Entornos reproducibles e idénticos en dev y prod, portabilidad multi-nube, inicio rápido, escalado a cero (*serverless*). | Costo fijo predecible, personalización absoluta de reglas de firewall (`iptables`, `ufw`), sin límites arbitrarios de CPU/RAM. |
| **Desventajas** | Costos elevados al escalar, menor flexibilidad para configuraciones profundas del kernel o módulos C++. | Requiere diseñar y mantener imágenes seguras (escaneo de vulnerabilidades, usuario no root). | Requiere mantenimiento manual de parches de seguridad, configuración de proxy inverso, certificados y respaldos. |
| **Complejidad Operativa**| Muy Baja (ideal para equipos enfocados en el producto). | Media (requiere dominar Dockerfile, registries y variables). | Alta (requiere conocimientos de SysAdmin, Linux hardening y DevOps). |
| **Modelo de Costos** | Pago por recurso activo o planes por niveles; planes gratuitos limitados. | Pago por consumo exacto de CPU/segundo y memoria (muy económico en baja concurrencia). | Costo mensual fijo por máquina virtual (desde \$4-\$6/mes). |

---

## 2. Comparativa de Plataformas con Planes Educativos / Gratuitos Vigentes

Para la selección del entorno de despliegue de **MediVault**, se analizaron tres proveedores cloud de amplia adopción:

| Característica | Render | Railway | Fly.io |
| :--- | :--- | :--- | :--- |
| **Límites de Recursos** | 512 MB RAM, 0.1 CPU compartida en Free Tier. | \$5 de crédito mensual o plan Hobby/Educativo (\$5/mes). | 256 MB RAM por micro-VM (hasta 3 máquinas en free tier). |
| **Inactividad / Sleep** | **Sí**, la instancia entra en suspensión tras 15 minutos sin peticiones. *Cold start* de 30-50s. | **No**, el servicio permanece activo mientras existan créditos en el plan. | Se puede configurar suspensión automática o mantener activo 24/7. |
| **Bases de Datos** | PostgreSQL gestionada (expira a los 30 días en plan gratuito). | PostgreSQL, MySQL y Redis aprovisionables con un clic en red privada. | Soporte nativo para SQLite persistente (Fly Volumes) o Postgres en cluster. |
| **HTTPS Automático** | Sí, gestionado por Cloudflare / Let's Encrypt con renovación automática. | Sí, certificados SSL automáticos en dominios `.up.railway.app` y propios. | Sí, certificados TLS automáticos y Anycast global DNS. |
| **Regiones Disponibles** | Oregón, Ohio (EE.UU.), Fráncfort (Alemania), Singapur. | US-West, US-East, Europa. | Más de 30 regiones globales (incluyendo Querétaro, Miami, Sao Paulo). |

---

## 3. Gestión de Variables de Entorno y Secretos en Producción

En entornos de desarrollo es habitual emplear archivos `.env` mediante librerías como `dotenv`. Sin embargo, en producción un archivo `.env` en disco representa un vector crítico de compromiso:
* **Riesgo de fuga al repositorio:** Si `.env` se añade accidentalmente a Git, las llaves maestras de cifrado (`DATA_ENCRYPTION_KEY`) y tokens quedan comprometidos permanentemente en el historial.
* **Falta de rotación y auditoría:** Un archivo plano no ofrece trazabilidad de quién accedió a la llave ni cuándo.

**Solución en Producción:**
1. **Gestores de Secretos de Plataforma:** Servicios como *Render Environment Secrets*, *Railway Variables*, *AWS Secrets Manager* o *HashiCorp Vault* inyectan las credenciales directamente en la memoria del proceso (`process.env`) en tiempo de arranque, sin escribir archivos en disco.
2. **Defensa en Profundidad:** El repositorio contiene únicamente `.env.example` con los nombres de las variables sin valores reales.

---

## 4. Certificados TLS, Let's Encrypt y HSTS

* **Certificado TLS (Transport Layer Security):** Garantiza confidencialidad (cifrado asimétrico en el *handshake* y simétrico en el flujo de datos) e integridad de los datos en tránsito entre el navegador y el servidor.
* **Let's Encrypt:** Autoridad de Certificación (CA) automatizada y abierta que implementa el protocolo **ACME** (*Automated Certificate Management Environment*). Verifica la titularidad del dominio mediante desafíos HTTP-01 o DNS-01 y emite certificados con validez de 90 días, renovándolos automáticamente sin intervención humana.
* **HSTS (HTTP Strict Transport Security):** Cabecera de respuesta HTTP (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`) que instruye a los navegadores a conectarse exclusivamente mediante HTTPS durante el tiempo indicado, neutralizando ataques de degradación como *SSL-Stripping* y ataques *Man-in-the-Middle* (MitM).

---

## 5. El Rol del Proxy Inverso (Nginx / Caddy / Cloudflare) y `trust proxy` en Express

Colocar a Node.js directamente frente al tráfico público de Internet es una mala práctica de seguridad y rendimiento. Un proxy inverso (como Nginx o el balanceador del PaaS) aporta:
1. **Terminación TLS eficiente:** Descarga el procesamiento criptográfico de la CPU de Node.js.
2. **Mitigación de ataques DoS y Slowloris:** Gestiona miles de conexiones lentas en memoria de bajo nivel antes de pasar la solicitud a Express.
3. **Servicio optimizado de archivos estáticos:** El frontend compilado de React se sirve sin cargar el bucle de eventos (*event loop*) de Node.js.

### La directiva `app.set('trust proxy', 1)` en Express
Cuando Express opera detrás de un proxy inverso, las solicitudes HTTP le llegan desde la IP del proxy (ej. `10.0.0.1` o `127.0.0.1`). Si no se configura `app.set('trust proxy', 1)`:
* La función `req.ip` devolverá la dirección interna del proxy y no la del cliente real.
* El middleware de *rate limiting* bloqueará a **todos** los usuarios de la plataforma cuando un solo atacante exceda el umbral.
* La bandera `secure: true` de las cookies de sesión no funcionará porque Express creerá que la petición llegó por HTTP simple.

---

## 6. Gestores de Procesos (PM2, systemd) vs. Contenedores y PaaS

* **Entorno VPS clásico:** Node.js es de un solo hilo (*single-threaded*). Si una excepción no controlada lanza un `uncaughtException`, el proceso finaliza y la aplicación queda fuera de servicio. Un gestor de procesos como **PM2** o un servicio de **systemd** monitorea el PID y reinicia la aplicación en milisegundos.
* **Entornos en Contenedores y PaaS:** En Docker, Kubernetes o PaaS (Render/Railway), el orquestador asume la función del gestor de procesos. La política `restart: unless-stopped` en Docker reinicia automáticamente el contenedor si este termina con código distinto de cero. En estos entornos no se recomienda usar PM2, ya que interfiere con el manejo de señales Unix (`SIGTERM`, `SIGINT`) requeridas para un apagado seguro (*graceful shutdown*).

---

## 7. Integración y Entrega Continua (CI/CD) con GitHub Actions

Un pipeline mínimo de CI/CD para una aplicación Node.js segura debe validar la integridad del código en cada commit y pull request antes de permitir el despliegue a producción.

**Estructura del Pipeline Implementado en MediVault (`.github/workflows/ci.yml`):**
1. **Checkout:** Clona el repositorio con historial completo.
2. **Setup Node.js:** Instala la versión activa LTS (Node.js 24).
3. **Escaneo de Secretos:** Ejecuta *Gitleaks* para prevenir la subida de llaves criptográficas o credenciales.
4. **Instalación Reproducible:** Ejecuta `npm ci` respetando estrictamente `package-lock.json`.
5. **Auditoría de Dependencias:** Ejecuta `npm audit --audit-level=high` para bloquear vulnerabilidades en la cadena de suministro (OWASP A03).
6. **Ejecución de Pruebas Automatizadas:** Corre la suite completa de Jest (cifrado, IDOR, roles, validación Zod).
7. **Compilación de Producción:** Construye el bundle estático de React con `npm run build`.

---

## 8. Bases de Datos Gestionadas y Seguridad de Conexión

Servicios como Neon (Postgres Serverless), Supabase o MongoDB Atlas eliminan la carga de mantenimiento del motor de base de datos. Para garantizar la seguridad en producción:
* **Cifrado en Tránsito (TLS/SSL):** Parámetro `sslmode=require` obligatorio en la cadena de conexión.
* **Listas Blancas de IP (*IP Allowlisting*):** Restringir el acceso al puerto de la BD únicamente a las direcciones IP públicas del servidor web o conectar mediante redes privadas (VPC Peering / Private Networking).
* **Principio de Mínimo Privilegio:** Crear un usuario de base de datos específico para la aplicación web que solo posea permisos `SELECT`, `INSERT`, `UPDATE`, `DELETE`, sin privilegios de `SUPERUSER` ni `DROP DATABASE`.

---

## 9. Diferencias Críticas entre Entornos: Desarrollo vs. Producción

| Parámetro / Componente | Desarrollo (`development`) | Producción (`production`) |
| :--- | :--- | :--- |
| **`NODE_ENV`** | `development` | `production` (optimiza caché de Express y desactiva depuración). |
| **Manejo de Errores** | Muestra mensaje y traza para facilitar el debug. | **Mensaje genérico al cliente**; la traza solo se registra en logs internos (OWASP A10). |
| **Políticas CORS** | Permisivo para pruebas en `localhost:5173`. | **Restringido estrictamente** al dominio oficial de la aplicación. |
| **Cookies de Sesión** | `secure: false`, `sameSite: 'lax'` (permite HTTP local). | `secure: true`, `httpOnly: true`, `sameSite: 'lax'` (exclusivo HTTPS). |
| **Registro de Logs** | Salida enriquecida en consola con formato texto legible. | **JSON estructurado** con enmascaramiento de datos sensibles (OWASP A09). |

---

## 10. Verificaciones de Seguridad Posteriores al Despliegue

Tras publicar la aplicación, deben ejecutarse las siguientes pruebas de verificación:
1. **OWASP ZAP (Zed Attack Proxy):** Escaneo de línea base (*Baseline Scan*) para detectar cabeceras ausentes, fugas de información y rutas expuestas.
2. **SecurityHeaders.com:** Validación de cabeceras HTTP de seguridad (CSP, HSTS, X-Content-Type-Options, Referrer-Policy) apuntando a calificación **A o A+**.
3. **Qualys SSL Labs (SSL Test):** Evaluación de la robustez del certificado TLS, suite de cifrado simétrico y soporte de TLS 1.2/1.3, buscando calificación **A+**.
4. **Pruebas Manuales de Penetración:** Intentos deliberados de IDOR (manipular IDs de notas ajenas), inyección de SQL en el login y fuerza bruta (validando la respuesta HTTP 429).

---

## 11. Plan de Despliegue Propuesto para MediVault

### Arquitectura de Producción
```
[ Usuario / Cliente HTTPS ]
           │
           ▼
[ Cloudflare / Reverse Proxy ] (Terminación TLS 1.3, HSTS, WAF, DDoS Protection)
           │
           ▼
[ MediVault Node.js Express ] (app.set('trust proxy', 1), Helmet, Rate Limiter)
     ├── Servidor de Archivos Estáticos: React SPA compilada (/dist)
     ├── Capa de Lógica: Controladores, 8 Agentes de IA, Conexión a APIs (BCCR, Hacienda)
     └── Capa de Seguridad: AES-256-GCM + Bcrypt 12 + JWT HS256
           │
           ▼
[ Base de Datos Relacional SQLite / PostgreSQL ] (Conexión cifrada, ACID, Indices de Seguridad)
```

* **Plataforma Elegida:** Render / Railway con contenedor Docker con usuario no privilegiado (`USER node`).
* **Justificación:** Proporciona HTTPS automático respaldado por Let's Encrypt, aislamiento mediante contenedores, reinicio automático en caso de falla, inyección de variables de entorno en memoria y fácil integración con GitHub Actions.

---

## Referencias Bibliográficas

1. **OWASP Foundation.** (2025). *OWASP Top 10:2025 - The Ten Most Critical Web Application Security Risks*. https://owasp.org/Top10/2025/
2. **OWASP Cheat Sheet Series.** (2025). *Nodejs Security Cheat Sheet & Cryptographic Storage Cheat Sheet*. https://cheatsheetseries.owasp.org/
3. **Node.js Documentation.** (2026). *Security Best Practices in Node.js Applications*. Node.js Official Guides. https://nodejs.org/en/learn/getting-started/security-best-practices
4. **Express.js Documentation.** (2026). *Production Best Practices: Performance and Security*. https://expressjs.com/en/advanced/best-practice-security.html
5. **Internet Engineering Task Force (IETF).** (2012). *RFC 6797: HTTP Strict Transport Security (HSTS)*. https://datatracker.ietf.org/doc/html/rfc6797
6. **National Institute of Standards and Technology (NIST).** (2020). *Special Publication 800-63B: Digital Identity Guidelines - Authentication and Lifecycle Management*. U.S. Department of Commerce.
7. **Let's Encrypt CA.** (2026). *How Let's Encrypt Works: ACME Protocol Specification*. https://letsencrypt.org/howitworks/
