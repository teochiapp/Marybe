# Editor de Inicio

Ruta: `/editor-inicio-admin`. Punto de entrada para administrar las secciones de la página principal. Reemplazará progresivamente a `/banners-admin`, que sigue disponible sin cambios.

## Acceso

Usa el mismo acceso administrativo que Banners, Pedidos e Importación: login en `/api/importacion-admin/login` y JWT guardado en `localStorage.admin_jwt` (validado en el backend con `isAdminImport`). Iniciar sesión en cualquiera de esos paneles habilita los demás, y cerrar sesión en uno la cierra en todos. La sesión se maneja con `src/hooks/useAdminSession.js`, que descarta tokens vencidos y reacciona al evento de sesión expirada (`sessionManager`).

## Rutas

| Ruta | Vista |
|---|---|
| `/editor-inicio-admin` | Selector «¿Qué querés modificar hoy?» |
| `/editor-inicio-admin/banners` | Editor de banners existente (`BannersAdmin`) |
| `/editor-inicio-admin/seccion-destacada` | Editor visual de la Sección Destacada («Lo nuevo en Marybe») |
| `/editor-inicio-admin/categorias` | Editor visual de la sección Categorías |
| `/editor-inicio-admin/<id>` | Editor de la sección o vista «Editor próximamente disponible» |
| `/editor-inicio-admin/<id-inexistente>` | Redirige al selector |

Identificadores, en el orden de Inicio (Perfumería): `banners`, `seccion-destacada`, `categorias`, `categoria-destacada-1`, `ofertas`, `descuentos`, `categoria-destacada-2`, `beneficios`, `gift-card`, `proximos-eventos`.

## Estructura

```
src/pages/admin/editor-inicio/
├── EditorInicioAdmin.jsx       ← control de sesión y rutas internas
├── editorInicioSections.js     ← configuración central: id, título, descripción, ícono, componente de la landing
├── sectionEditors.js           ← registro id → editor real
└── components/
    ├── AdminLoginCard.jsx      ← login con el endpoint administrativo existente
    ├── EditorInicioLayout.jsx  ← barra superior, ubicación y cierre de sesión
    ├── SectionSelector.jsx     ← panel con la grilla de secciones
    ├── SectionCard.jsx         ← tarjeta de sección
    ├── SectionPlaceholder.jsx  ← vista temporal de editores pendientes
    └── BannersSectionEditor.jsx← integra BannersAdmin con «← Editor de Inicio»
```

Para habilitar el editor de otra sección: crear su componente y registrarlo en `SECTION_EDITORS` con el `id` de la sección. Recibe `section`, `token`, `onBack` y `onLogout`. La tarjeta pasa automáticamente de «Próximamente» a «Editar sección».

`BannersAdmin` acepta dos props opcionales, usadas solo dentro del Editor de Inicio: `onBack` (muestra el botón de regreso y pide confirmación si hay cambios sin guardar) y `onLogout` (se llama al usar **Salir**). Sin props, `/banners-admin` se comporta igual que antes.

## Sección Destacada

Editor visual con la misma organización que Banners: área (Perfumería / Hogar), partes de la sección a la izquierda, lienzo con la sección real en el centro (computadora 1280 px, tablet 820 px, celular 390 px) e inspector a la derecha. Un clic sobre el lienzo selecciona la parte correspondiente. Incluye deshacer/rehacer por área (60 pasos), vista previa limpia a pantalla completa y aviso al salir con cambios sin guardar.

Partes editables:

- **Título y subtítulo:** las dos partes del título, sus colores (vacío conserva el color original) y el subtítulo.
- **Imagen principal:** computadora/tablet (obligatoria) y celular (opcional), desde la biblioteca o subiendo una imagen. Su tamaño se ajusta por separado para computadora/tablet y celular (30 % a 200 %).
- **Productos destacados:** búsqueda por nombre, marca o SKU entre los productos publicados del área; hasta 25, que es lo que la landing muestra (la consulta pública no pagina y Strapi devuelve 25 como máximo). La tienda los ordena según el catálogo. Es el mismo campo `destacado` que la columna **Destacado** del Excel de productos: lo marcado con TRUE en la planilla aparece en el editor, y lo publicado desde el editor sale en la próxima exportación. Una importación completa vuelve a escribir ese campo con lo que diga la planilla (celda vacía = no destacado), así que conviene exportar de nuevo antes de editar el Excel.
- **Banners inferiores (solo Perfumería):** hasta 2, con título, imagen, tamaño de la imagen (computadora/tablet y celular), texto y enlace del botón. Sin banners, la tienda muestra los predeterminados.

Los tamaños se guardan como porcentaje en `escala_imagen_desktop` y `escala_imagen_mobile` (componentes `shared.seccion-principal-item` y `shared.banner-destacado`); vacío equivale a 100 %. La landing los aplica con `src/utils/imageScale.js` solo cuando hay un ajuste, por lo que sin valores el estilo no cambia. El celular usa su propio valor por debajo de 769 px.

