Te voy pasando los prompts aqui y cuando termines dejas escrito los cambios abajo de la consigna ✅


### Optimización de caché y SWR en Inicio y MegaMenú
- **Infraestructura SWR y deduplicación** ([apiCache.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/utils/apiCache.js), [requestDedup.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/utils/requestDedup.js)): soporte `runWithSWR` / `fetchWithSWR` con TTL (`3 min` para Inicio, `5 min` para MegaMenú), hidratación síncrona desde memoria/`localStorage`, limpieza por evento de publicación (`invalidateInicioCache()`) y aislamiento de peticiones en vuelo por instancia de `fetch`.
- **Unificación de `/api/seccion-principal` y banners en Inicio** ([SeccionPrincipalContext.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/context/SeccionPrincipalContext.jsx), [BannerOverrides.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/banners/BannerOverrides.jsx), [Inicio.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/inicio/Inicio.jsx)): única consulta compartida con árbol completo de componentes y eliminación de `SectionSkeleton` inicial en recargas usando snapshots persistidos en `localStorage` (`marybe_seccion_principal_v1`, `marybe_banners_home_v1`).
- **Eliminación de polling cada 60s e invalidación por publicación** ([MegaMenuContext.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/context/MegaMenuContext.jsx), [megamenu.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/data/megamenu.js), [useSectionDraft.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/hooks/useSectionDraft.js), [BannersAdmin.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/BannersAdmin.jsx), [MenuHeaderEditor.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/menuHeader/MenuHeaderEditor.jsx)): retiro de `setInterval(60000)` y `cache: 'no-store'` por defecto, reemplazados por revalidación en `focus`/`visibilitychange` solo con TTL vencido e invalidación inmediata al publicar cambios.
- **Caché en memoria por sección y hooks compartidos** ([PromoCarousel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/PromoCarousel.jsx), [FeaturedSection.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/FeaturedSection.jsx), [FeaturedSectionHogar.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/hogar/FeaturedSectionHogar.jsx), [CategoriesSection.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/CategoriesSection.jsx), [FeaturedCategorySection.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/FeaturedCategorySection.jsx), [SpecificCategorySection.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/SpecificCategorySection.jsx), [OfertasSection.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/OfertasSection.jsx), [DiscountedSection.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/DiscountedSection.jsx), [DiscountedSectionHogar.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/hogar/DiscountedSectionHogar.jsx), [TarjetasPromociones.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/TarjetasPromociones.jsx), [ProximosEventos.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/ProximosEventos.jsx), [GiftCard.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/shared/GiftCard.jsx), [useConfiguracionGeneral.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/hooks/useConfiguracionGeneral.js), [useDescuentosBloque.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/hooks/useDescuentosBloque.js)): reuso de respuestas al alternar Perfumería ↔ Hogar y al volver desde otras rutas manteniendo compatibilidad aislada en tests.
- **Validación** ([InicioCache.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/inicio/InicioCache.test.jsx), [MegaMenuNavigation.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/header/MegaMenuNavigation.test.jsx)): suite completa de Jest en `Frontend/` (`npm test -- --watchAll=false`) aprobada (`58/58` suites, `359/359` tests).

### Unificación de proveedor "DCC SA" → "DCC S.A"
- **Script de migración** ([migrar-proveedor.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/scripts/migrar-proveedor.js)): soporta `--dry-run` (por defecto), `--apply`, `--from="..."` (por defecto `DCC SA`), `--to="..."` (por defecto `DCC S.A`) y `--exact`; actualiza filas `published` y `draft` en `api::producto.producto` preservando su estado y sincroniza referencias con `entidad_tipo === 'proveedor'` en `diseno_secciones.descuentos` y `borradores_editor_inicio.descuentos` de `api::seccion-principal.seccion-principal`.
- **Validación** ([migrar-proveedor.test.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/tests/migrar-proveedor.test.js)): ejecutado `node --test tests/migrar-proveedor.test.js` en `Backend/` con `2/2` pruebas aprobadas.


### Recategorización rápida
- Panel de proveedores para editar clasificaciones múltiples con la taxonomía de Excel; guarda el producto como borrador. El panel permite publicar el producto tras guardar el borrador y bloquea la publicación si hay otros cambios pendientes. El guardado reutiliza la creación y actualización de categorías de importación.
- Validación: 5 pruebas de frontend y 2 pruebas de backend aprobadas; QA aislado con Strapi y SQLite: guardado, publicación, filtrado en otro catálogo y bloqueo de cambios ajenos. Sin publicación en producción.

### Diseño de Recategorización rápida
- Rediseño del panel con pasos, búsqueda y selección de productos, tarjetas de clasificación y controles adaptables a pantallas chicas; icono de etiqueta en el menú.
- Validación: 3 suites y 6 pruebas de frontend aprobadas. No se realizó revisión visual en navegador.

### Publicación directa de recategorización
- Guardar cambios actualiza y publica el producto en una sola operación; se bloquea si existen cambios ajenos pendientes.
- Validación: 5 pruebas frontend, 2 backend y QA aislado con Strapi/SQLite aprobados; sin publicación en producción.

### Fondo de Recategorización rápida
- Contenedor principal en tono oscuro y textos ajustados para conservar el contraste. Cambio CSS; sin prueba visual en navegador.

### Paleta bordó en Recategorización
- Fondo exterior y contenedor en bordó Marybe, con títulos y botones dorados y textos claros. Cambio de estilos; sin validación visual en navegador.

### Búsqueda directa en Recategorización
- Búsqueda de productos publicados por nombre, SKU, EAN o ID sin seleccionar proveedor; incluye productos sin proveedor y limita la respuesta a 50 resultados.
- Validación: 6 pruebas frontend, 2 backend y QA aislado con Strapi/SQLite aprobados.

### Contexto de Recategorización
- Se conservan los proveedores, la búsqueda, los filtros y la lista después de guardar; el producto conserva la versión y las clasificaciones actualizadas para nuevas ediciones.
- Validación: 6 pruebas frontend, 2 backend y QA aislado con Strapi/SQLite, incluidos guardados consecutivos.

### Cierre del editor de clasificaciones
- Al guardar se cierra solo el editor y aparece una confirmación breve; se conservan resultados y filtros. Validación: 2 pruebas de frontend aprobadas.
