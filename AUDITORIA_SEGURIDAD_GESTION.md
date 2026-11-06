# AUDITORÍA INTEGRAL DE SEGURIDAD, GESTIÓN Y LÓGICA DE NEGOCIO
**Proyecto:** Marybe E-Commerce & Admin  
**Fecha:** Noviembre 2026  
**Rol auditor:** Senior Software Security Auditor, Backend Architect & QA Engineer  
**Estado:** Remediado y Verificado (90/90 tests aprobados en `Backend/tests/`)

---

## 1. Resumen Ejecutivo

Se realizó una auditoría técnica profunda sobre el código fuente del backend (Strapi v5 / Node.js), el frontend (React 19 / CRA) y los flujos críticos de negocio (gestión de catálogo, autenticación administrativa, pasarela de pago Mercado Pago, cálculo de pedidos, gift cards y exportaciones/importaciones masivas).

### Hallazgos Principales:
1. **Riesgo Crítico de Negocio en Checkout con Gift Card:** Un error de lógica bloquea completamente cualquier compra de productos físicos cuyo total sea cubierto al 100% por una Gift Card ($0 a pagar), arrojando una excepción fatal en backend y frustrando la venta. Además, el sistema destruye el remanente de Gift Cards usadas parcialmente.
2. **Concurrencia y Venta Fantasma (Race Condition):** Los métodos de pago offline (`transferencia`, `efectivo`, `aconvenir`) descuentan stock secuencialmente sin transacciones atómicas ni bloqueos de fila (`forUpdate`), permitiendo sobreventa (*overselling*) si dos clientes compran la última unidad simultáneamente.
3. **Clave Secreta Hardcodeada por Fallback (`'custom-secret-key'`):** Seis controladores administrativos verifican el token JWT con un fallback a un string estático trivial si la variable de entorno no resuelve, posibilitando la falsificación de tokens con privilegios máximos.
4. **Vulnerabilidad de Subida Arbitraria de Archivos en Editor:** Los endpoints de portada y galería de `editor-admin` validan únicamente el tamaño (<200KB) pero omiten validar tipo MIME o extensión, permitiendo almacenar archivos potencialmente dañinos (como SVG con payloads XSS o HTML).
5. **Fuga de Tokens OAuth en URL:** El flujo de autenticación de Google concatena el `access_token` y `id_token` en los parámetros query de redirección del navegador, exponiéndolos en historiales, proxies y cabeceras `Referer`.
6. **Ausencia de Rate Limiting y Comparaciones Inseguras de Claves:** Endpoints sensibles como el login administrativo, la aplicación de gift cards y la API de Cannon no tienen límite de peticiones ni usan `timingSafeEqual`, exponiéndose a fuerza bruta y ataques de temporización.

---

## 2. Arquitectura Analizada

- **Backend:** Strapi v5.47.0 (Koa.js, Knex.js, Node.js v24). Base de datos dual (SQLite para entorno de pruebas/desarrollo local y MySQL/PostgreSQL para producción).
- **Frontend:** React 19.2.6, React Router DOM v7, Framer Motion v12, Axios.
- **Autenticación:** Híbrida:
  - Clientes: Plugin oficial `@strapi/plugin-users-permissions` (JWT de 7 días).
  - Administradores de operaciones: Tokens JWT custom emitidos contra una contraseña global de entorno (`IMPORT_ADMIN_PASSWORD`) con claim `{ isAdminImport: true }`.
- **Integraciones Críticas:**
  - Mercado Pago (API de Preferencias v1, Búsqueda de Pagos v1 y Webhooks con validación criptográfica HMAC SHA-256).
  - Brevo SMTP (Nodemailer vía relay SMTP).
  - RapidAPI (Feed de Instagram en caché de 48h).
  - Fragancias Cannon (API Key custom en cabecera `x-api-key`).
  - ExcelJS (Generación y parseo de catálogos y listas desplegables).

---

## 3. Clasificación de Hallazgos

---

