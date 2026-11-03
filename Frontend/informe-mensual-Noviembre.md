Te voy pasando los prompts aqui y cuando termines dejas escrito los cambios abajo de la consigna ✅

Arreglar el precio de Variantes en el modal de Agregar al Carrito ✅


Cuando este va al carrito no se actualiza correctamente tampoco con la variante correspondiente ✅

Cambios realizados:
- El modal de Agregar al Carrito ahora recalcula la variante activa y su precio cada vez que se modifica el talle o el color.
- La confirmación desde Single Product conserva la variante que se agregó, junto con su precio normal u oferta correspondiente.
- El carrito identifica cada producto usando también el ID de la variante, para no agrupar variantes distintas que tengan el mismo talle o color.
- Validación realizada: 70 pruebas aprobadas y build de producción compilado correctamente.


Poder modificar el COlor de los Titulares de las secciones destacadas  ✅

Cambios realizados:
- Se agregó el campo opcional color_texto dentro de cada ítem de Menu Barra Superior. Cada mensaje tiene un color independiente, tanto en escritorio como en el carrusel de celular; se retiró el campo general.
- En Página de Inicio > secciones se agregaron color_titulo_cursiva y color_titulo_normal para personalizar por separado las dos partes de los títulos destacados de Perfumería y Hogar (por ejemplo, "Lo nuevo en Marybe").
- Los mismos campos se agregaron en descuento_perfumeria y descuento_hogar para los títulos de descuentos, incluyendo "Descuentos de Miércoles".
- Los campos de color ahora usan una paleta visual en Strapi con 15 colores clásicos y de Marybe, nombres de colores, selección destacada y la opción "Otro color" para abrir un selector visual. No hace falta escribir códigos HEX. El selector se aplica a los mensajes de la barra y a las dos partes de los títulos destacados y de descuentos en ambas áreas.
- Los campos son opcionales y no tienen valor predeterminado: inicialmente quedan vacíos y mantienen los colores actuales. "Restaurar color original" vuelve a dejarlos vacíos sin afectar los demás ítems o títulos. Se conservan los colores personalizados guardados previamente en los títulos. No se modificó contenido real del CMS.
- Se conectaron los cuatro componentes de Inicio y la barra superior con las respuestas de Strapi v5/v4. Los valores inválidos se ignoran en la web y Strapi los rechaza al guardar.
- Validación: 125 pruebas de frontend y 27 de backend aprobadas, incluyendo registro y normalización del campo personalizado con Strapi y validación de colores válidos, vacíos y formatos incorrectos. Revisión de navegador de la web en escritorio y celular con colores diferentes por mensaje. Se probó el componente real de la paleta en un formulario local controlado: selección con mouse y teclado, color personalizado, guardado y recarga simulados, restauración independiente, solo lectura y errores. Compilación del frontend y del panel de Strapi correctas, con advertencias preexistentes del proyecto.
- Referencia del mecanismo utilizado para integrar la paleta en el panel: https://docs.strapi.io/cms/features/custom-fields.
- Para disponer de estos campos en el panel remoto es necesario desplegar los cambios de Backend y reiniciar Strapi; también desplegar el Frontend para aplicar los colores en la web.

Ver una forma de con una nueva RUTA de Banners poder manejar mas facil todo lo que es la estetica de la pagina principal