**Guardar borrador** conserva el trabajo en `seccion-principal.borradores_editor_inicio` (campo privado, nunca se expone en la API pública) sin cambiar la tienda. **Publicar cambios** escribe en los campos que ya usa la landing: `secciones[]` (ítem del área), `categorias_destacadas` y el indicador `destacado` de los productos. La publicación actualiza `destacado` en la fila borrador y en la publicada de cada producto sin publicar otros cambios pendientes del producto, y solo toca productos publicados (`publicado = true`) del área. Cada guardado comprueba la versión (`updatedAt`): si otra persona modificó la Página de Inicio, devuelve 409 y conserva el trabajo local.

El lienzo es `/editor-inicio-preview`: recibe el borrador por `postMessage` del mismo origen y renderiza `FeaturedSection` / `FeaturedSectionHogar` con la prop opcional `previewData`. Sin esa prop, los componentes de la landing funcionan igual que antes.

El iframe crece con el contenido, así que el lienzo simula el alto de una pantalla real (800 px en computadora, 1180 px en tablet y 844 px en celular) mediante la variable CSS `--editor-vh`. Las medidas en `vh` de `FeaturedSection` y `FeaturedSectionHogar` usan `calc(var(--editor-vh, 1vh) * N)`: en la tienda la variable no existe y equivalen a `N vh`.

API (JWT administrativo `isAdminImport`):

- `GET /api/destacada-admin`: versión, estado publicado y borrador de cada área, y tarjetas de los productos referenciados.
- `GET /api/destacada-admin/productos?area=perfumeria&q=texto`: hasta 30 productos publicados del área.
- `PUT /api/destacada-admin/:area` (`perfumeria` | `hogar`): `{ version, data, publish }`.
- `DELETE /api/destacada-admin/:area/borrador?version=…`: descarta el borrador del área.

La biblioteca de imágenes reutiliza `/api/banners-admin/media` y `/api/banners-admin/upload`. Después de actualizar, reiniciar Strapi para registrar los campos nuevos y las rutas.

## Categorías

Mismo diseño y flujo que la Sección Destacada (área Perfumería/Hogar, partes, lienzo real, inspector, deshacer/rehacer, borrador y publicación). Ambos editores comparten `hooks/useSectionDraft.js` (carga, trabajo local por área, historial, guardado, publicación, descarte y aviso al salir) y `components/SectionEditorShell.jsx` (barra superior, selector de área, lienzo y panel lateral).

- **Contenido:** cada categoría publicada del área con su imagen de portada. Se puede elegir otra imagen de la biblioteca o subirla; se aplica en Strapi recién al publicar.
- **Organización:** franja horizontal sobre la vista previa para arrastrar las tarjetas (mouse o pantalla táctil), con hueco que marca dónde va a quedar la tarjeta. Alternativa accesible: flechas en cada tarjeta, «Mover antes/después» en el panel de la categoría y la lista ↑/↓ del panel «Orden». «Usar el orden del catálogo» vuelve al orden predeterminado.
- **Diseño:** forma de las tarjetas (bordes redondeados —original—, rectangular, cuadrado, circular) y botones (píldora —original—, redondeado, cuadrado; color bordó —original— o claro). Se aplican a todas las tarjetas.

Persistencia:

- **Portadas:** se escriben en `categoria.portada` (mismo campo que usa el catálogo) solo para las categorías cuya imagen cambió, en la versión borrador y en la publicada, sin publicar otros cambios pendientes de la categoría ni tocar sus demás campos.
- **Orden y diseño:** en `seccion-principal.diseno_categorias` (`{ perfumeria: { orden, forma, boton, estiloBoton }, hogar: {...} }`), identificando cada categoría por `documentId`. No se toca el orden global de Strapi ni el del menú. Las categorías nuevas aparecen al final; las eliminadas se ignoran.
- **Borradores:** en `borradores_editor_inicio.categorias`. La publicación corre en una transacción: si algo falla no se aplica ningún cambio y el editor lo informa.

`CategoriesSection` acepta `previewData` para el lienzo, aplica `diseno_categorias` solo en Inicio (la versión `compact` del catálogo mantiene el diseño original) y pide hasta 100 categorías por área. Sin configuración se ve igual que antes.

API (JWT administrativo): `GET /api/categorias-inicio-admin`, `PUT /api/categorias-inicio-admin/:area` (`{ version, data, publish }`) y `DELETE /api/categorias-inicio-admin/:area/borrador?version=…`.

## Categoría Destacada (1)

Editor de la primera categoría destacada (`FeaturedCategorySection`, campos `destacada_perfumeria` / `destacada_hogar` de la Página de Inicio). Categoría Destacada (2) es otra sección y no se modifica. Mismo flujo que los demás editores: área, partes, lienzo real, inspector, deshacer/rehacer, borrador, publicación, vista previa y aviso al salir.