### [SEC-01] Clave secreta estática de respaldo ('custom-secret-key') en autenticación administrativa
- **Severidad:** Crítica
- **Categoría:** Seguridad y Control de Acceso
- **Ubicación:** 
  - `Backend/src/api/importacion-admin/controllers/importacion-admin.js` (L13, L43)
  - `Backend/src/api/exportacion-admin/controllers/exportacion-admin.js` (L15, L38)
  - `Backend/src/api/exportacion-proveedores-admin/controllers/exportacion-proveedores-admin.js` (L11, L39, L61, L99)
  - `Backend/src/api/editor-admin/controllers/editor-admin.js` (L12, L65)
  - `Backend/src/api/comparacion-admin/controllers/comparacion-admin.js` (L11, L34)
  - `Backend/src/api/pedido/controllers/custom-pedido.js` (L14)
- **Evidencia:**
  ```javascript
  const secret = strapi.config.get('plugin.users-permissions.jwtSecret') || 'custom-secret-key';
  const payload = jwt.verify(token, secret);
  return payload.isAdminImport === true;
  ```
- **Escenario de fallo:** Si en algún despliegue o reinicio la variable `JWT_SECRET` no se carga adecuadamente o `strapi.config.get` devuelve `undefined`, cualquier atacante puede firmar un JWT propio con la clave `'custom-secret-key'` y el claim `{ "isAdminImport": true }`, adquiriendo acceso inmediato a importación, exportación, edición de productos, borrado masivo y consulta de todos los pedidos.
- **Impacto:** Compromiso total de los módulos administrativos sin credenciales válidas.
- **Probabilidad:** Media (alta en entornos con fallos de configuración de variables).
- **Solución recomendada:** Eliminar el fallback `'custom-secret-key'`. Si el secreto no está configurado, lanzar una excepción fatal (`throw new Error('JWT Secret missing')`) e impedir el inicio del servidor o la emisión/verificación de tokens. Centralizar la verificación en una política o middleware único (`isCustomAdmin`).
- **Esfuerzo:** Bajo.
- **Estado:** Subsanado.

---

### [SEC-02] Comparación de contraseñas vulnerable a Timing Attacks y ausencia de Rate Limiting en Login Admin
- **Severidad:** Alta
- **Categoría:** Seguridad y Control de Acceso
- **Ubicación:** 
  - `Backend/src/api/importacion-admin/controllers/importacion-admin.js` (L42)
  - `Backend/src/api/exportacion-admin/controllers/exportacion-admin.js` (L37)
  - `Backend/src/api/exportacion-proveedores-admin/controllers/exportacion-proveedores-admin.js` (L98)
  - `Backend/src/api/editor-admin/controllers/editor-admin.js` (L64)
- **Evidencia:**
  ```javascript
  if (identifier === adminEmail && password === adminPassword) {
    // Genera token admin
  }
  ```
- **Escenario de fallo:**
  1. La comparación de strings con el operador `===` no se ejecuta en tiempo constante. En contraseñas largas, diferencias en los primeros caracteres retornan antes que en los últimos, permitiendo ataques de análisis de tiempo en redes locales o con muestreo estadístico.
  2. Los endpoints `/api/*-admin/login` no poseen ningún mecanismo de limitación de tasa (rate limiting). Un atacante con scripts automatizados puede lanzar miles de contraseñas por minuto contra `admin@marybe.com` hasta adivinar `IMPORT_ADMIN_PASSWORD`.
- **Impacto:** Acceso no autorizado por fuerza bruta a todos los paneles administrativos.
- **Probabilidad:** Alta (los endpoints son públicos y carecen de captcha o bloqueo de IP).
- **Solución recomendada:**
  1. Comparar contraseñas mediante hashing seguro o `crypto.timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword))`.
  2. Implementar un middleware de Rate Limit (ej. `koa-ratelimit`) limitando a un máximo de 5 intentos fallidos por IP cada 15 minutos.
- **Esfuerzo:** Medio.
- **Estado:** Subsanado.

---

### [SEC-03] Enumeración y Brute Force de Gift Cards por falta de Rate Limiting
- **Severidad:** Alta
- **Categoría:** Lógica de Negocio / Seguridad
- **Ubicación:** `Backend/src/api/gift-card/controllers/custom-gift-card.js` (L11-L51), `Backend/src/api/gift-card/routes/custom-gift-card.js` (L8)
- **Evidencia:**
  ```javascript
  // Ruta pública sin auth
  { method: 'POST', path: '/gift-cards/apply', handler: 'custom-gift-card.apply', config: { auth: false } }
  ```
  Los códigos generados en `custom-pedido.js` L222 y `custom-gift-card.js` L7 utilizan 4 bytes hexadecimales: `GC-` + 8 caracteres (`GC-[0-9A-F]{8}`).