Cambios realizados:
- Se creó /banners-admin, un editor visual protegido con el mismo acceso administrativo de los demás paneles, con estructura de filas, lienzo clicable e inspector de propiedades.
- Se conectaron los banners principales de promociones-inicio y las piezas de destacados, descuentos, categorías destacadas, Gift Card y WhatsApp del inicio. El editor usa las imágenes existentes de Strapi o los recursos actuales como punto de partida.
- Se permite crear grupos, agregar/ordenar/duplicar filas y banners, configurar grillas o carruseles y modificar imágenes, títulos, descripción, botón y enlaces.
- Se incorporaron ajustes independientes para PC, tablet y celular: alto en px, ancho, separación, márgenes, esquinas, recorte, encuadre, zoom, fondos, oscurecimiento, tipografía, colores y posición de texto. El texto puede arrastrarse en la vista previa.
- Se agregó biblioteca y carga de imágenes por dispositivo, plantillas rápidas, deshacer/rehacer y recuperación de la copia local de trabajo.
- El renderizador de la vista previa es el mismo que usa Inicio para las personalizaciones publicadas. Los diseños anteriores se conservan como respaldo hasta que se publique cada personalización.
- Se amplió shared.banner y las filas con campos visuales; las otras piezas usan un campo privado en Página de Inicio con borrador y versión publicada. Guardar borrador no cambia la web pública; publicar una pieza no publica los otros borradores.
- Las APIs administrativas validan el acceso, imágenes, enlaces y rangos de los valores. El guardado detecta versiones desactualizadas para evitar sobrescribir cambios de otra persona.
- Se verificó el editor en navegador con escritorio, vista móvil y pantalla de celular, incluyendo arrastre, visibilidad, guardado simulado y biblioteca. Se comprobaron también las rutas reales de lectura del backend local, sin publicar contenido real.
- Documentación de uso, modelos y endpoints: docs/banners-admin.md. Se agregaron pruebas de edición responsive, borrador/publicación, conflictos, restauración y permisos.
- Validación: 93 pruebas de frontend y 22 de backend aprobadas; compilación del frontend y panel de Strapi verificada. La revisión de navegador usa un CMS simulado para no modificar los banners reales.

Actualización de alcance del editor:
- /banners-admin queda dedicado exclusivamente a los banners principales de la parte superior de Inicio, para Perfumería y Hogar. Se retiró la opción "Otras piezas del inicio" y su selección automática cuando no existen grupos principales.
- El listado administrativo consulta únicamente promociones-inicio. La compatibilidad y los datos de personalizaciones secundarias anteriores se conservan, pero no se editan desde este panel.
- Se ordenaron los controles en imagen/contenido, tamaño/encuadre y texto/botón/posición; los ajustes avanzados quedan separados. Se agregaron instrucciones breves y explicaciones de qué se comparte entre dispositivos y qué se personaliza por separado.
- Se corrigió la miniatura de celular para respetar la imagen heredada de tablet y se mantiene seleccionado el banner al guardar. Se completó el orden de banners con "Mover antes" y "Mover después".
- Se añadieron pruebas para impedir la edición de piezas secundarias, guiar la creación de grupos vacíos y cambiar la distribución de una fila después de restablecerla.
- Validación del ajuste: 96 pruebas de frontend y 23 de backend aprobadas; revisión de navegador de los banners principales y compilación de producción del frontend verificadas.

Vista previa ampliada de banners:
- Se agregó el botón "Vista previa" al editor para ver el grupo actual a pantalla completa, incluidos los cambios sin guardar, sin publicar ni modificar Strapi.
- La vista muestra los banners sin etiquetas, bordes de selección ni herramientas de edición, con controles para computadora, tablet y celular, ajuste a pantalla y tamaño real al 100 %.
- Se puede volver al editor con el botón o Escape, conservando los cambios y el dispositivo de edición. Los enlaces se desactivan dentro de la vista previa para evitar salir de ella accidentalmente.
- Validación: 99 pruebas de frontend aprobadas y compilación de producción correcta. La revisión de navegador confirmó la vista limpia, los tamaños por dispositivo y el regreso al editor sin perder cambios ni publicar contenido.

