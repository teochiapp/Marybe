# Estudio de banners de Marybe

Ruta: `/banners-admin`. Usa el mismo acceso administrativo que Pedidos e Importación.

El alcance actual es únicamente el bloque de banners principales que aparece al comienzo de Inicio, en Perfumería y Hogar. Las demás secciones se gestionan por sus mecanismos existentes.

## Uso

1. Elegir **Perfumería** o **Hogar** en el selector superior. El árbol muestra únicamente las secciones de banners de esa área.
2. Seleccionar una sección o un banner en el árbol de miniaturas. Si no existe una sección, usar **Agregar sección**. Al elegir un banner en el lienzo se expande su ubicación en el árbol y queda resaltado; seleccionar una miniatura también lo resalta en el lienzo.
3. Cambiar entre Computadora (1280 px), Tablet (820 px) y Celular (390 px).
4. Editar las imágenes, textos, enlace, colores, tamaños y encuadre. El bloque de texto puede arrastrarse en la vista previa.
5. Guardar borrador para conservar el trabajo sin modificar lo publicado. Publicar cambios aplica únicamente la sección seleccionada al bloque superior de Inicio.

El botón **Vista previa** abre una vista ampliada y limpia de la sección actual, incluidos los cambios sin guardar. Permite alternar entre computadora, tablet y celular, ajustar a pantalla o ver al 100 %. Los controles de edición y las etiquetas de selección se ocultan. Los enlaces se desactivan en esta vista para poder inspeccionar el diseño sin salir de ella. Se puede volver al editor con el botón correspondiente o con Escape, conservando el trabajo y el dispositivo de edición original.

Las imágenes pueden elegirse de la biblioteca (las últimas 200 imágenes) o subirse desde el panel. Formatos: JPG, PNG, WebP, GIF y AVIF; hasta 10 MB. Las imágenes de tablet/celular son opcionales y heredan la anterior cuando se dejan vacías.

## Controles

- Distribución: una, dos o cuatro columnas o distribución libre; tipo de presentación Grilla/Carrusel; cantidad de columnas por dispositivo; separación, ancho máximo, márgenes y espacio interior. Alto de los banners aplica una altura común a los banners de la distribución en el dispositivo seleccionado.
- Banners: imagen por dispositivo, alto en píxeles, ancho porcentual, recorte/completo/estirar, encuadre horizontal/vertical, zoom y esquinas.
- Contenido: título, descripción, botón y enlace interno o HTTPS; el título también sirve de texto alternativo de imagen.
- Texto: tipografía, grosor, tamaño, interlineado, espaciado, alineación, posición y ancho del bloque.
- Colores: fondo, texto y botón; oscurecimiento de imagen para mejorar contraste.
- Visibilidad: activo global y oculto por dispositivo.
- Organización: árbol expandible con miniaturas reales. El menú de tres puntos aparece al pasar el mouse, enfocar con teclado o usar una pantalla táctil. Incluye renombrar, duplicar, mover, ocultar y eliminar según el elemento. Las distribuciones se pueden ordenar con el menú o arrastrando su encabezado; se conserva deshacer/rehacer (hasta 60 pasos). La última distribución y el último banner no pueden eliminarse. Las secciones pueden renombrarse, duplicarse y recibir nuevas distribuciones; no se agregó eliminación de documentos de Strapi.

Los valores se heredan de Computadora a Tablet y luego a Celular. Restablecer los ajustes de un dispositivo elimina sus excepciones. Alto 0 conserva la proporción original de la imagen.

La vista previa usa el mismo renderizador que los banners principales de Inicio. El panel distingue Banner (contenido y diseño individual) de Distribución (presentación de varios banners). La ubicación Perfumería/Hogar se elige antes de entrar a las secciones. Los nombres para el cliente son Sección de banners, Distribución, Banner y Tipo de presentación; los campos internos de Strapi conservan sus nombres. Los controles esenciales se presentan primero y los acabados avanzados se agrupan aparte.

## Contenido conectado

Los banners principales conservan `promociones-inicio`, sus filas dinámicas y las imágenes `shared.banner`. Se agregaron `diseno` a filas y banners, y subtítulo, texto de botón, visibilidad de textos y estado activo al banner. Los grupos publicados de una misma sección se muestran en orden de creación.

La opción «Otras piezas del inicio» se retiró del editor. Se conserva la compatibilidad con las personalizaciones secundarias existentes en `seccion-principal.banners_visuales`, sin ofrecer su edición en este panel ni modificar sus datos al guardar un grupo principal.

Los grupos de promociones siguen el sistema nativo de borrador/publicación de Strapi. La publicación actualiza primero el borrador y luego llama a `publish`.

## Recuperación y concurrencia

Cambiar de área o de sección conserva en memoria el trabajo, la selección y el historial independiente de cada sección durante la sesión del editor. Al volver a un área se recupera la última sección utilizada. Los cambios locales también se respaldan en `sessionStorage` por sección. **Más opciones → Recuperar copia** permite retomarlos dentro de la misma pestaña, siempre que no haya cambiado la versión de Strapi. Al salir se advierte si hay cambios pendientes, incluso en otra sección. Guardar o publicar afecta solo la sección activa.

El guardado comprueba `updatedAt`; si otra persona modificó el registro, devuelve un conflicto (HTTP 409) y conserva el trabajo local. No sobreescribe automáticamente la versión ajena.

## API

Todos los endpoints administrativos validan el JWT con `isAdminImport`; los tokens de clientes no permiten editar.

- `GET /api/banners-admin`: únicamente los grupos de banners principales; no consulta las otras secciones de Inicio.
- `PUT /api/banners-admin/promociones/:documentId`: guardar un grupo; `new` crea uno. Admite `version`, `data`, `publish`.
- `GET /api/banners-admin/media`: biblioteca de imágenes.
- `POST /api/banners-admin/upload`: subida multipart mediante el campo `files`.

Las rutas `/api/banners-admin/piezas` y `/api/banners-home` se conservan para compatibilidad con personalizaciones secundarias anteriores; el editor actual no las utiliza.

`/banners-preview` es el lienzo interno: recibe la vista previa mediante mensajes del editor del mismo origen; no obtiene borradores de la API pública.

## Validación y despliegue

La reorganización visual del árbol y del selector de área cambia únicamente el frontend, sin agregar campos ni endpoints. Para instalar el editor completo por primera vez, actualizar frontend y backend y reiniciar Strapi para registrar las rutas y campos originales. No hace falta reinstalar plugins de edición.

Pruebas:

```powershell
# Desde Frontend
npm test -- --watchAll=false --runInBand
npm run build

# Desde Backend
node --test tests/*.test.js
npm run build
```

`scripts/qa-banners.cjs` ejecuta una revisión con Playwright y CMS simulado: secciones principales exclusivamente, selector de área y conservación de borradores, árbol/selección bidireccional y menús contextuales, lienzo responsive, altura independiente por dispositivo, cambio de imagen, arrastre del texto, visibilidad, borrador, biblioteca y distribución 50/50. Guarda capturas en `tmp/banners-qa`. No publica contenido real.