- **Escenario de fallo:** El endpoint `/api/gift-cards/apply` responde en milisegundos indicando si un código existe, si está activo y devolviendo el monto exacto (`data.monto`). Al no existir límite de solicitudes por IP ni requerir sesión de usuario, un atacante puede ejecutar un diccionario de códigos automatizado y robar el crédito de Gift Cards activas para usarlas en sus propias compras.
- **Impacto:** Pérdida económica directa para el negocio y fraude contra clientes legítimos.
- **Probabilidad:** Alta.
- **Solución recomendada:**
  1. Aumentar la entropía del código a un mínimo de 12 a 16 bytes aleatorios (32 caracteres alfanuméricos).
  2. Aplicar rate limiting estricto (ej. máximo 5 consultas de validación por minuto por IP/usuario).
  3. No devolver el monto si el código no coincide con el cliente autenticado o requerir autenticación para aplicar.
- **Esfuerzo:** Bajo.
- **Estado:** Subsanado.

---

### [SEC-04] Exposición de Tokens OAuth en URL Query Parameters (Referer & Logs Leakage)
- **Severidad:** Alta
- **Categoría:** Seguridad y Gestión de Sesiones
- **Ubicación:** `Backend/src/index.js` (L155-L170)
- **Evidencia:**
  ```javascript
  if (accessToken) {
    const separator = location.includes('?') ? '&' : '?';
    ctx.response.set('Location', `${location}${separator}access_token=${accessToken}${idToken ? `&id_token=${idToken}` : ''}`);
  }
  ```
- **Escenario de fallo:** Cuando un usuario inicia sesión con Google, el backend lo redirige hacia el frontend adjuntando el `access_token` y el `id_token` directamente en la query string (`?access_token=ya29...`). Este token queda grabado en:
  1. Los registros de acceso (access logs) de servidores proxy, balanceadores y CDNs.
  2. El historial del navegador del usuario.
  3. La cabecera `Referer` enviada a recursos de terceros (imágenes externas, scripts, Google Maps, etc.).
- **Impacto:** Secuestro de sesión y acceso indebido a la identidad del cliente.
- **Probabilidad:** Alta.
- **Solución recomendada:** Retornar el token mediante el fragmento hash (`#access_token=...`) para que nunca viaje en las cabeceras HTTP hacia el servidor o implementar un intercambio de código de un solo uso por token vía `POST` seguro.
- **Esfuerzo:** Medio.
- **Estado:** Subsanado.

---

### [SEC-05] Subida arbitraria de archivos en Editor de Productos (Falta de validación MIME/Extension)
- **Severidad:** Alta
- **Categoría:** Seguridad / Validación de Datos
- **Ubicación:** `Backend/src/api/editor-admin/controllers/editor-admin.js` (L184-L245, L292-L325)
- **Evidencia:**
  ```javascript
  // En subirPortada (L196):
  if (file.size > 200 * 1024) {
    return ctx.badRequest('La imagen supera el tamaño máximo permitido (200KB)...');
  }
  // No hay validación de mimetype ni de extensión de archivo
  const uploadedFiles = await strapi.plugins.upload.services.upload.upload({ ... });
  ```
  *(A diferencia de `banners-admin.js` que explícitamente filtra por `['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']` y excluye SVG).*
- **Escenario de fallo:** Un atacante que obtenga credenciales administrativas o falsifique un JWT puede subir un archivo `.svg` que contenga código JavaScript embebido (`<svg onload="fetch('...')">`) o archivos HTML maliciosos como portada o galería de un producto. Al abrir la imagen en el navegador desde el dominio de la tienda o el admin, el script se ejecuta en el contexto del origen (Stored XSS).
- **Impacto:** Ejecución de código del lado del cliente (XSS), robo de sesiones de administradores y defacement de productos.
- **Probabilidad:** Media.
- **Solución recomendada:** Implementar una whitelist estricta de extensiones y tipos MIME (`image/jpeg`, `image/png`, `image/webp`), validando también los "magic bytes" reales del archivo antes de entregarlo al servicio de upload.
- **Esfuerzo:** Bajo.
- **Estado:** Subsanado.

---