Rediseño de navegación y jerarquía visual:
- Se separó el área de edición de la estructura: Página de Inicio muestra arriba un selector claro Perfumería / Hogar, y el árbol presenta solo las secciones de banners principales del área elegida.
- Se reemplazó la nomenclatura técnica visible: Grupo pasa a Sección de banners, Fila a Distribución y Grilla/Carrusel se elige como Tipo de presentación. Los campos y modelos internos de Strapi se conservan.
- Se incorporó un árbol expandible con miniaturas reales por dispositivo, nombres, cantidad de banners, tipo de presentación y estado oculto. Seleccionar una sección abre su distribución; seleccionar una miniatura permite editar el banner directamente.
- Se trasladaron las acciones de organización a menús de tres puntos, visibles al pasar el mouse, enfocar con teclado o usar una pantalla táctil. Permiten renombrar, duplicar, mover, ocultar y eliminar según el elemento; se mantiene la protección del último banner y de la última distribución, y el arrastre para ordenar distribuciones. Las secciones también pueden duplicarse sin reutilizar IDs de Strapi.
- La selección se sincroniza entre el árbol y el lienzo, expandiendo y mostrando el banner seleccionado. Se agregó un control de alto común para todos los banners de una distribución, independiente por dispositivo.
- Cambiar de sección o de área conserva los cambios locales, la selección y el historial de deshacer/rehacer. Al volver a un área se recupera la última sección editada; el aviso al salir también considera cambios en otras secciones. Recuperar copia y Salir se agruparon en Más opciones.
- Se renovaron colores, espaciados y jerarquías con tonos suaves de Marybe y se adaptó la estructura a escritorio, tablet y celular. Se conservaron borrador/publicación, biblioteca, imágenes responsive, arrastre de texto, recuperación y vista previa ampliada.
- Validación: 131 pruebas de frontend aprobadas, revisión automatizada en navegador de áreas, árbol, selección bidireccional, menús con teclado, conservación de borradores, biblioteca y vista previa responsive. La compilación de producción finalizó correctamente con advertencias preexistentes. La revisión usa datos simulados y no modifica el CMS real. La documentación de uso quedó actualizada en docs/banners-admin.md.


Mejoras de ajuste directo y color del editor:
- En el lienzo "VISTA PREVIA" ahora el banner seleccionado muestra un control en su borde derecho. Se puede arrastrar con mouse o pantalla táctil para cambiar su ancho directamente; también responde a las flechas izquierda/derecha para uso con teclado.
- El nuevo ancho se guarda solo en el dispositivo que se está editando (computadora, tablet o celular), respeta el rango de 10 a 100 % y queda como cambio local hasta guardar borrador o publicar.
- Los indicadores de selección, controles de rango, pestañas y acentos del editor se unificaron con el rojo principal de Marybe, reemplazando los detalles violetas heredados.
- Validación: se agregó cobertura para la comunicación segura del ajuste de ancho desde la vista previa y para conservar la independencia por dispositivo.

Acceso de Banners Admin:
- /banners-admin ahora usa el mismo panel de inicio de sesión visual de los demás administradores: fondo, tarjeta, campos con iconos, opción de mostrar/ocultar contraseña, mensajes de error, indicador de carga y aviso de acceso restringido.
- Se reutilizan las clases y la hoja de estilos de Importación Admin; el acceso mantiene la ruta de autenticación de administración, el token compartido y la protección de permisos de Banners Admin.
- Validación: se agregó una prueba del panel compartido, credenciales y almacenamiento del token.

Eliminación de secciones:
- Se agregó “Eliminar sección” al menú de tres puntos de cada sección de banners. Pide confirmación antes de ejecutar la acción.
- La eliminación borra la sección en Strapi con autenticación y control de versión, evitando eliminar cambios que otra persona haya actualizado. Las secciones nuevas que aún no se guardaron se retiran solo del borrador local.
- Tras borrar una sección se selecciona la siguiente disponible; si era la última, queda disponible el estado para crear una nueva sección.
- Validación: pruebas de frontend y backend cubren la confirmación, la llamada protegida y el control de conflictos.

Tener la capacidad de elegir si registrarse o comprar como INVITADO ✅

