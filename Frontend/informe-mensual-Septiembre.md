# Resumen de Nuevas Implementaciones en Marybe - Septiembre

Las fallas y ajustes menores de mantenimiento no están incluidos. A continuación se detallan las principales mejoras de experiencia de usuario, lógica comercial y autogestión implementadas recientemente:

---

### 1. Lógica de Precios y Variantes más Estricta ✅
* **Normalización del motor de precios:** Se refactorizó la extracción y validación de variantes de producto (`productPrice.js`), depurando variantes "fantasma" o incompletas generadas por sincronizaciones anteriores.
* **Priorización inteligente de stock:** Ahora el precio de portada y los descuentos mostrados priorizan estrictamente variantes activas, publicadas y con stock disponible (`stock > 0`), asegurando consistencia entre la grilla y el carrito.
* **Ordenamiento natural de medidas:** Implementación de orden numérico inteligente para tamaños y volúmenes (ej. "N° 10", "N° 20", "N° 120" en lugar del orden alfabético simple).

---

### 2. Tamaños y Colores Integrados en las Tarjetas del Catálogo ✅
* **Previsualización y selección rápida:** Se incorporó un selector compacto de variantes (botones de talle/volumen y muestras circulares de color) directamente sobre las tarjetas de producto en el catálogo.
* **Actualización dinámica de precio y descuento:** Al alternar entre colores o tamaños desde la grilla, el precio, el precio de oferta y el badge de descuento se recalculan en tiempo real de forma inmediata.
* **Compra ágil sin salir del catálogo:** Al pulsar "Agregar", el producto se añade al modal de compra con la variante seleccionada ya preconfigurada.
* **Alineación y simetría visual:** Contenedor de variantes con altura estandarizada para garantizar que todas las filas de la grilla conserven una altura uniforme y balanceada.

---

### 3. Reorganización de la Ficha de Producto (Descripciones Optimizadas) ✅
* **Jerarquía enfocada en conversión:** Se reestructuró la cabecera de la página de producto individual (`SingleProductInfo`), retirando el bloque de descripción extensa que desplazaba hacia abajo los elementos críticos de decisión.
* **Acciones de compra inmediatas:** Precio, desglose de cuotas sin interés, selector de variantes, información de stock y botones de compra ahora se visualizan inmediatamente "above the fold" (sin necesidad de hacer scroll).
* **Lectura cómoda:** La descripción detallada del producto queda ubicada en una sección dedicada inferior, mejorando drásticamente la usabilidad en dispositivos móviles y la claridad de compra.

---

### 4. Flechas de Navegación en Carruseles de la Página de Inicio (Home) ✅
* **Navegación intuitiva de productos:** Se agregaron controles de navegación lateral (flechas circulares flotantes izquierda y derecha, consistentes con el diseño del carrusel principal) en los bloques de productos destacados y ofertas:
  * *Perfumería:* Sección Destacados y Descuentos de Miércoles.
  * *Hogar:* Elegidos para tu Hogar y Descuentos de Hogar.
* **Doble interacción:** Coexisten de forma fluida tanto el desplazamiento por arrastre con mouse/touch (`drag & grab`) como el salto exacto tarjeta por tarjeta mediante las flechas.
* **Normalización de márgenes:** Se ajustaron los márgenes laterales (`margin-left: 60px`) para mantener simetría visual exacta con los títulos de sección y evitar desbordes fuera del contenedor.

---

### 5. Páginas Institucionales 100% Autoadministrables desde Strapi ✅
* **Página de Sucursales:**
  * Creación del Single Type en Strapi (`pagina-sucursales`) con componentes repetibles de sucursal.
  * Permite editar de forma autónoma: nombre de la sucursal, dirección, teléfono, enlace de WhatsApp, horarios de atención comercial y ubicación en Google Maps.
* **Página Nuestra Historia:**
  * Creación del Single Type en Strapi (`pagina-historia`) para la gestión integral del relato de marca.
  * Modificación de títulos, bloques de texto enriquecido (párrafos principales, historia y trayectoria) e imágenes institucionales (fotos históricas, banners y equipo), con soporte diferenciado para desktop y mobile.
* **Disponibilidad garantizada:** Ambos módulos cuentan con hooks reactivos y textos/imágenes de respaldo (fallback) para garantizar que la web nunca quede vacía ante cualquier eventualidad de red.

---

## ⏳ En Desarrollo / Próximas Implementaciones

* **Integración de API de Instagram para Muro Social:**
  Conexión automatizada con la API oficial de Instagram para mostrar el feed en vivo con las últimas publicaciones, reels y novedades de Marybe en la tienda online.

* **Configuración de Brevo (Sendinblue) para Correos Transaccionales:**
  Integración y configuración del proveedor de correo para el despacho automatizado y confiable de emails transaccionales (confirmación de compra, estados de pedido, recuperación de cuenta y notificaciones al cliente).