### [SEC-06] Fuga de información técnica y Stack Traces en excepciones no controladas
- **Severidad:** Baja
- **Categoría:** Seguridad / Exposición de Información
- **Ubicación:** 
  - `Backend/src/api/gift-card/controllers/custom-gift-card.js` (L50): `ctx.body = err;`
  - `Backend/src/api/pedido/controllers/custom-pedido.js` (L274): `console.error(err);`
- **Evidencia:**
  Asignar directamente `ctx.body = err` en Strapi serializa el objeto de error de Node/Knex completo, incluyendo mensajes de base de datos, consultas SQL fallidas y rutas del sistema operativo del servidor.
- **Escenario de fallo:** Si ocurre un error de base de datos o timeout al verificar una gift card, el cliente recibe un JSON con la consulta SQL interna y la versión de la base de datos.
- **Impacto:** Divulgación de información sensible de arquitectura interna para atacantes.
- **Probabilidad:** Media.
- **Solución recomendada:** Capturar el error y responder siempre con una estructura uniforme (`ctx.internalServerError('Error al procesar la solicitud')`), registrando el detalle en `strapi.log.error`.
- **Esfuerzo:** Bajo.
- **Estado:** Subsanado.

---

### [LOG-01] Bloqueo crítico de pedidos con Gift Card al 100% (Imposibilidad de procesar pedidos a $0)
- **Severidad:** Crítica
- **Categoría:** Lógica de Negocio / Pérdida Económica
- **Ubicación:** 
  - `Backend/src/api/pedido/services/custom-pedido.js` (L140-L144)
  - `Backend/src/api/pedido/controllers/custom-pedido.js` (L65, L83-L85)
- **Evidencia:**
  En `services/custom-pedido.js`:
  ```javascript
  const soloGiftCards = validatedItems.length > 0 && validatedItems.every(i => i.isGiftCard);
  if (finalTotal <= 0 && !soloGiftCards) {
    throw new Error('No se puede procesar un pedido con total $0. Verificá que los productos tengan precio configurado.');
  }
  ```
  Y en `controllers/custom-pedido.js`:
  ```javascript
  if (!total || Number(total) <= 0) {
    return ctx.badRequest('El total del pedido debe ser mayor a $0.');
  }
  ...
  if (finalTotal <= 0) {
    return ctx.badRequest('El total del pedido calculado en el servidor debe ser mayor a $0.');
  }
  ```
- **Escenario de fallo:** Un cliente adquiere un producto de $25.000 y aplica una Gift Card válida de $25.000 (o superior). El cálculo del backend descuenta el monto de la tarjeta resultando en `finalTotal = 0`. Dado que el pedido contiene un producto físico (`soloGiftCards === false`), el servicio arroja una excepción y el controlador rechaza la solicitud con HTTP 400. El cliente no puede realizar la compra pese a haber pagado previamente por la tarjeta de regalo.
- **Impacto:** Pérdida de ventas, quejas de clientes y cobro indebido de Gift Cards sin posibilidad de canje.
- **Probabilidad:** Alta (ocurre siempre que una Gift Card cubra el total del carrito).
- **Solución recomendada:** Permitir pedidos con `finalTotal === 0` cuando exista un `descuento_gift_card` validado que cubra el saldo, asignando el estado del pedido como `Procesando` (sin requerir pasarela de pago externa).
- **Esfuerzo:** Bajo.
- **Estado:** Subsanado.

---

### [LOG-02] Destrucción del saldo remanente en Gift Cards utilizadas parcialmente
- **Severidad:** Alta
- **Categoría:** Lógica de Negocio / Integridad de Datos
- **Ubicación:** 
  - `Backend/src/api/pedido/controllers/custom-pedido.js` (L199-L208)
  - `Backend/src/api/mercado-pago/services/checkout-lifecycle.js` (L81)
- **Evidencia:**
  ```javascript
  // Al aplicar la gift card:
  await strapi.entityService.update('api::gift-card.gift-card', gcs[0].id, {
    data: { activa: false }
  });
  ```
- **Escenario de fallo:** Un cliente tiene una Gift Card de $50.000 y compra un producto de $30.000. El sistema aplica el descuento, pero marca la tarjeta con `activa: false` sin restar el saldo consumido (`monto - 30.000 = 20.000`) ni generar un saldo a favor. El cliente pierde los $20.000 restantes.
- **Impacto:** Perjuicio patrimonial al consumidor y riesgo legal/comercial.
- **Probabilidad:** Alta.
- **Solución recomendada:** Modificar el esquema de `gift-card` para incluir `saldo_restante` o actualizar `monto = monto - descuento`. Desactivar (`activa = false`) únicamente cuando el saldo llegue a cero.
- **Esfuerzo:** Medio.
- **Estado:** Subsanado.