Cambios realizados:
- Desde el carrito se accede al paso de identificación, donde el cliente puede iniciar sesión/registrarse o continuar como invitado sin crear una cuenta.
- Se agregó un formulario de invitado con nombre, apellido, email y teléfono, validado antes de avanzar. Los datos temporales se conservan en sessionStorage para completar el recorrido y volver desde Mercado Pago.
- El invitado puede completar su dirección para entrega a domicilio o elegir una sucursal de retiro. Ambos métodos conservan sus datos de contacto y se validan antes del pago.
- Se incorporó POST /api/pedidos-invitado, con validación del contacto y la entrega. Reutiliza la validación de precios, variantes, stock y envío del flujo registrado. Los pedidos de invitados no se vinculan a usuarios enviados por el cliente ni crean cuentas automáticamente.
- Strapi guarda cliente_email, es_invitado y los datos de contacto/entrega en direccion_envio. Pedidos Admin y el comprobante muestran si el cliente es invitado o registrado.
- Efectivo y transferencia registran el pedido por la ruta de invitado. Mercado Pago recibe el email del invitado, conserva la referencia y completa el procesamiento mediante el webhook de pago aprobado.
- El pago a convenir también registra el pedido en Strapi antes de abrir WhatsApp con su referencia; si falla el registro se conserva el carrito.
- La confirmación para invitados muestra su email y permite seguir comprando, sin exigir acceso al historial privado de una cuenta.
- Se completaron las plantillas de correo para mostrar sucursal, provincia y teléfono del local, o domicilio con número y código postal. Los datos personales se escapan al incluirlos en el HTML.
- El webhook ignora notificaciones repetidas de pedidos ya marcados como pagados para evitar repetir stock y correos en ese caso.
- Validación: 90 pruebas de frontend y 15 de backend aprobadas. Se cubren identificación, entrega a domicilio/sucursal, invitado con efectivo/transferencia/Mercado Pago/a convenir, guardado en Strapi, stock, emails, restauración de sesión registrada y acceso protegido al historial. Mercado Pago y correo se simulan, sin cobros ni envíos reales. Compilación de frontend y panel de Strapi verificada.


En el panel de Pedidos, mostrar el SKU en la tabla pero tambien descargar un PDF con todos los datos completos para imprimir como el PDF de Referencia ✅

Cambios realizados:
- Se agregó el SKU a cada producto mostrado en la tabla del panel de pedidos.
- El detalle del pedido ahora incluye fecha de creación y actualización, estado, pago, correo, tracking, ID de Strapi, total, productos con variante, SKU, IDs y subtotales, dirección completa y gift cards generadas.
- Se incorporó el botón "Descargar / imprimir PDF". Abre el diálogo de impresión del navegador con diseño A4 optimizado para guardar el comprobante como PDF.
- Se agregó un acceso directo con ícono de impresora junto al ojo de "Ver detalles" en cada fila para descargar o imprimir el PDF sin abrir el detalle manualmente.
- El comprobante PDF ahora utiliza el logo oficial de Marybe, la paleta principal y un pie de página con la identificación del pedido.
- Se aplicaron estilos visuales al selector de estado: cada estado tiene color de fondo, borde y texto propio para identificarlo rápidamente.
- Se destacó el SKU en la tabla, detalle y PDF con una etiqueta de color principal para facilitar su identificación operativa.
- En la tabla de Pedidos Admin, el SKU se muestra en una línea independiente debajo del nombre y la variante de cada producto, conservando su etiqueta destacada.
- Se incluyó un bloque desplegable con todos los datos recibidos desde Strapi para no omitir campos adicionales.
- Se agregaron pruebas de normalización de pedido, dirección, SKU/variante y datos adicionales de Strapi.