- **Categoría y título:** selector con las categorías publicadas (agrupadas por área y con la cantidad de productos publicados) y el título de la sección. Si la categoría guardada ya no existe o no tiene productos, el editor lo avisa. Cambiar de categoría pide confirmación y quita los productos elegidos, porque pertenecen a la anterior.
- **Productos:** sin selección, la sección funciona como siempre (modo automático: los productos publicados de la categoría en el orden del catálogo). «Elegir y ordenar estos productos» parte de esa lista; también se agregan o quitan con el buscador (nombre, marca o SKU, paginado de a 30). Hasta 25 productos, solo publicados y de la categoría elegida. El orden se cambia arrastrando la franja horizontal sobre la vista previa o con las flechas ↑/↓. «Volver al modo automático» borra la selección.

Persistencia: al publicar se escribe `{ titulo, categoria, productos_orden }` en el componente `inicio.destacada` del área. `productos_orden` (JSON, nuevo) es la lista de `documentId` en orden; vacío o nulo = comportamiento original. La landing, con selección, pide esos productos por `documentId` (siempre filtrando publicados y de la categoría) y los ordena según la lista; si alguno dejó de estar publicado, simplemente no aparece. No se modifica ningún producto ni categoría de Strapi. Borradores en `borradores_editor_inicio.categoriaDestacada`.

API (JWT administrativo): `GET /api/categoria-destacada-admin`, `GET /api/categoria-destacada-admin/productos?categoria=…&q=…&page=…`, `PUT /api/categoria-destacada-admin/:area` (`{ version, data, publish }`) y `DELETE /api/categoria-destacada-admin/:area/borrador?version=…`. Reiniciar Strapi después de actualizar para registrar el campo nuevo y las rutas.

Las partes compartidas entre editores viven en `components/`: `OrderStrip` (franja de arrastre), `PartButton` y `ProductPickerItem`.

## Ofertas

Editor de la sección «Disfrutá de las mejores ofertas» (`OfertasSection`), por área (Perfumería / Hogar), con el mismo flujo que los demás módulos.

Análisis de la sección: no muestra productos ni precios. Son 9 insignias estáticas (`public/ofertas/{60…10}.png`, fondo transparente) que llevan a `/tienda?descuento=N&seccion=…`; el título, su color por área, la fuente Inter 600, los tamaños (2,5 rem / 1,4 rem ≤768 px / 1,2 rem ≤400 px), la alineación y el fondo blanco estaban fijos en el código. No hay subtítulos, botones ni elementos decorativos.

- **Contenido:** título principal (hasta 80 caracteres; vacío no se publica).
- **Tipografía:** fuente del proyecto (Inter —original— o Brygada 1918), tamaño predefinido (chico, mediano, grande —original—, muy grande; cada uno con su versión ≤768 px y ≤400 px), peso (normal, semibold —original—, bold) y alineación (izquierda —original—, centro, derecha). Centrado o a la derecha se compensa el margen derecho, porque la sección no lo tiene.
- **Diseño:** color del título dentro de la paleta (`original` = color de cada área, bordó, bordó oscuro, marrón, marrón oscuro, rojo Hogar), fondo (blanco —original—, arena, rosado) y espaciado superior e inferior (compacto, original, amplio).

Descartado tras el análisis: cantidad de elementos, separación y bordes de las insignias (son imágenes con porcentajes comerciales y tamaño ajustado), textos de botones y subtítulos (no existen).

Persistencia: `seccion-principal.diseno_secciones` (JSON público) como `{ ofertas: { perfumeria: {...}, hogar: {...} } }`, con valores de una lista cerrada; lo ausente o inválido vuelve al diseño original (`src/utils/disenoSeccion.js`). Borradores en `borradores_editor_inicio.ofertas`. La landing consulta `/api/seccion-principal?fields[0]=diseno_secciones` y oculta el título solo mientras carga (si falla, muestra el original).

API genérica para secciones sin modelo propio (JWT administrativo): `GET /api/secciones-inicio-admin/:seccion`, `PUT /api/secciones-inicio-admin/:seccion/:area` y `DELETE /api/secciones-inicio-admin/:seccion/:area/borrador?version=…`. Hoy solo acepta `ofertas`; otra sección con título y tipografía se suma registrándola en `SECTIONS` del servicio, sin endpoints ni campos nuevos. Reiniciar Strapi después de actualizar.

Controles compartidos: `OptionTiles` y `ColorField` pasaron a `components/`.

## Validación

```powershell
# Desde Frontend
npm test -- --watchAll=false
npm run build

# Desde Backend
node --test tests/*.test.js

# Desde Frontend (con el frontend en marcha)
node scripts/qa-editor-inicio.cjs <ruta-a-playwright> http://localhost:3000
```

`scripts/qa-editor-inicio.cjs` usa un CMS simulado (no guarda ni publica): acceso directo protegido, credenciales válidas e inválidas, las diez secciones en orden, vistas temporales, recarga, rutas inexistentes, editor de banners integrado, confirmación de cambios sin guardar, `/banners-admin`, celular/tablet y cierre de sesión. Guarda capturas en `tmp/editor-inicio-qa`.