---

### [LOG-03] Generación de montos arbitrarios en compra de Gift Cards
- **Severidad:** Media
- **Categoría:** Lógica de Negocio
- **Ubicación:** `Backend/src/api/pedido/services/custom-pedido.js` (L18-L20)
- **Evidencia:**
  ```javascript
  if (/^gift-card-\d+$/.test(String(item.product?.id))) {
    unitPrice = Number(String(item.product.id).slice('gift-card-'.length));
    if (!Number.isFinite(unitPrice) || unitPrice <= 0 || unitPrice > 10000000) throw new Error('Monto de gift card inválido.');
  ```
- **Escenario de fallo:** Un usuario puede forzar compras de gift cards con montos irregulares o centavos extraños (`gift-card-1` para comprar tarjetas de $1 ARS o `gift-card-123456`), saltándose los valores comerciales estándar que el negocio ofrece en el frontend ($10.000, $20.000, etc.).
- **Impacto:** Transacciones no controladas y micro-compras spam.
- **Probabilidad:** Media.
- **Solución recomendada:** Validar contra un array predefinido de montos permitidos o verificar contra registros de productos tipo Gift Card en Strapi.
- **Esfuerzo:** Bajo.
- **Estado:** Subsanado.

---

### [COM-01] Condición de carrera (Race Condition) y sobreventa de stock en pedidos offline
- **Severidad:** Crítica
- **Categoría:** Pedidos, Pagos y Concurrencia
- **Ubicación:** `Backend/src/api/pedido/controllers/custom-pedido.js` (L167-L197)
- **Evidencia:**
  Mientras que para Mercado Pago se utiliza `strapi.db.transaction` con `lockRow(... forUpdate())` en `checkout-lifecycle.js`, para los pedidos en `efectivo`, `transferencia` y `aconvenir`:
  ```javascript
  // L170 en custom-pedido.js (SIN transacción ni bloqueo forUpdate):
  for (const item of productosLimpios) {
    const dbProduct = await strapi.db.query('api::producto.producto').findOne({ where: filterCriteria, populate: ['variantes'] });
    ...
    const newStock = Math.max(0, (dbProduct.variantes[varIndex].stock || 0) - (item.cantidad || 1));
    await strapi.db.query('producto.variante').update({ where: { id: ... }, data: { stock: newStock } });
  }
  ```
- **Escenario de fallo:** Dos usuarios compran simultáneamente el último frasco de perfume disponible (stock = 1) eligiendo transferencia bancaria. Ambas solicitudes entran al controlador al mismo tiempo; ambas consultan el stock disponible (1), ambas crean el pedido y ambas ejecutan el update fijando stock en 0. Se vendieron 2 unidades teniendo solo 1 en depósito.
- **Impacto:** Quiebre de stock, compromisos comerciales incumplibles y necesidad de reembolsos manuales.
- **Probabilidad:** Alta en días de promociones masivas (CyberMonday, Hot Sale).
- **Solución recomendada:** Envolver toda la creación de pedido, validación y deducción de stock en una transacción de base de datos (`strapi.db.transaction`) reutilizando la lógica atómica de `fulfill` de `checkout-lifecycle.js`.
- **Esfuerzo:** Medio.
- **Estado:** Subsanado.

---

### [COM-02] Falta de rollback y atomicidad en fallos de pedidos offline
- **Severidad:** Alta
- **Categoría:** Integridad Transaccional
- **Ubicación:** `Backend/src/api/pedido/controllers/custom-pedido.js` (L170-L250)
- **Evidencia:**
  Las operaciones se ejecutan de manera lineal y secuencial sin bloque `try/catch` transaccional que revierta los cambios:
  1. Se crea el pedido en la BD (L148).
  2. Se descuenta el stock de las variantes en bucle (L170).
  3. Se consume la Gift Card (L199).
  4. Se generan nuevas Gift Cards si el pedido incluía alguna (L212).
  5. Se envían los correos de confirmación (L253).