Actualización visual del comprobante:
- Se rediseñó la presentación tomando como referencia la imagen proporcionada: logo con detalle circular rosa, bloque de encabezado en rosa suave, tipografía limpia y mayor jerarquía visual del número de pedido.
- Los productos ahora se presentan en una tabla con descripción, cantidad, precio unitario y subtotal, filas alternadas y SKU destacado en su propia línea. Se mantienen marca, variante e identificadores.
- Se reorganizó la parte inferior con entrega y contacto a la izquierda, total destacado a la derecha, gift cards y un pie de página discreto. Se conservaron los datos y las acciones existentes de impresión/PDF.
- Se ajustaron márgenes A4, espaciados y saltos de página; la tabla repite sus encabezados cuando ocupa más de una hoja. La impresión excluye el fondo y la estructura del panel para evitar recortes y hojas vacías.
- Validación visual y de contenido con PDFs reales generados desde el navegador usando pedidos ficticios: 3 productos en una hoja y 30 productos en cuatro hojas. Se verificaron SKUs, variantes, cantidades, precios, subtotales, total, fechas, estado, pago, correo, seguimiento, ID de Strapi, entrega/contacto y gift cards; también ambos accesos a imprimir y el detalle móvil. Las 125 pruebas de frontend pasaron y la compilación de producción finalizó correctamente, con advertencias preexistentes.

Revisar la opcion de pago de Retiro en Sucursal, ya que avanza al PAgo sin elegir sucursal ✅

Cambios realizados: 
- Al elegir Retiro por sucursal aparece un panel adicional con un selector obligatorio. Las opciones usan la misma fuente dinámica de Strapi que la página /sucursales y su respaldo local existente.
- El paso de Envío guarda el método de entrega y la sucursal (dirección, provincia y teléfono) para conservarlos al pasar a Pago o recargar la página. El acceso directo a Pago sin entrega válida vuelve a Envío.
- Se separó la entrega del pago: retirar es gratis tanto con efectivo como con transferencia o Mercado Pago; pagar en efectivo a domicilio conserva el costo de envío y se presenta como pago al recibir.
- Se eliminó el selector estático de sucursales del paso de Pago. El resumen muestra la sucursal elegida y permite volver a modificar la entrega.
- Se mejoró el estilo del selector de sucursales con colores de marca, bordes redondeados, foco visible y opciones con mayor espaciado y selección destacada en navegadores compatibles con el selector nativo personalizable.
- El pedido guarda el método y la sucursal en direccion_envio, visibles también en el detalle administrativo y comprobante. La confirmación de compra distingue retiro de entrega a domicilio.
- El servidor exige una sucursal en pedidos de retiro y recalcula el envío a domicilio desde la configuración, sin interpretarlo como retiro porque el cliente mande costo cero.
- Se corrigió el controlador de Mercado Pago para transmitir envío, método de entrega y descuento de gift card al cálculo de la preferencia.
- Si falla el registro del pedido, se conserva el carrito y se informa el error, sin navegar a una confirmación exitosa.
- Validación automatizada: 81 pruebas de frontend y 4 pruebas de backend aprobadas, incluyendo selección obligatoria, persistencia, efectivo con ambos métodos de entrega, totales y rechazo del servidor.

Testear catálogo, carrito y Mercado Pago con varios productos y variantes diferentes ✅

Cambios realizados:
- Se agregó una prueba de integración del catálogo con dos productos y dos variantes por producto. Verifica selección desde la tarjeta, cambio dentro del modal, cuatro ítems separados, acumulación de la misma variante, precios de oferta, persistencia y límites de stock.
- Se corrigió la apertura del modal para conservar la variante elegida en el catálogo y su confirmación para mostrar la variante que realmente se agregó.
- El carrito limita también la cantidad inicial al stock y evita modificar directamente el estado anterior al acumular cantidades. Cambiar de variante en el modal reinicia la cantidad.
- El servidor reconoce variantes por ID de Strapi o id_original, valida su disponibilidad y controla el stock acumulado cuando se repite una variante.
- El pedido guarda los precios validados por Strapi, SKU e ID de cada variante, manteniendo ambos atributos cuando combina volumen y color. La actualización de stock admite también variantes sin id_original.
- Los ítems enviados a Mercado Pago incluyen identificadores diferenciados y el volumen/color en el título, usando sus precios validados.
- Se probó el envío desde Pago de un carrito con cuatro variantes, el total con envío y la conservación del pedido pendiente antes de redirigir a Mercado Pago.
- Validación: 83 pruebas de frontend y 8 de backend aprobadas. Las llamadas a Mercado Pago se simulan, sin generar preferencias ni cobros reales.