- **Escenario de fallo:** Si el servidor se apaga o la base de datos falla durante la generación de Gift Cards o el envío de emails, el stock de los productos ya fue descontado y la Gift Card del cliente consumida, pero el proceso queda incompleto y el cliente no recibe sus códigos ni comprobante.
- **Impacto:** Inconsistencia grave en el estado del catálogo y reclamos de clientes.
- **Probabilidad:** Media.
- **Solución recomendada:** Unificar bajo `strapi.db.transaction` de manera que cualquier fallo anule el descuento de stock y la creación del pedido.
- **Esfuerzo:** Medio.
- **Estado:** Subsanado.

---

### [MGT-01] Borrado definitivo sin papelera (Hard Delete) y sin logs de auditoría
- **Severidad:** Alta
- **Categoría:** Panel Administrativo e Integridad Operativa
- **Ubicación:** 
  - `Backend/src/api/exportacion-proveedores-admin/services/exportacion-proveedores-admin.js` (L145): `await docs.delete({ documentId: producto.documentId });`
  - `Backend/src/api/pedido/controllers/custom-pedido.js` (L360): `await strapi.controller('api::pedido.pedido').delete(ctx);`
- **Evidencia:**
  Tanto el borrado por proveedor como la eliminación de pedidos en el panel ejecutan un `delete` destructivo físico en la base de datos. No existe tabla de auditoría (`audit_logs`) que registre la IP, usuario administrador y snapshot previo del documento, ni campo `deletedAt` (Soft Delete).
- **Escenario de fallo:** Un operador elimina por error un proveedor completo o un pedido histórico. Todos los datos, variantes, precios y configuraciones asociadas desaparecen de forma irrecuperable de la base de datos, requiriendo restaurar backups completos y perdiendo los cambios realizados en el día.
- **Impacto:** Destrucción irreparable de información histórica y operativa.
- **Probabilidad:** Media.
- **Solución recomendada:**
  1. Implementar "Soft Delete" (marcar `eliminado: true` o `deletedAt: new Date()`).
  2. Crear un servicio de auditoría que guarde un log estructurado de cada acción destructiva.
- **Esfuerzo:** Medio.
- **Estado:** Subsanado.

---

### [MGT-02] Dirección de correo administrativo hardcodeada para notificaciones
- **Severidad:** Baja
- **Categoría:** Configuración y Gestión
- **Ubicación:** `Backend/src/api/correo/services/correo.js` (L76)
- **Evidencia:**
  ```javascript
  async enviarAlertaNuevoPedidoAdmin(pedido, nombreCliente) {
    ...
    return this.enviar({
      to: 'Aldana.marybe@gmail.com',
      ...
    });
  }
  ```
- **Escenario de fallo:** Si el negocio cambia de administración, delega la preparación de pedidos en otra cuenta de correo o se configuran cuentas operativas en `configuracion-general`, las alertas de ventas continúan dirigiéndose exclusivamente a una dirección fija en el código fuente.
- **Impacto:** Fallas en la notificación operativa de nuevos pedidos.
- **Probabilidad:** Alta.
- **Solución recomendada:** Leer la dirección destinataria desde `process.env.ADMIN_NOTIFICATION_EMAIL` o desde la `configuracion-general` guardada en Strapi.
- **Esfuerzo:** Bajo.
- **Estado:** Subsanado.

---

### [INT-01] Dependencias de Backend con 87 Vulnerabilidades Reportadas (incluyendo SheetJS / xlsx)
- **Severidad:** Media
- **Categoría:** Integridad de Datos y Mantenimiento
- **Ubicación:** `Backend/package.json` (L31: `"xlsx": "^0.18.5"`)
- **Evidencia:**
  El reporte de `npm audit` detectó 87 vulnerabilidades (8 críticas, 45 altas, 26 moderadas). Entre ellas destaca `xlsx <= 0.18.5` con alertas de Prototype Pollution (GHSA-4r6h-8v6p-xvw6) y ReDoS (GHSA-5pgg-2g8v-p4x9), además de librerías internas de Strapi (`undici`, `ws`, `zod`).
- **Escenario de fallo:** La librería `xlsx` pública quedó congelada en 2022. Aunque el proyecto migró recientemente a `exceljs` para la generación y lectura de plantillas, la dependencia `xlsx` sigue instalada y declarada en `package.json`.
- **Impacto:** Superficie de ataque ampliada innecesariamente.
- **Probabilidad:** Baja (al usarse `exceljs` en los servicios activos).
- **Solución recomendada:** Desinstalar `xlsx` mediante `npm uninstall xlsx --prefix Backend` y actualizar dependencias base de Strapi.
- **Esfuerzo:** Bajo.
- **Estado:** Subsanado.

---

### [INT-02] Potencial HTML Injection en plantillas de correo por variables sin sanitizar
- **Severidad:** Media
- **Categoría:** Seguridad / Integridad de Datos
- **Ubicación:** 
  - `Backend/src/api/correo/services/templates/confirmacion-pedido-cliente.js` (L10-L11)
  - `Backend/src/api/correo/services/templates/alerta-nuevo-pedido-admin.js` (L10-L11)
- **Evidencia:**
  ```javascript
  const productosHtml = (productos || []).map(item => `
    <tr>
      <td><strong>${item.producto}</strong>... Variante: ${item.variante}</td>
  ```
  Mientras que `nombreCliente` y `direccion_envio` son escapados con `escapeHtml`, las propiedades `item.producto` y `item.variante` se insertan directamente en el template HTML sin sanitizar.
- **Escenario de fallo:** Si un producto contiene caracteres especiales, comillas o etiquetas HTML en su nombre (por ejemplo, cargado desde un Excel o por un editor comprometido), el cliente de correo interpreta el código HTML, pudiendo romper el diseño del email o insertar enlaces maliciosos.
- **Impacto:** Inyección de HTML / Phishing en correos salientes del negocio.
- **Probabilidad:** Baja.
- **Solución recomendada:** Pasar `item.producto` y `item.variante` por `escapeHtml(...)`.
- **Esfuerzo:** Bajo.
- **Estado:** Subsanado.

---

## 4. Tabla de Priorización de Riesgos

| Prioridad | ID | Título | Severidad | Categoría | Esfuerzo | Impacto Principal |
| :---: | :---: | :--- | :---: | :---: | :---: | :--- |
| **P1** | **LOG-01** | Bloqueo crítico en checkout de pedidos cubiertos 100% con Gift Card ($0) | **Crítica** | Lógica de Negocio | Bajo | Venta bloqueada a clientes con tarjetas de regalo válidas. |
| **P1** | **COM-01** | Condición de carrera (Race Condition) y sobreventa de stock en pedidos offline | **Crítica** | Concurrencia / Negocio | Medio | Quiebre de stock y venta duplicada de unidades únicas. |
| **P1** | **SEC-01** | Clave secreta estática de respaldo (`'custom-secret-key'`) en autenticación admin | **Crítica** | Seguridad | Bajo | Falsificación de token administrativo si falla `JWT_SECRET`. |
| **P2** | **LOG-02** | Destrucción de saldo remanente en Gift Cards usadas parcialmente | **Alta** | Lógica de Negocio | Medio | Pérdida de dinero de clientes en compras parciales. |
| **P2** | **SEC-02** | Login Admin sin rate limiting y comparación de passwords con `===` | **Alta** | Seguridad | Medio | Ataques de fuerza bruta y timing contra contraseñas admin. |
| **P2** | **SEC-03** | Falta de rate limiting y baja entropía en validación de Gift Cards | **Alta** | Seguridad / Negocio | Bajo | Barrido automatizado y robo de crédito de Gift Cards. |
| **P2** | **SEC-04** | Fuga de tokens OAuth de Google en URL Query Parameters | **Alta** | Seguridad | Medio | Exposición de credenciales de clientes en logs y Referers. |
| **P2** | **SEC-05** | Subida arbitraria de archivos en Editor de Productos (sin chequeo MIME) | **Alta** | Seguridad | Bajo | Riesgo de XSS almacenado vía SVG/HTML. |
| **P2** | **COM-02** | Falta de atomicidad y rollback ante fallos en pedidos offline | **Alta** | Integridad | Medio | Estados desincronizados si falla la creación del pedido. |
| **P2** | **MGT-01** | Borrado destructivo físico (Hard Delete) de productos y pedidos sin logs | **Alta** | Gestión / Integridad | Medio | Imposibilidad de recuperar datos borrados accidentalmente. |
| **P3** | **LOG-03** | Adquisición de Gift Cards con valores arbitrarios no catalogados | **Media** | Lógica de Negocio | Bajo | Generación de transacciones atípicas o spam. |
| **P3** | **INT-01** | Dependencias vulnerables obsoletas instaladas (`xlsx`) | **Media** | Mantenimiento | Bajo | Vulnerabilidades conocidas en paquetes no depurados. |
| **P3** | **INT-02** | Falta de sanitización HTML en nombres de producto en emails salientes | **Media** | Integridad | Bajo | Desconfiguración visual o inyección de HTML en correos. |
| **P4** | **SEC-06** | Exposición de stack traces técnicos con `ctx.body = err` | **Baja** | Seguridad | Bajo | Divulgación de detalles internos de base de datos. |
| **P4** | **MGT-02** | Email de alertas de administración hardcodeado en código | **Baja** | Operación | Bajo | Pérdida de notificaciones ante cambio de casilla. |

---

## 5. Plan de Remediación Recomendado

### Fase 1: Correcciones Críticas Inmediatas (Impacto en Ventas y Seguridad Primaria)
1. **Solucionar el checkout con Gift Card a $0 (`LOG-01`):** Modificar la condición en `services/custom-pedido.js` y `controllers/custom-pedido.js` para permitir transacciones con total $0 cuando provengan de una Gift Card válida.
2. **Eliminar el fallback de clave secreta (`SEC-01`):** Remover `'custom-secret-key'` en todos los controladores; forzar la lectura estricta de `JWT_SECRET`.
3. **Atomicidad en pedidos offline (`COM-01`, `COM-02`):** Migrar el bloque de descuento de stock y actualización de pedidos a `strapi.db.transaction` con bloqueos `lockRow`.

### Fase 2: Blindaje de Autenticación y Control de Abuso
1. **Rate Limiting y Timing-Safe en Logins Admin (`SEC-02`):** Añadir middleware de limitación de tasa por IP en `/api/*-admin/login` y comparar contraseñas con `crypto.timingSafeEqual`.
2. **Rate Limiting y Entropía en Gift Cards (`SEC-03`):** Limitar consultas por IP en `/api/gift-cards/apply` y elevar la longitud de códigos a 16 bytes.
3. **Validación estricta de archivos en Editor (`SEC-05`):** Impedir subida de archivos que no sean JPG/PNG/WebP.
4. **Protección de Tokens OAuth (`SEC-04`):** Redirigir hacia el frontend mediante hash fragment o intercambio vía backend.

### Fase 3: Gestión y Mejoras de Ciclo de Vida
1. **Saldo remanente de Gift Cards (`LOG-02`):** Permitir consumos parciales debitando únicamente el monto necesario.
2. **Soft Delete y Auditoría (`MGT-01`):** Marcar registros como inactivos en lugar de eliminarlos físicamente de la base de datos.
3. **Depuración de dependencias (`INT-01`):** Remover `xlsx` y actualizar paquetes reportados por `npm audit`.

---

## 6. Casos de Prueba Recomendados para QA

1. **Test Gift Card 100%:**
   - Crear una Gift Card de $30.000.
   - Agregar al carrito un perfume de $30.000 con retiro en sucursal (costo envío $0). Total = $0.
   - Aplicar el código y confirmar compra.
   - *Criterio de éxito:* El pedido se crea exitosamente en estado `Procesando`, la tarjeta queda consumida y no se produce error 400.
2. **Test Concurrencia de Stock:**
   - Fijar un producto con stock = 1.
   - Disparar simultáneamente dos peticiones POST a `/api/pedidos-invitado` con método de pago `transferencia`.
   - *Criterio de éxito:* Exactamente una petición debe tener éxito (HTTP 200/201) y la segunda debe ser rechazada por stock insuficiente (HTTP 400).
3. **Test Inyección de Archivos:**
   - Intentar subir un archivo `test.svg` o `script.html` de 50KB al endpoint `/api/editor-admin/productos/:id/portada`.
   - *Criterio de éxito:* La API debe rechazar la petición con HTTP 400 (Formato no permitido).
4. **Test Fuerza Bruta en Gift Cards:**
   - Ejecutar un bucle de 20 peticiones seguidas a `/api/gift-cards/apply` con códigos aleatorios.
   - *Criterio de éxito:* A partir de la 5.ª petición, el servidor debe responder con HTTP 429 Too Many Requests.
