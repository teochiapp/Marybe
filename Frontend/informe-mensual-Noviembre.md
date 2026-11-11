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

Distribución y carruseles de banners principales:
- Se simplificó el panel de cada banner: imagen, encuadre, ajuste y zoom se agrupan junto a la miniatura; destino y textos aparecen después. Tamaño, diseño de textos, visibilidad y más ajustes se despliegan según necesidad y conservan su estado durante la sesión.
- Se aclararon las etiquetas, el alcance de visibilidad y las acciones de guardar borrador o publicar en la tienda. Los ajustes de texto aparecen solo cuando se incluyen textos, y los del carrusel solo al elegir ese formato.
- Validación de la simplificación: 28 pruebas específicas de frontend y ESLint aprobados; recorrido en navegador con CMS simulado para ambas rutas, edición responsive, biblioteca, vista previa y guardado de borrador.
- Se incorporó la edición del encuadre desde el lienzo para computadora, tablet y celular, con punto focal, arrastre, controles sincronizados, Escape y una acción de deshacer por gesto.
- Los ajustes por dispositivo muestran su origen y permiten eliminar cada personalización por separado, conservando los demás valores y el historial. La herencia se conserva al guardar y reabrir el borrador.
- Cada distribución de carrusel permite configurar avance automático, intervalo, indicador y vista parcial. Las opciones se guardan en Strapi y se aplican en la vista previa y al publicar; las configuraciones anteriores mantienen avance cada siete segundos, sin indicador ni vista parcial.
- Validación de estas mejoras: 27 pruebas de frontend, 10 pruebas de backend y una integración con Strapi y base temporal aprobadas; ESLint sin errores. Los recorridos con CMS simulado cubrieron los tres dispositivos, encuadre y deshacer/rehacer, guardado y reapertura, carruseles histórico y personalizado, indicadores, anchos variables, banners ocultos, filas sin desbordamiento, teclado, gestos y movimiento reducido. No se publicó contenido real.
- El editor abre en «1. Distribución», conserva la selección al regresar y muestra la ubicación de distribución y banner. El árbol y el lienzo siguen abriendo directamente el banner seleccionado.
- Grilla/Carrusel y las plantillas aparecen primero. El panel separa ajustes principales y avanzados por dispositivo e incorpora porcentajes por banner, agregado y reordenamiento en distribución libre. El porcentaje existente es compartido y en celular se mantiene el ancho de pantalla. Cambiar de plantilla conserva el contenido y el diseño individual.
- Los carruseles históricos y personalizados comparten flechas superpuestas, navegación según la posición real de los banners, arrastre, teclado y autoplay con pausa y movimiento reducido. Se ocultan los controles cuando no hay desbordamiento y los enlaces se bloquean en la vista previa ampliada.
- Validación: 24 pruebas específicas de Banners aprobadas y ESLint sin errores en los archivos modificados. Dos recorridos de navegador con CMS simulado cubrieron ambas rutas, computadora/tablet/celular, grillas, carruseles históricos y personalizados, anchos variables, banners ocultos, filas sin desbordamiento, extremos, clic frente a arrastre, gestos táctiles, desplazamiento vertical, teclado y autoplay. No se publicó contenido real.


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

Datos comerciales y de facturación del comprobante (referencia anterior de Marybe):
- Se incorporaron ventas@marybe.com.ar, +54 385 4211687 y Pellegrini 141, Santiago del Estero en el encabezado y pie del comprobante.
- Se agregaron los bloques Método de pago, Método de envío y Datos de facturación, junto con subtotal, envío/descuentos cuando corresponden, total destacado y Nota. Los productos conservan descripción, variante, SKU, cantidad, precio unitario y subtotal.
- El ID de Strapi y los identificadores internos de producto/variante se excluyen de la impresión/PDF. Siguen disponibles en el detalle administrativo; también se conserva allí el bloque de datos completos.
- Las instrucciones se adaptan al pago y a la entrega: el pago en la entrega muestra la indicación del ejemplo, el retiro recuerda llevar número de compra y DNI, y Maipú 164 de Tucumán incluye el horario informado de lunes a sábado de 9 a 21 hs. No se aplica ese horario a otros locales.
- Los datos personales se toman de cada pedido. Para compras nuevas con retiro, se conserva por separado el domicilio disponible de facturación sin mezclarlo con la dirección de la sucursal. Los pedidos anteriores o invitados sin ese domicilio muestran únicamente los datos realmente guardados, sin inventar información.
- Se ajustó el diseño A4 para que los comprobantes de uno y tres productos entren en una hoja; el caso de 30 productos se verificó en cuatro hojas con encabezados repetidos y sin filas cortadas. Se generaron y revisaron visualmente tres PDFs de prueba, con extracción de texto para comprobar campos y ausencia de identificadores internos; también se verificó el detalle móvil y ambos accesos a imprimir.
- Se añadieron pruebas de datos comerciales, facturación independiente, pago, entrega, horarios por sucursal, notas y desglose de importes.
- Validación final conjunta del comprobante y logo: 157 pruebas de Frontend y 60 de Backend aprobadas; compilaciones de producción de ambos proyectos correctas con advertencias preexistentes. Se revisaron tres PDFs reales de prueba y los tamaños responsive en Chrome, incluido el login compilado de Strapi. Ejemplo basado en la referencia suministrada: output/pdf/comprobante-referencia.pdf.

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
- Revisión adicional del recorrido completo: se incorporaron pruebas desde catálogo con envío a domicilio y desde la ficha con retiro, pasando por carrito, identificación de invitado, entrega y pago en efectivo. Comprueban variante, SKU, precio de oferta, cantidad, límite de stock, costo de envío, total y contenido enviado al pedido. Se verificó además la selección conjunta de tamaño y color en ambas entradas. Se repitieron los recorridos de compra en Chrome de escritorio y celular con el CMS y la creación del pedido simulados.
- Falla detectada pendiente de corrección: en la ficha, si se aumenta la cantidad y luego se cambia a una variante con menos stock, la confirmación muestra la cantidad anterior aunque el carrito limite la cantidad agregada al stock. Reproducido en Chrome: se muestran 4 unidades agregadas pero se guardan 3. No se modificó el comportamiento en esta revisión.


En el Single Type de Sucursales (página de sucursales) agregar un campo extra al componente repetible que sea Ciudad ✅

Cambios realizados:
- Se agregó el campo opcional `ciudad` al componente repetible de cada sucursal en el Single Type Página de Sucursales de Strapi. Queda disponible junto a provincia, calle y teléfonos en las siete sucursales.
- El hook de la página incorpora la ciudad recibida desde Strapi y el respaldo local ya incluye las ciudades de las sucursales existentes, para que el selector mantenga la información aun cuando falle la carga remota.
- En el desplegable de Retiro por sucursal del carrito, cada opción se presenta como `calle - ciudad`, por ejemplo `Pellegrini 141 - Santiago del Estero`, facilitando distinguir locales de una misma provincia. Si una sucursal aún no tiene ciudad cargada, su opción sigue siendo seleccionable y se muestra solo con la calle.
- La ciudad elegida se conserva dentro de los datos de entrega al continuar a Pago o volver al paso de Envío.
- Validación: pruebas focalizadas de Envío y datos de entrega aprobadas (4 pruebas); compilación de producción de Frontend y panel de Strapi completadas correctamente. Se mantienen advertencias preexistentes de Browserslist y ESLint.


Revisar intensivamente los procesos de pago, especialmente Mercado Pago: al abortar sin terminar el proceso, el pedido debe quedar como Abortado y no Procesando ✅

Investigación y cambios realizados:
- Se confirmó la causa: el pedido se creaba como Procesando antes de salir a Mercado Pago; el webhook solo atendía pagos aprobados y el retorno de error no actualizaba Strapi.
- Los intentos nuevos de Mercado Pago ahora nacen como Pendiente de pago. El regreso sin completar, el rechazo y la cancelación del pago se registran como Abortado. Cancelado se conserva para las decisiones administrativas.
- Los estados reales pending, in_process, authorized e in_mediation permanecen pendientes aunque el comprador vuelva al sitio. Una aprobación confirmada deja el pedido en Procesando para su preparación, incluso si llega después de un aborto local.
- Se agregó conciliación protegida en ambos retornos, incluso sin payment_id, y al volver atrás al paso de Pago. La web consulta al servidor antes de mostrar éxito o limpiar el carrito. Una URL manipulada no acredita compras; un fallo de red tampoco se interpreta como aborto.
- Cada intento usa un token aleatorio propio, compatible con clientes registrados e invitados. La preferencia se vincula al pedido validado de Strapi, reutiliza la existente y toma productos, variantes, precios, total, correo y URLs del servidor.
- Se incorporaron vencimiento de preferencia y conciliación cada cinco minutos para cierres de pestaña sin retorno. El plazo predeterminado es de 60 minutos, configurable; solo vence localmente un intento sin pago. Al abortar explícitamente se cierra la preferencia antes de permitir otro intento.
- El webhook valida la firma de Mercado Pago y admite data.id. Stock, consumo y emisión de gift cards y marca de procesamiento se confirman en una transacción con bloqueo, para soportar avisos simultáneos, duplicados y reintentos tras errores.
- Se validan referencia, importe y moneda del pago, además de actividad, vencimiento y monto de los descuentos por gift card. Se impide disfrazar un producto de gift card usando solo su nombre. Se retiró una credencial incrustada como respaldo del servicio.
- Pedidos Admin incorpora Pendiente de pago y Abortado, y muestra por separado el estado financiero en tabla, detalle y comprobante. Reembolsos, contracargos y errores de acreditación quedan identificados para revisión administrativa.
- Validación: 152 pruebas de frontend y 60 de backend aprobadas; se incluyen transacciones y concurrencia con SQLite real en memoria. Revisión en Chrome de ocho escenarios simulados (aborto, pendiente, aprobado y error de conexión en escritorio y celular), comprobando carrito y errores de ejecución. Compilación de Frontend y panel de Strapi verificadas con advertencias preexistentes. No se realizaron cobros, preferencias, devoluciones ni correos reales.
- Documentación del diagnóstico, matriz de estados, configuración, pruebas y límites: docs/pagos-mercado-pago.md. Para desplegar deben configurarse MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET y las URLs públicas, desplegar ambos proyectos y reiniciar Strapi; falta la aceptación con cuentas de prueba y notificaciones reales del entorno remoto.
- Quedaron explícitamente documentadas mejoras adicionales fuera del caso de aborto: confirmación de cobros offline antes de habilitar gift cards, canje que cubra el 100 % de la compra, cola persistente de correos y reserva de inventario mientras se paga. Esos comportamientos no se presentan como resueltos por esta corrección.


Ajustar las apariciones del logo al nuevo archivo de 629 × 168, incluido el login de Strapi ✅

Cambios realizados:
- Se revisaron las referencias al logo en cabecera, menú móvil, pie de página, recuperación de contraseña, Banners Admin, comprobantes, correos y metadatos sociales.
- Se reemplazaron los límites de alto que achicaban el logo nuevo por anchos controlados y alto proporcional. Se declararon sus dimensiones reales para reservar el espacio sin deformarlo; el menú móvil se adapta también a pantallas de 320 px.
- Se mantuvieron los anchos útiles de la marca en los comprobantes y se ajustaron las ocho apariciones en plantillas/configuración de correo, con ancho adaptable al espacio disponible.
- Strapi incorpora una copia idéntica del archivo nuevo en el panel compilado, configurada como logo de autenticación, y estilos para respetar el formato horizontal en el login.
- Validación en Chrome: cabecera, footer, recuperación y menú en 1440, 768, 390 y 320 px; Banners Admin, correo y login compilado de Strapi en escritorio y celular. Se verificaron las dimensiones naturales 629 × 168, proporción, tamaños y ausencia de superposición. La revisión usa respuestas simuladas y no guarda ni publica datos reales.
- Las compilaciones de Frontend y panel de Strapi se verificaron. Para aplicar el login en el entorno remoto hay que desplegar el Backend con el panel reconstruido; para la web y correos se deben desplegar los cambios correspondientes.


Corregir la importación y exportación de Excel de administración y proveedores ✅

Cambios realizados:
- La importación de una planilla de proveedor conserva el stock del producto cuando su celda está vacía, las clasificaciones adicionales y las variantes que no figuran en el archivo. La columna de tamaño/color de proveedor queda identificada como referencia y no modifica esos atributos.
- La importación general preserva las variantes internas `-v1` que la exportación oculta. Si falta una variante comercial existente, rechaza ese producto e informa su ID y fila, sin borrarla.
- Los precios en texto con formato español, como `1.250,75`, se interpretan correctamente; los importes ilegibles y el stock inválido muestran la fila y el campo. Borrar Precio Oferta elimina la oferta aunque la columna calculada de porcentaje aún tenga un valor.
- Una planilla de proveedor sin cambios no reescribe el producto para completar una relación de categoría ausente. La importación general tampoco reconstruye una oferta vacía del producto a partir de una variante que sí está en oferta.
- Se detectan cambios de color en variantes. La exportación de proveedores admite nombres con coma y mantiene la selección múltiple por parámetros repetidos.
- El resultado de una importación parcial se muestra como tal en la API y el panel, con los errores por producto visibles. Los Excel dañados y los libros con hojas ajenas se rechazan antes de modificar productos.
- Los errores de validación de valores permitidos de Strapi se muestran en español en el registro y en el detalle del producto; se verificó que una categoría inválida no modifica el producto.
- El diagnóstico identifica los productos actualizados por fila, ID y nombre, conserva el detalle de los errores y reemplaza las líneas repetitivas de progreso por un resumen final. Para mantenerlo breve muestra hasta 50 actualizados e indica cuántos quedan sin listar. Validación: 14 pruebas de importación y exportación aprobadas.
- Validación: 13 pruebas nuevas de Excel, 73 pruebas de backend y 163 de frontend aprobadas; prueba adicional con Strapi y SQLite aislada para verificar componentes y `-v1`. Compilaciones de producción de Frontend y Backend correctas, con advertencias preexistentes.


Actualizar la categorización y los desplegables de los Excel de administración ✅

Cambios realizados:
- Se incorporaron las 12 categorías, 67 subcategorías y 94 tipos del Excel proporcionado en una única taxonomía compartida. Se conservaron los nombres, acentos y signos (quitando los dos puntos finales en `Dermocosmetica`); se retiraron solo espacios al comienzo o final de algunas celdas, igual que hace la importación.
- El catálogo completo, la plantilla vacía y la exportación por proveedores muestran Categoría → Subcategoría → Tipo en cascada. Los nombres repetidos de subcategoría se resuelven junto con su categoría para mostrar los tipos correctos.
- La sección sigue siendo independiente porque el archivo de categorías no indica Hogar o Perfumería. La importación mantiene la separación por sección y categoría sin cambiar productos existentes.
- Validación: 16 pruebas dirigidas de Excel aprobadas. Excel de escritorio abrió la planilla generada y resolvió correctamente las opciones de dos ramas distintas en filas diferentes.
- Compatibilidad de cascada con Google Sheets y Excel: se reemplazaron las fórmulas `INDIRECT` en las validaciones de datos por rangos literales en la hoja oculta `Listas`. En el catálogo completo (`Exportación Admin`, >4.300 filas) se utilizan listas desplegables fijas en bloque (`6` reglas `<dataValidation>` y `0` fórmulas en `Listas`) para permitir una importación instantánea en Google Sheets sin saturar el motor de fórmulas; en `Plantilla Vacía` y `Exportación Proveedores` se mantiene la cascada por fila con `IFERROR` + `MATCH` + `INDEX` usando referencia directa para Subcategoría y Tipo.
- Actualización de taxonomía a la versión revisada `Categorias de la pagina (2).xlsx` en [excel-taxonomy.json](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/utils/excel-taxonomy.json) (plurales, `Sets` → `Cofres` con tipos `Femeninas`/`Masculinas`, nuevas subcategorías `Accesorios` en `Dermocosmetica` y `Cuidado Personal`, reubicación de `Protectores Mamarios`, ajustes en `Maquillaje`, `Capilares`, `Niños y Bebes`, `Limpieza del Hogar` y `Electro belleza`, y corrección tipográfica de `"Contornos de Ojos y Labios"` en `Dermocosmetica Premium`).
- En la importación de la planilla por proveedor (`isPartialUpdate` en [importacion-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/importacion-admin/services/importacion-admin.js)), vaciar el campo `Tipo` limpia tanto `producto.tipo` como `producto.clasificaciones[0].tipo` en Strapi (en lugar de conservar el tipo anterior).
- Gestión de Variantes en planilla por proveedor: se extrajo el generador compartido `construirHojaVariantes` en [excel-utils.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/utils/excel-utils.js) y el lector compartido `leerHojaVariantes` en [importacion-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/importacion-admin/services/importacion-admin.js), incorporando la hoja `🔗 Variantes` en [exportacion-proveedores-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/exportacion-proveedores-admin/services/exportacion-proveedores-admin.js) agrupada por producto, con `BUSCARV` hacia `'💲 Precios por Proveedor'!A:D,4,FALSE`, 1 fila de variante de ejemplo (`EJEMPLO-VAR-001`, ignorada automáticamente al reimportar) cuando el proveedor no posee variantes para arrastrar fórmulas de referencia, alta de nuevas variantes, edición completa de atributos, control de IDs de variante duplicados y validación del filtro de proveedor seleccionado. Validación: 20/20 pruebas en [excel-roundtrip.test.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/tests/excel-roundtrip.test.js) aprobadas.


Distinguir categorías con el mismo nombre entre Hogar y Perfumería en el menú y catálogo ✅

Cambios realizados:
- Los enlaces a la categoría principal del header, tanto en escritorio como en móvil, incluyen la sección. El enlace desde el breadcrumb de producto también la conserva.
- El catálogo aplica sección, categoría, subcategoría y tipo a una misma clasificación del producto. Esto incluye clasificaciones adicionales y evita mezclar los datos de distintas filas.
- El menú obtiene las categorías publicadas aunque solo se usen como clasificación adicional y consulta sus columnas por sección y nombre. Los nombres ambiguos ya no toman por defecto las columnas de la otra sección.
- El filtro lateral mantiene separados los árboles de categorías homónimas de Hogar y Perfumería; al elegir una categoría sin sección activa, agrega la sección correspondiente a la URL.
- Validación: 165 pruebas de frontend aprobadas, compilación de producción correcta con advertencias preexistentes y prueba de Strapi con SQLite aislada que distingue productos de ambas secciones y descarta coincidencias repartidas entre distintas clasificaciones.
- Testeo adicional del megamenú y el catálogo: se verificaron las URL de categoría, subcategoría y tipo, los totales y dos páginas mediante la API HTTP real de Strapi con SQLite aislada. Se comprobó que las clasificaciones adicionales no duplican el total ni combinan datos de distintas filas.
- El menú y el filtro lateral ahora recorren todas las páginas de categorías; las marcas, tamaños y precios del catálogo recorren todas las páginas de productos y respetan la sección y los descuentos. Al cambiar de URL se vuelve a la primera página y se descartan respuestas anteriores.
- Los enlaces de Ofertas aplican el descuento y la sección elegidos; Lanzamientos ordena por fecha de creación descendente, ya que el producto no tiene un indicador específico de lanzamiento. En móvil se agregó acceso a todos los productos de una categoría y se corrigieron los enlaces de productos destacados.
- La prueba combinada de sección, categoría, subcategoría, tipo, oferta, marca, tamaño y precio respondió con el producto esperado. Límite detectado: el filtro de precio usa el mínimo y el máximo del producto, por lo que puede incluir un rango situado entre dos precios reales sin que ninguna variante tenga ese precio.
- Ordenamiento Menú Header: Hogar y Perfumería priorizan la categoría de su sección aunque haya relaciones homónimas. En General se presenta una sola entrada por nombre configurado y se reúnen las ramas de todas las secciones; las subcategorías homónimas indican su sección y sus enlaces la conservan. El catálogo general reúne también las opciones del filtro lateral.
- Validación adicional: pruebas de encabezado en escritorio y móvil, categorías y subcategorías repetidas, filtro lateral y consulta HTTP de Strapi con el total general de ambas secciones, sin duplicar productos.


Agregar borrado de productos por proveedor en Exportación Proveedores Admin ✅

Cambios realizados:
- La pantalla de exportación incorpora el botón amarillo BORRAR productos antes del de exportar. Se pueden elegir uno o varios proveedores, buscar por nombre, SKU o SKU de variante, y marcar únicamente los productos deseados. La selección comienza vacía y permite seleccionar los resultados visibles.
- Una segunda vista muestra solo los productos elegidos y exige escribir BORRAR. El servidor usa el mismo conjunto de productos publicados que el Excel, valida que cada ID pertenezca a los proveedores seleccionados y protege la operación con la sesión administrativa.
- La vista previa vence a los diez minutos; si cambian los productos o sus borradores, se rechaza y debe generarse nuevamente. También se impide seleccionar un documento cuyo borrador pertenece a otro proveedor.
- El borrado elimina el documento de Strapi, sus versiones y variantes; informa los productos borrados y los errores individuales. Las categorías, medios y pedidos permanecen. Los pedidos contienen una copia de sus productos.
- La confirmación advierte que un pago pendiente acreditado después puede requerir revisión del descuento de stock, pues ese proceso necesita el producto en Strapi.
- Validación: pruebas del panel y de la API para varios proveedores, búsqueda, selección parcial, IDs ajenos, confirmación, autorización, vista previa vencida o modificada y errores parciales; prueba con Strapi y SQLite aislada para versiones, variantes, productos no seleccionados y pedido histórico. La compilación de frontend pasó con advertencias preexistentes. No se borraron productos reales.


Ajustar botón de borrado de productos y selección exacta en Categorías General del Header ✅

Cambios realizados:
- Se renombró el botón de la pantalla de Exportación Proveedores Admin a "Seleccionar productos para borrar", reflejando con exactitud que la acción abre el selector interactivo antes de cualquier confirmación de borrado.
- Ordenamiento Menú Header (`categoriasGeneral`): al consultar Strapi se obtienen tanto el nombre como la sección del registro elegido. El menú toma únicamente la categoría y estructura de la sección efectivamente seleccionada en Strapi (por ejemplo, si se eligió Cuidado Personal de Hogar, solo se cargan sus subcategorías de Hogar, sin combinar ramas homónimas de Perfumería ni mostrar ambas).
- Se eliminaron los sufijos de sección en títulos de subcategorías y filtros laterales (ya no se añade ` · Hogar` o ` · Perfumería`), manteniendo nombres limpios sin aclaraciones en pantalla.
- Los enlaces de navegación (tanto al ver todo en la categoría como al seleccionar una subcategoría) transmiten la sección configurada en Strapi (`&seccion=Hogar`), asegurando que el catálogo filtre exactamente los productos de dicha sección.
- Validación: 177 pruebas de frontend aprobadas (incluyendo tests de navegación en escritorio y menú móvil para categorías homónimas en vista General y panel de borrado) y compilación de producción de frontend completada exitosamente.


Sincronizar la interfaz cuando expira una sesión ✅

Cambios realizados:
- Los JWT de clientes (7 días) y administración (1 día) no cuentan con refresh token. El frontend ahora valida `exp` al cargar y programa la invalidación al vencer, sin intentar una renovación inexistente.
- Los errores `401` se detectan centralmente en Axios y en las solicitudes autenticadas con Fetch; los `403` continúan como errores de permisos y no cierran la sesión.
- Al expirar se eliminan solamente el token y el usuario correspondientes, se sincroniza el contexto visual y un modal global bloquea nuevas acciones con las opciones "Iniciar sesión nuevamente" y "Cerrar sesión".
- La reautenticación del cliente mantiene la URL y conserva montadas, cuando corresponde, las pantallas de Mi Cuenta, Envío y Pago para no perder formularios o selecciones. El panel administrativo vuelve al login de la misma ruta.
- Validación: 182 pruebas de frontend aprobadas y compilación de producción correcta; permanecen solamente advertencias preexistentes de ESLint y Browserslist.
- Se mejoró la jerarquía visual del modal de sesión expirada y se acortó el botón principal a "Iniciar sesión", con mejor ajuste en pantallas chicas.


Agregar enlace al canal de WhatsApp ✅

Cambios realizados:
- El botón "Unirme" del bloque "Sumate a nuestro canal de WhatsApp!" abre el canal oficial de Marybe en una pestaña nueva.


Adaptar la grilla de promociones bancarias para hasta 12 elementos ✅

Cambios realizados:
- Se compactaron las tarjetas existentes manteniendo el estilo visual, con logo y condiciones de cuotas legibles.
- La grilla muestra cuatro columnas en escritorio, tres en tablet, dos en móvil y una en pantallas muy angostas; admite los 12 elementos que devuelve la sección sin carrusel ni límite visual fijo.


Renombrar el monto mínimo de promociones bancarias ✅

Cambios realizados:
- En Strapi el campo `monto_maximo` se renombró a `monto_minimo`, conservando la columna de base de datos existente para mantener los valores cargados.
- Inicio y el modal de medios de pago ahora muestran el monto como condición mínima: "en compras desde".
- Validación de carga: 12 promociones activas llegan ordenadas desde la API, las inactivas se excluyen y `monto_minimo` conserva sus datos en Strapi; pruebas de Inicio y modal aprobadas (3), con SQLite aislada.


Quitar imágenes locales antiguas de Sobre Marybe ✅

Cambios realizados:
- La página Nuestra Historia ya no usa las imágenes locales antiguas cuando Strapi no tiene imagen o la consulta falla; solo renderiza imágenes recibidas desde Strapi.
- Las imágenes se decodifican de forma asíncrona y las que están más abajo se cargan de forma diferida para aprovechar la caché HTTP del navegador y reducir trabajo inicial.


Adaptar imágenes reemplazables de Sobre Marybe ✅

Cambios realizados:
- Los cuatro campos de imagen de Strapi incluyen un encuadre ajustable (centro, arriba, abajo, izquierda o derecha) y sugerencias de proporción según su uso.
- Los banners laterales usan proporciones estables que cambian en móvil; se eliminó el recorte basado en alturas, márgenes y desplazamientos fijos.
- La imagen final selecciona el archivo móvil con `<picture>` hasta 900 px y deja un único elemento de imagen; cada versión tiene su propio encuadre.
- Se ajustó la imagen final para que se visualice completa y sin recortes (`height: auto`, sin forzar `aspect-ratio` fijo ni `object-fit: cover`), preservando su proporción natural tanto en escritorio como en móvil.
- Se ajustaron tipografías y márgenes con valores fluidos para acompañar los nuevos contenedores en pantallas chicas.
- Validación: 2 pruebas del componente verifican encuadres, archivo móvil responsivo, un solo `<img>` final y ausencia de imágenes si Strapi no devuelve archivos; 187 pruebas de frontend aprobadas.


Auditoría integral de seguridad, gestión y lógica de negocio ✅

Cambios realizados:
- Se ejecutó un relevamiento completo de arquitectura, autenticación, roles, endpoints, pasarelas de pago, gestión de stock, concurrencia y dependencias.
- Se identificaron, documentaron y subsanaron los 15 hallazgos en [AUDITORIA_SEGURIDAD_GESTION.md](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/AUDITORIA_SEGURIDAD_GESTION.md):
  - **Seguridad y Autenticación (`SEC-01`..`SEC-06`):** Se creó el módulo centralizado [admin-auth.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/utils/admin-auth.js) eliminando el fallback estático `'custom-secret-key'`, aplicando comparación en tiempo constante (`crypto.timingSafeEqual` sobre SHA-256) en logins administrativos y en [cannon.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/cannon/controllers/cannon.js), rate limiting por IP (HTTP 429) en logins y validación de Gift Cards, entropía de 12 bytes en códigos de Gift Card, validación estricta de MIME/extensión en [editor-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/editor-admin/controllers/editor-admin.js) (bloqueando SVG/HTML), ocultamiento de errores de base de datos en [custom-gift-card.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/gift-card/controllers/custom-gift-card.js) y envío de tokens OAuth por fragmento hash (`#`) en [index.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/index.js) y [AuthRedirect.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/auth/AuthRedirect.jsx).
  - **Lógica de Negocio y Gift Cards (`LOG-01`..`LOG-03`):** Se habilitó el checkout de pedidos cubiertos al 100% por Gift Card ($0 a pagar) en [custom-pedido.js (servicio)](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/pedido/services/custom-pedido.js) y [custom-pedido.js (controlador)](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/pedido/controllers/custom-pedido.js), se implementó la conservación del saldo remanente en consumos parciales de Gift Cards en [checkout-lifecycle.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/mercado-pago/services/checkout-lifecycle.js), y se restringió la emisión de Gift Cards a montos enteros ≥ $1.000.
  - **Concurrencia, Integridad y Gestión (`COM-01`, `COM-02`, `MGT-01`, `MGT-02`, `INT-01`, `INT-02`):** Se unificó la confirmación de pedidos offline bajo transacción atómica y bloqueo de concurrencia (`fulfill` + `strapi.db.transaction`) impidiendo sobreventa de stock, se añadieron registros de auditoría (`[AUDIT]`) en borrados administrativos, se configuró `ADMIN_NOTIFICATION_EMAIL` en [correo.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/correo/services/correo.js), se sanitizaron con `escapeHtml` las variables en plantillas de correo y se eliminó la dependencia obsoleta `xlsx` de [package.json](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/package.json).
- Validación: Se agregó la suite [security-audit-remediation.test.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/tests/security-audit-remediation.test.js) (90/90 pruebas de backend aprobadas).

Editor de Inicio — Fase 1: selector de secciones ✅

Cambios realizados:
- Nueva ruta `/editor-inicio-admin` con el panel «¿Qué querés modificar hoy?»: diez tarjetas (Banners, Sección Destacada, Categorías, Categoría Destacada (1), Ofertas, Descuentos, Categoría Destacada (2), Beneficios, Gift Card y Próximos Eventos) en el orden real de Inicio (Perfumería), con ícono, descripción, estado e indicador de navegación. Grilla de 1 a 5 columnas según el ancho.
- Acceso con el mismo login y token administrativo de `/banners-admin` (`/api/importacion-admin/login`, `admin_jwt`); se descartan tokens vencidos y se cierra la vista ante sesión expirada. Sin backend, modelos ni endpoints nuevos.
- Banners abre el editor existente en `/editor-inicio-admin/banners`, con botón «← Editor de Inicio» (pide confirmación si hay cambios sin guardar). `/banners-admin` sigue funcionando igual.
- Las demás secciones tienen ruta propia (`/editor-inicio-admin/<id>`) con la vista «Editor próximamente disponible» y regreso al selector; rutas inexistentes vuelven al selector. Configuración central en `editorInicioSections.js` y registro de editores en `sectionEditors.js`. Documentación en `docs/editor-inicio-admin.md`.
- Validación: 200 pruebas de frontend aprobadas (13 nuevas), lint sin errores en los archivos tocados, `npm run build` correcto y QA en navegador con CMS simulado (`scripts/qa-editor-inicio.cjs`) en escritorio, tablet y celular.

Editor de Inicio — Sección Destacada (editor visual) ✅

Cambios realizados:
- Nuevo editor en `/editor-inicio-admin/seccion-destacada` con la misma organización que Banners: Perfumería/Hogar, partes de la sección, lienzo con la sección real («Lo nuevo en Marybe») en computadora, tablet y celular, inspector, deshacer/rehacer, vista previa limpia y aviso por cambios sin guardar. Un clic en el lienzo abre la parte correspondiente.
- Se editan título (dos partes y sus colores), subtítulo, imagen de computadora y de celular (biblioteca o subida), productos destacados (búsqueda por nombre, marca o SKU, hasta 40) y los dos banners inferiores de Perfumería.
- Guardar borrador no cambia la tienda (campo privado `borradores_editor_inicio` en la Página de Inicio). Publicar escribe en `secciones`, `categorias_destacadas` y `destacado` de los productos, sin publicar otros cambios pendientes de cada producto. Control de versión con aviso 409.
- Backend: API `destacada-admin` (resumen, búsqueda, guardar/publicar, descartar borrador) con el JWT administrativo. Landing: `FeaturedSection` y `FeaturedSectionHogar` aceptan `previewData` opcional; sin ella funcionan igual.
- Validación: 209 pruebas de frontend y 101 de backend aprobadas, build correcto, integración con Strapi real (SQLite de QA) y recorrido completo en navegador: borrador, recarga, vista previa, conflicto, publicación reflejada en `/inicio`, Hogar y celular.

Editor de Inicio — Tamaño de imágenes de la Sección Destacada ✅

Cambios realizados:
- La imagen principal y las imágenes de los dos banners inferiores se pueden achicar y agrandar (30 % a 200 %) con deslizador, botones Achicar/Agrandar y Original, por separado para computadora/tablet y celular. Al ajustar un tamaño, el lienzo muestra ese dispositivo.
- Strapi: campos `escala_imagen_desktop` y `escala_imagen_mobile` en `shared.seccion-principal-item` y `shared.banner-destacado`; se publican desde el editor y también pueden editarse desde el panel de Strapi.
- Landing (Perfumería y Hogar): aplica el tamaño solo cuando hay un ajuste; sin valores se ve exactamente igual que antes.
- Validación: 211 pruebas de frontend y 101 de backend aprobadas, build correcto y recorrido con Strapi real: ajuste en el lienzo por dispositivo, publicación de los valores y tamaño aplicado en /inicio.

Editor de Inicio — Productos destacados alineados con el Excel ✅

Cambios realizados:
- El panel de productos de la Sección Destacada aclara que usa el mismo dato que la columna Destacado del Excel: lo marcado con TRUE en la planilla aparece en el editor y lo publicado desde el editor sale en la próxima exportación.
- El máximo pasó de 40 a 25 productos por área, porque la landing consulta los destacados sin paginar y Strapi devuelve 25 como máximo. Si la planilla dejó más, el editor avisa cuántos quitar y no permite publicar hasta resolverlo.
- Validación: 211 pruebas de frontend y 101 de backend aprobadas, build correcto.

Sección Destacada de Hogar: vista completa en el editor y en la tienda ✅

Cambios realizados:
- La vista previa del editor simula el alto de una pantalla real (computadora 800 px, tablet 1180 px, celular 844 px). Antes las medidas en vh de la sección se calculaban sobre el alto del lienzo y la imagen de Hogar quedaba desplazada o fuera de escala.
- Hogar sin productos destacados ya no queda cortada: el carrusel reserva el alto de una fila de tarjetas en pantallas de más de 768 px (474 px, el mismo alto que ocupa con productos), y la imagen se ve completa. Con productos, la sección mide lo mismo que antes.
- Validación: 211 pruebas de frontend aprobadas, build correcto, comparación de capturas tienda/editor en computadora y celular (Hogar sin productos) y recorrido completo del editor con Strapi real.

Editor de Inicio — Sección Categorías ✅

Cambios realizados:
- Nuevo editor en `/editor-inicio-admin/categorias`, con el mismo diseño y flujo que la Sección Destacada: Perfumería/Hogar, lienzo con la sección real, inspector, deshacer/rehacer, borrador, publicación, vista previa y aviso al salir.
- Imagen de portada por categoría (biblioteca o subida). Se aplica en Strapi recién al publicar, solo en las categorías modificadas y sin publicar otros cambios pendientes de la categoría.
- Orden por arrastre horizontal (mouse y táctil) con hueco de destino, más flechas y lista ↑/↓ como alternativa accesible. El orden es solo de esta sección (`diseno_categorias`), por `documentId`.
- Diseño general: tarjetas con bordes redondeados (original), rectangulares, cuadradas o circulares; botones píldora (original), redondeados o cuadrados, en bordó o claro. Muestras visuales de cada opción.
- Refactor: la Sección Destacada y Categorías comparten `useSectionDraft` y `SectionEditorShell`.
- Landing: `CategoriesSection` aplica orden y diseño solo si están configurados, conserva enlaces y responsive, y pide hasta 100 categorías.
- Validación: 221 pruebas de frontend y 107 de backend aprobadas, build correcto, integración con Strapi real (portada en borrador y publicado, cambios pendientes sin publicar, subcategorías intactas) y recorridos en navegador de Categorías, Sección Destacada y Editor de Inicio.

Editor de Inicio — Categoría Destacada (1) ✅

Cambios realizados:
- Nuevo editor en `/editor-inicio-admin/categoria-destacada-1`, con el mismo diseño y flujo que los demás módulos (Perfumería/Hogar, lienzo con la sección real, inspector, deshacer/rehacer, borrador, publicación, vista previa y aviso al salir). Solo afecta a Categoría Destacada (1).
- Se elige la categoría de Strapi (con cantidad de productos y avisos si está vacía o ya no existe) y el título de la sección.
- Productos: modo automático (comportamiento original) o selección propia de hasta 25 productos publicados de la categoría, con buscador paginado y orden por arrastre horizontal o flechas.
- Strapi: campo nuevo `productos_orden` (JSON) en el componente `inicio.destacada`; API `categoria-destacada-admin` con el JWT administrativo. No se tocan productos ni categorías.
- Landing: `FeaturedCategorySection` acepta `previewData` y, si hay productos elegidos, los muestra en ese orden; sin selección se ve igual que antes.
- Refactor: `OrderStrip`, `PartButton` y `ProductPickerItem` pasaron a ser componentes compartidos por los editores.
- Validación: 229 pruebas de frontend y 111 de backend aprobadas, build correcto, y recorridos en navegador con Strapi real de Categoría Destacada (1), Categorías, Sección Destacada y Editor de Inicio.

Editor de Inicio — Sección Ofertas ✅

Cambios realizados:
- Análisis: la sección no muestra productos ni precios; son 9 insignias estáticas que filtran la tienda por descuento. Título, tipografía, color, fondo y espaciado estaban fijos en el código.
- Nuevo editor en `/editor-inicio-admin/ofertas` (Perfumería/Hogar, lienzo real, deshacer/rehacer, borrador, publicación, vista previa responsive y aviso al salir).
- Contenido: título editable, con «Disfrutá de las mejores ofertas» como valor predeterminado.
- Tipografía: Inter o Brygada 1918, cuatro tamaños predefinidos con versión para celular, peso normal/semibold/bold y alineación izquierda/centro/derecha.
- Diseño (elegido por el análisis): color del título dentro de la paleta, fondo blanco/arena/rosado y espaciado compacto/original/amplio.
- Sin cambios en insignias, porcentajes ni enlaces a la tienda.
- Strapi: campo JSON `diseno_secciones` en la Página de Inicio y API genérica `secciones-inicio-admin`, reutilizable por otras secciones sin modelo propio.
- Validación: 239 pruebas de frontend y 117 de backend aprobadas, build correcto, y recorridos en navegador con Strapi real de Ofertas (borrador, recarga, descarte, publicación, landing en computadora/tablet/celular y enlaces de las insignias) y de los demás módulos.

Rediseño visual del panel principal de Editor de Inicio (`/editor-inicio-admin`) ✅

Cambios realizados:
- Se aplicó el fondo externo rojizo/bordó oscuro de Marybe (idéntico al de autenticación en `.ia-wrapper`) y se agregó el botón «Ver web» (`href="/"`, nueva pestaña) en la barra superior de [EditorInicioLayout.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/EditorInicioLayout.jsx), manteniendo el contenedor interior blanco (`SelectorPanel`) en [SectionSelector.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/SectionSelector.jsx).
- Se vincularon las 10 capturas numeradas de `Frontend/public/capturas-admin-editor/` (`01-banners.png` a `10-eventos.png`) en [editorInicioSections.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/editorInicioSections.js).
- Se rediseñaron las tarjetas en [SectionCard.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/SectionCard.jsx) incorporando la captura de cada sección como fondo (`PreviewBackdrop` con opacidad optimizada `0.48` → `0.72` en hover y `PreviewScrim` gradual para legibilidad del título, descripción, orden y estado).
- Validación: 9/9 pruebas en [EditorInicioAdmin.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/EditorInicioAdmin.test.jsx) aprobadas (incluyendo verificación de existencia en disco y renderizado de las 10 capturas).


Editor de Inicio — Descuentos (DiscountedSection) ✅

Análisis previo:
- La sección tiene dos bloques (Perfumería `DiscountedSection` y Hogar `DiscountedSectionHogar`) con texto superior fijo «Envíos a todo el país», título en dos partes, imagen, productos con descuento y botón «Conocer más» hacia `/tienda?descuento=todas&seccion=…`.
- En Strapi solo las **categorías** son un modelo propio; **marca** y **proveedor** son campos de texto de producto. El catálogo (`/tienda`) filtra por `categoria`+`seccion` y por `marca`; no existe página ni filtro público de proveedor, por eso ese tipo no genera enlace automático (solo enlace manual).

Cambios realizados:
- Backend: nueva API `descuentos-admin` (overview, `/entidades`, guardar/publicar, descartar), con el JWT administrativo. Reutiliza `diseno_secciones.descuentos` y `borradores_editor_inicio` (sin cambios de esquema), control de versión 409 y `safeUrl`. Los bloques tienen identificadores estables `bloque-1` y `bloque-2`. La imagen se valida contra la biblioteca (sin SVG) y su URL sale siempre del archivo real.
- Cada bloque guarda: tipo e identificador de la entidad (categoría por `documentId`, marca/proveedor por su valor), textos (superior, título en dos partes y sus colores), imagen promocional, texto del botón, modo de enlace (automático/personalizado) y enlace. No modifica categorías, marcas, productos ni precios. Sin configuración publicada se usan los valores actuales del componente `descuento_*`.
- Editor en `/editor-inicio-admin/descuentos` con la misma metodología que Categoría Destacada (lienzo con la sección real, borrador, publicación, deshacer/rehacer, aviso al salir): partes Contenido promocionado (tipo, buscador y selección de categoría/marca/proveedor con cantidad de productos), Textos, Imagen promocional (biblioteca; para categorías ofrece su portada sin alterarla) y Botón (enlace automático o personalizado, validado).
- Landing: `DiscountedSection` y `DiscountedSectionHogar` usan la configuración publicada vía el hook `useDescuentosBloque` y `utils/descuentosBloque.js`; sin configuración se ven igual que antes. El destino sigue la prioridad enlace personalizado válido > página de la entidad (la categoría se resuelve por su nombre actual en Strapi) > enlace original; una entidad eliminada o un enlace inválido vuelven al enlace original.
- Validación: 12 pruebas nuevas de la API (129/129 de backend aprobadas), 8 del editor y 14 de la landing (261/261 de frontend aprobadas) y lint sin errores en los archivos tocados. No se probó contra un Strapi real ni se hizo la compilación de producción.


Editor de Inicio — Categoría Destacada (2) + ícono opcional en título (Categoría Destacada 1 y 2) ✅

Análisis previo:
- `FeaturedCategorySection` (Categoría Destacada 1, campos `destacada_perfumeria` y `destacada_hogar`, componente `inicio.destacada`) y `SpecificCategorySection` (Categoría Destacada 2, campos `categoria_especifica_perfumeria` y `categoria_especifica_hogar`, componente `inicio.categoria_especifica`) comparten la misma estructura funcional en la landing (título + carrusel de productos de una categoría de Strapi).

Cambios realizados:
- Esquemas de Strapi: se incorporó `icono_titulo` (string opcional) en [destacada.json](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/components/inicio/destacada.json) y tanto `icono_titulo` como `productos_orden` (JSON) en [categoria_especifica.json](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/components/inicio/categoria_especifica.json).
- Backend reutilizado: [categoria-destacada-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/categoria-destacada-admin/services/categoria-destacada-admin.js), su controlador y sus rutas parametrizan los dos módulos (`categoria-destacada-1` y `categoria-destacada-2`) con borradores independientes (`categoriaDestacada` y `categoriaDestacada2`), validando `icono_titulo` contra el catálogo permitido (`''`, `estrella`, `corazon`, `regalo`, `destellos`, `etiqueta`, `flecha`, `bolsa`) y preservando el campo media `icono` existente en `categoria_especifica_*`.
- Editor reutilizado: [CategoriaDestacadaEditor.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/categoriaDestacada/CategoriaDestacadaEditor.jsx), [categoriaDestacadaModel.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/categoriaDestacada/categoriaDestacadaModel.js), [CategoriaDestacadaPartsPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/categoriaDestacada/CategoriaDestacadaPartsPanel.jsx) y [ContenidoPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/categoriaDestacada/ContenidoPanel.jsx) administran ambas instancias (`moduleKey="categoria-destacada-1"` y `CategoriaDestacada2Editor` en `/editor-inicio-admin/categoria-destacada-2`), incorporando el selector visual (`OptionTiles`) y casilla de activación del ícono al final del título.
- Landing y previsualización: se creó [categoriaDestacadaIconos.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/utils/categoriaDestacadaIconos.js) (`react-icons/fi` y `react-icons/hi2`) y se actualizaron [FeaturedCategorySection.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/FeaturedCategorySection.jsx), [SpecificCategorySection.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/SpecificCategorySection.jsx), [sectionEditors.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/sectionEditors.js) y [EditorInicioPreview.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/EditorInicioPreview.jsx).
- Validación: pruebas de backend en [categoria-destacada-admin.test.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/tests/categoria-destacada-admin.test.js) (5/5 aprobadas) y de frontend en [CategoriaDestacadaEditor.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/categoriaDestacada/CategoriaDestacadaEditor.test.jsx), [FeaturedCategoryPreview.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/FeaturedCategoryPreview.test.jsx) y [EditorInicioAdmin.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/EditorInicioAdmin.test.jsx) (21/21 aprobadas), más ESLint sin errores.

### Ampliación de opciones de edición de imagen en Descuentos (`/editor-inicio-admin/descuentos`) y visualización en Inicio
- Backend: en [descuentos-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/descuentos-admin/services/descuentos-admin.js) se agregaron y validaron `imagen_mobile` (URL o ruta `/...` opcional para celular), `escala_imagen_desktop` y `escala_imagen_mobile` (enteros de 30% a 200%, 100% por defecto), `imagen_ajuste` (`contener` o `cubrir`), `imagen_posicion` (`centro`, `arriba`, `abajo`, `izquierda`, `derecha`) e `imagen_sombra` (booleano, activo por defecto), limpiando además cualquier reemplazo heredado en `banners_visuales` (`descuento_perfumeria` / `descuento_hogar`) al publicar.
- Utilidades y componentes públicos: en [descuentosBloque.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/utils/descuentosBloque.js) se incorporaron `AJUSTES_IMAGEN_OPTIONS`, `POSICIONES_IMAGEN_OPTIONS`, [`imagenEstilo`](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/utils/descuentosBloque.js#L44-L60) y [`entidadProductosUrl`](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/utils/descuentosBloque.js#L63-L77). En [useDescuentosBloque.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/hooks/useDescuentosBloque.js), [DiscountedSection.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/DiscountedSection.jsx) y [DiscountedSectionHogar.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/hogar/DiscountedSectionHogar.jsx) se eliminó el parpadeo del fallback inicial mientras carga el backend (`configLoading`), se evita que `BannerSlot` pise la imagen cuando hay configuración del bloque en Inicio, se consultan y muestran los productos publicados de la entidad promocionada (`categoria`, `marca` o `proveedor`), y se conectan `imageScaleCss('center')`, `imageScaleProps(bloque)`, `<source media="(max-width: 768px)">` y los estilos de ajuste, encuadre y sombra.
- Editor administrativo: en [ImagenPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/descuentos/ImagenPanel.jsx), [DescuentosEditor.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/descuentos/DescuentosEditor.jsx) y [DescuentosPartsPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/descuentos/DescuentosPartsPanel.jsx) se sumaron selector/subida de imagen independiente para celular, controles [`ScaleField`](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/destacada/ScaleField.jsx) de tamaño para computadora y celular (con cambio automático de vista previa), selectores visuales [`OptionTiles`](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/destacada/OptionTiles.jsx) para ajuste y posición, e interruptor de sombra proyectada.
- Validación: pruebas de backend en [descuentos-admin.test.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/tests/descuentos-admin.test.js) (13/13 aprobadas) y de frontend en [DescuentosEditor.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/descuentos/DescuentosEditor.test.jsx), [DescuentosLanding.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/DescuentosLanding.test.jsx) y [HeadingColors.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/HeadingColors.test.jsx) (54/54 aprobadas), más ESLint sin errores en los módulos modificados.

### Editor de Inicio — Beneficios (`/editor-inicio-admin/beneficios`) ✅
- Análisis previo: `TarjetasPromociones` obtiene los beneficios activos desde el modelo existente `api::promocion-bancaria.promocion-bancaria` (`nombre`, `logo`, `cuotas_descripcion`, `cuotas_cantidad`, `monto_minimo`, `orden`, `activo`), compartido con `PaymentModal`.
- Backend: nueva API [beneficios-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/beneficios-admin/services/beneficios-admin.js), [controllers/beneficios-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/beneficios-admin/controllers/beneficios-admin.js) y [routes/beneficios-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/beneficios-admin/routes/beneficios-admin.js) con permisos públicos y seed inicial en [index.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/index.js). Guarda borradores en `borradores_editor_inicio.beneficios.general` y al publicar actualiza los registros modificados de `promocion-bancaria` en Strapi (`nombre`, `logo`, `cuotas_descripcion`, `cuotas_cantidad`, `monto_minimo`) y la configuración visual de la sección (`titulo`, `info_titulo`, `info_descripcion`, `boton_texto`, `boton_enlace`, `orden` y ajustes por tarjeta `tamano_logo`, `ajuste_logo`, `posicion_logo`) en `diseno_secciones.beneficios.general`.
- Editor administrativo: se crearon [beneficiosModel.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/beneficios/beneficiosModel.js), [BeneficiosEditor.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/beneficios/BeneficiosEditor.jsx), [BeneficiosPartsPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/beneficios/BeneficiosPartsPanel.jsx), [ContenidoGeneralPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/beneficios/ContenidoGeneralPanel.jsx), [OrdenBeneficiosPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/beneficios/OrdenBeneficiosPanel.jsx) y [TarjetaBeneficioPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/beneficios/TarjetaBeneficioPanel.jsx), registrados en [sectionEditors.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/sectionEditors.js) y [EditorInicioPreview.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/EditorInicioPreview.jsx).
- Landing y utilidades: se creó [beneficiosSection.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/utils/beneficiosSection.js) y se actualizó [TarjetasPromociones.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/TarjetasPromociones.jsx) para soportar `previewData` en tiempo real y aplicar la configuración publicada en `/inicio` preservando el diseño original.
- Validación: pruebas de backend en [beneficios-admin.test.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/tests/beneficios-admin.test.js) (7/7 aprobadas) y de frontend en [BeneficiosEditor.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/beneficios/BeneficiosEditor.test.jsx), [TarjetasPromociones.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/TarjetasPromociones.test.jsx) y [EditorInicioAdmin.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/EditorInicioAdmin.test.jsx) (15/15 aprobadas), más ESLint sin errores.

### Editor de Inicio — Gift Card (`/editor-inicio-admin/gift-card`) ✅
- Análisis previo: el componente público [GiftCard.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/shared/GiftCard.jsx) se renderiza tanto en Perfumería como en Hogar con imagen estática `/inicio/giftcard.webp`, título dividido en dos estilos (`<em>Regalá</em> Marybe`), dos bloques descriptivos con íconos (`Producto` y `Monto personalizado`), fondo `#6A0304` (Perfumería) / `#B10002` (Hogar) y botón `Conocer más` hacia `/gift-card`.
- Backend: nueva API [gift-card-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/gift-card-admin/services/gift-card-admin.js), [controllers/gift-card-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/gift-card-admin/controllers/gift-card-admin.js) y [routes/gift-card-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/gift-card-admin/routes/gift-card-admin.js) que persiste por área (`perfumeria` y `hogar`) en `diseno_secciones['gift-card']` y `borradores_editor_inicio['gift-card']`, validando imagen contra la biblioteca de Strapi, colores HEX de 6 dígitos, enlaces seguros y control de versión `409`.
- Editor administrativo: se crearon [giftCardModel.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/giftCard/giftCardModel.js), [GiftCardEditor.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/giftCard/GiftCardEditor.jsx), [GiftCardPartsPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/giftCard/GiftCardPartsPanel.jsx), [ContenidoGiftCardPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/giftCard/ContenidoGiftCardPanel.jsx), [ImagenGiftCardPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/giftCard/ImagenGiftCardPanel.jsx), [AparienciaGiftCardPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/giftCard/AparienciaGiftCardPanel.jsx) y [BotonGiftCardPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/giftCard/BotonGiftCardPanel.jsx), registrados en [sectionEditors.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/sectionEditors.js) y [EditorInicioPreview.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/EditorInicioPreview.jsx).
- Landing y utilidades: se creó [giftCardSection.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/utils/giftCardSection.js) (reutilizando `CATEGORIA_DESTACADA_ICONOS` para los íconos de ambos bloques y cálculo automático de contraste por luminancia) y se actualizó [GiftCard.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/shared/GiftCard.jsx) para aplicar `previewData` y la configuración publicada en `/inicio`.
- Validación: pruebas de backend en [gift-card-admin.test.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/tests/gift-card-admin.test.js) (7/7 aprobadas) y de frontend en [GiftCardEditor.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/giftCard/GiftCardEditor.test.jsx), [GiftCard.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/shared/GiftCard.test.jsx) y [EditorInicioAdmin.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/EditorInicioAdmin.test.jsx) (14/14 aprobadas), más ESLint sin errores.

### Editor de Inicio — Próximos Eventos (`/editor-inicio-admin/proximos-eventos`) ✅
- Análisis previo: el componente público [ProximosEventos.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/ProximosEventos.jsx) consulta `GET /api/eventos?populate=*` sobre la colección `api::evento.evento` (`titulo`, `descripcion`, `fecha`, `ubicacion`, `whatsapp_numero`), renderiza la descripción separada por saltos de línea como viñetas y construye el mensaje automático de reserva por WhatsApp.
- Backend: nueva API [proximos-eventos-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/proximos-eventos-admin/services/proximos-eventos-admin.js), [controllers/proximos-eventos-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/proximos-eventos-admin/controllers/proximos-eventos-admin.js) y [routes/proximos-eventos-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/proximos-eventos-admin/routes/proximos-eventos-admin.js) con permiso público `api::evento.evento.find` y seed automático de 3 eventos iniciales en [index.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/index.js). Guarda borradores en `borradores_editor_inicio['proximos-eventos'].general` y al publicar actualiza los registros modificados de `api::evento.evento` en Strapi y persiste `titulo`, `icono`, tipografía (`fuente`, `tamano`, `peso`, `estilo`, `alineacion`), controles de diseño (`bordes_tarjeta`, `espaciado_tarjetas`, `cantidad_visible`, `boton_redondeo`), enlace inferior (`enlace_inferior_texto`, `enlace_inferior_url`), `orden` y configuración de botón por evento en `diseno_secciones['proximos-eventos'].general`.
- Editor administrativo: se crearon [proximosEventosModel.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/proximosEventos/proximosEventosModel.js), [ProximosEventosEditor.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/proximosEventos/ProximosEventosEditor.jsx), [ProximosEventosPartsPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/proximosEventos/ProximosEventosPartsPanel.jsx), [EncabezadoEventosPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/proximosEventos/EncabezadoEventosPanel.jsx), [OrdenEventosPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/proximosEventos/OrdenEventosPanel.jsx), [EventoIndividualPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/proximosEventos/EventoIndividualPanel.jsx), [DisenoEventosPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/proximosEventos/DisenoEventosPanel.jsx) y [EnlaceInferiorEventosPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/proximosEventos/EnlaceInferiorEventosPanel.jsx), completando las 10 secciones en [sectionEditors.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/sectionEditors.js) y [EditorInicioPreview.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/EditorInicioPreview.jsx).
- Landing y utilidades: se creó [proximosEventosSection.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/utils/proximosEventosSection.js) y se actualizó [ProximosEventos.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/ProximosEventos.jsx) para renderizar `previewData` en tiempo real y aplicar la configuración publicada en `/inicio`.
- Validación: pruebas de backend en [proximos-eventos-admin.test.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/tests/proximos-eventos-admin.test.js) (7/7 aprobadas) y de frontend en [ProximosEventosEditor.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/proximosEventos/ProximosEventosEditor.test.jsx), [ProximosEventos.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/ProximosEventos.test.jsx) y [EditorInicioAdmin.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/EditorInicioAdmin.test.jsx) (13/13 aprobadas), más ESLint sin errores en los archivos nuevos y modificados.


### Análisis — Más personalización en el Editor de Inicio

La revisión del código local incluye los diez editores registrados, la vista previa y la composición pública de Perfumería y Hogar. «Descubrí más» se muestra en ambas áreas y queda fuera del selector. Los editores ya tienen un flujo reutilizable de inspector, vista previa con el componente real, borrador y publicación.

1. **Diseño por sección · prioridad alta.** Empezar por Categoría Destacada (1 y 2) con alineación y tamaño del título, fondo y separación vertical. Reutilizar los controles de Ofertas y mantener «Original» como valor inicial. En una segunda etapa, sumar encuadre de imagen o densidad de tarjetas por dispositivo solo donde el componente ya soporte esas variantes. Tablet y celular heredan el ajuste general hasta que se elija uno propio.
2. **Insignias de Ofertas · prioridad alta.** Permitir elegir, ordenar y ocultar los porcentajes existentes por área y reemplazar su imagen desde la biblioteca. Cada insignia conserva el enlace al filtro que corresponde a su porcentaje. Sin personalización se usa la lista actual.
3. **Descubrí más · prioridad media.** Incorporar el bloque al selector para editar el encabezado y los textos y botones de Instagram y WhatsApp. Mantener el feed de Instagram como fuente de las publicaciones.
4. **Organización de Inicio · segunda etapa.** Mostrar una vista previa de la página completa por área antes de habilitar el orden de las secciones inferiores. Partir de los órdenes actuales de Perfumería y Hogar, mantener Banners primero y conservar los destinos que usa el menú, las animaciones y la carga diferida. Los bloques compartidos, como Beneficios y Próximos Eventos, pueden ocupar posiciones distintas por área con el mismo contenido.
5. **Separar la apariencia de Inicio del catálogo.** Ofrecer una imagen de categoría exclusiva para Inicio, con la portada del catálogo como valor inicial. La opción es aditiva: el editor actual de portadas escribe en el catálogo y la selección de Destacada actualiza el indicador de producto que también usa el Excel. Los ajustes nuevos de apariencia se pueden guardar por sección y área en la configuración existente, con borrador privado y control de versión.

Revisión estática del repositorio. Se registraron propuestas en el informe.

### Categoría Destacada (1 y 2) — Alineación y tamaño del título, fondo, separación vertical y densidad/encuadre por dispositivo con herencia ✅
- Esquemas y Backend: se incorporó `diseno` (`type: "json"`) en [destacada.json](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/components/inicio/destacada.json) y [categoria_especifica.json](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/components/inicio/categoria_especifica.json), y se actualizó [categoria-destacada-admin.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/src/api/categoria-destacada-admin/services/categoria-destacada-admin.js) para normalizar, validar y persistir `tamano`, `alineacion`, `fondo`, `espaciado`, `densidad`, `densidad_desktop`, `densidad_tablet`, `densidad_mobile`, `encuadre`, `encuadre_desktop`, `encuadre_tablet` y `encuadre_mobile`.
- Editor administrativo reutilizado: en [ContenidoPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/categoriaDestacada/ContenidoPanel.jsx), [DisenoCategoriaDestacadaPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/categoriaDestacada/DisenoCategoriaDestacadaPanel.jsx), [CategoriaDestacadaPartsPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/categoriaDestacada/CategoriaDestacadaPartsPanel.jsx), [categoriaDestacadaModel.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/categoriaDestacada/categoriaDestacadaModel.js) y [CategoriaDestacadaEditor.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/categoriaDestacada/CategoriaDestacadaEditor.jsx) se reutilizaron [DisenoOfertasPanel.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/ofertas/DisenoOfertasPanel.jsx), [TipografiaSample.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/ofertas/TipografiaSample.jsx) y las opciones de [ofertasModel.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/ofertas/ofertasModel.js), ofreciendo «Original» como valor inicial y sumando densidad y encuadre general y por dispositivo (`desktop`, `tablet`, `mobile`) con herencia automática del ajuste general.
- Landing y utilidades: se amplió [disenoSeccion.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/utils/disenoSeccion.js) con `disenoCategoriaDestacada` y se actualizaron [FeaturedCategorySection.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/FeaturedCategorySection.jsx) y [SpecificCategorySection.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/perfumeria/SpecificCategorySection.jsx).
- Validación: 6/6 pruebas de backend en [categoria-destacada-admin.test.js](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Backend/tests/categoria-destacada-admin.test.js), 14/14 pruebas de frontend en [CategoriaDestacadaEditor.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/pages/admin/editor-inicio/components/categoriaDestacada/CategoriaDestacadaEditor.test.jsx) y [FeaturedCategoryPreview.test.jsx](file:///C:/Users/teoch/OneDrive/Desktop/React/Marybe/Frontend/src/components/inicio/FeaturedCategoryPreview.test.jsx), y ESLint sin errores.

### Módulo 00 — Menú Header / Mega Menú

- En el menú General las categorías homónimas se muestran sin el sufijo de Hogar o Perfumería. Cada entrada conserva su identificación y enlaces por sección, con un nombre accesible diferenciado para lectores de pantalla. Validación: 17 pruebas de frontend aprobadas en editor y navegación de escritorio y móvil; ESLint sin errores y con una advertencia preexistente en NavBar.
- Separación de categorías homónimas: Hogar y Perfumería se identifican por categoría y sección. Pueden seleccionarse, quitarse y ordenarse independientemente dentro del mismo contexto. Si ambas aparecen en el header, se indica su sección y cada opción abre sus propias subcategorías y enlaces en computadora y móvil.
- Los borradores anteriores recuperan las categorías de otra sección que antes se ocultaban por compartir nombre. Validación: 295 pruebas de frontend aprobadas, integración con Strapi y SQLite aislada para selección, publicación y borradores anteriores, y ESLint sin errores con una advertencia preexistente en NavBar. Sin recorrido visual en navegador.
- Corrección de categorías homónimas: las casillas reflejan la opción incluida y se pueden desmarcar desde cualquiera de las secciones. La variante vinculada indica su sección de origen; una vez desmarcada, se puede elegir la otra.
- Validación: 16 pruebas del editor y navegación aprobadas, con cobertura de desmarcar la categoría homónima y volver a seleccionarla. ESLint sin errores en el editor.
- Ajuste posterior: las categorías ya incluidas también se pueden desmarcar y volver a agregar. Para cambiar entre categorías homónimas de Hogar y Perfumería, primero se desmarca la seleccionada. La publicación actualiza solo las relaciones del contexto elegido y rechaza borradores cuya selección original cambió en Strapi.
- Validación del ajuste: 16 pruebas de frontend aprobadas, integración con Strapi y SQLite aislada para quitar, volver a agregar, reemplazar una categoría homónima y detectar conflictos, y ESLint sin errores en el editor.
- Perfumería, Hogar y General permiten agregar categorías publicadas, agrupadas por sección, con búsqueda y vista previa. Al publicar se conserva la selección anterior y se vinculan las categorías nuevas únicamente al contexto elegido. Las categorías agregadas mantienen su sección y enlaces en el menú público. Se impide agregar dos opciones con el mismo nombre al mismo contexto.
- La personalización de Ofertas se organiza en pestañas de Descuentos, Categorías y Productos. Lanzamientos separa Categorías y Productos. Las columnas se muestran en paneles desplegables y los cambios locales se conservan al alternar pestañas.
- Validación del ajuste: 15 pruebas de frontend aprobadas, integración con Strapi y SQLite aislada para borrador, publicación, relaciones y rechazos, y ESLint sin errores, con una advertencia preexistente en NavBar. No se hizo una revisión visual en navegador.
- La tarjeta 00 utiliza `00-header.png` como imagen de fondo en el selector administrativo.
- Se incorporó el editor en `/editor-inicio-admin/menu-header`, con sesión administrativa compartida y acceso 00 antes de Banners. Permite ordenar las opciones del header por contexto y administrar los títulos, columnas, categorías y productos de Ofertas y Lanzamientos.
- Se reutilizaron los dos Single Types existentes. `ordenVisual` conserva identificadores de categorías y claves para Ofertas y Lanzamientos, con el orden anterior como valor inicial. Las categorías y los productos se eligen entre registros publicados, y sus datos comerciales permanecen sin modificar.
- Se agregaron borradores privados, publicación, descarte, validación de relaciones y control de versiones. Las escrituras administrativas usan la autenticación existente y se aplican transaccionalmente. La vista previa utiliza los componentes del header para computadora y móvil con los cambios locales, y la publicación solicita la actualización del menú cargado.
- El orden de opciones, categorías y productos permite arrastrar tarjetas o usar flechas. Las columnas de Ofertas se reordenan mediante flechas.
- Validación: 289 pruebas de frontend aprobadas y 11 pruebas del menú tras ampliar la cobertura móvil. Prueba de integración con Strapi y SQLite aislada para persistencia, relaciones, conflictos, autenticación y privacidad del borrador. Compilación de frontend y backend correcta, con advertencias preexistentes en frontend. ESLint sin errores y con una advertencia preexistente en NavBar. No se realizó un recorrido visual en navegador.

### Planificación — Banners principales

**10 de noviembre de 2026 · Estado de la implementación: pendiente.**

`BannersAdmin.jsx` abre el inspector en Banner y muestra Distribución en segundo lugar. En Inicio, `PromoCarousel.jsx` conserva el carrusel anterior con flechas laterales y arrastre. Si alguna fila o banner tiene diseño personalizado, el bloque se renderiza con `VisualBanners.jsx`, que usa una barra horizontal visible y flechas debajo.

1. **Ordenar el flujo del editor.** Abrir en **1. Distribución** al entrar por primera vez a una sección o crearla, y mostrar **2. Banner** a continuación. Mantener la última selección cuando se vuelve a una sección. El árbol, el botón de agregar y el lienzo deben seguir dando acceso directo al banner. Mostrar el contexto de la edición, por ejemplo, «Distribución 1 · Banner 2».
2. **Hacer visibles los ajustes de estructura.** Mostrar primero Grilla/Carrusel y las plantillas existentes de 1, 2, 4 columnas y distribución libre. En modo libre, ofrecer el ajuste de porcentajes junto a cada banner y accesos a las acciones de agregar y reordenar. Separar columnas, alto y separación de los ajustes avanzados de ancho, fondo, margen, espacio interior y visibilidad. Mostrar qué ajustes aplican a toda la sección, a la fila o al dispositivo seleccionado. Al aplicar una plantilla, preservar el contenido, el orden y las personalizaciones individuales de los banners.
3. **Recuperar la navegación anterior en Inicio.** Usar el carrusel de `PromoCarousel.jsx` como base de comportamiento y las flechas laterales de `FeaturedSection.jsx` como referencia visual. Compartir la navegación entre el carrusel anterior y el personalizado, conservando sus tamaños y estilos. Medir posiciones de banners visibles para que funcionen anchos distintos y separaciones configurables. Mostrar las flechas y el cursor de arrastre solo si hay contenido fuera de pantalla. Mantener deslizamiento táctil, ajuste al banner, navegación por teclado y avance circular con flechas. Mantener el autoplay público existente, pausarlo durante la interacción y respetar movimiento reducido. La vista previa ampliada debe mostrar los mismos controles con enlaces bloqueados. En el lienzo editable, conservar la selección, el arrastre de texto y el ajuste de ancho.
4. **Validar con datos simulados.** Cubrir el flujo Distribución → Banner, el guardado por dispositivo y la conservación de borradores con `BannersAdmin.test.jsx`, `BannersAdminEmbedded.test.jsx` y `BannersPreview.test.jsx`. Usar `scripts/qa-banners.cjs` como base para revisar Perfumería y Hogar en computadora, tablet y celular. Incluir filas históricas y personalizadas, grillas, banners ocultos, 50/50, anchos variables, una sola imagen, redimensionado, clic versus arrastre y desplazamiento vertical en celular. El plan se apoya en el modelo actual de Strapi.

#### Prompt de implementación

Implementá estos cambios en Marybe para los **Banners principales** de Perfumería y Hogar, en `/editor-inicio-admin/banners` y `/banners-admin`.

1. En `BannersAdmin.jsx` y `BannerStructure.jsx`, poné **1. Distribución** antes de **2. Banner**. Abrí en Distribución al entrar por primera vez o crear una sección, recuperá la selección anterior al volver y mantené el acceso directo a Banner desde el árbol y el lienzo. Mostrá qué distribución y banner se están editando. Priorizá Grilla/Carrusel, plantillas de 1, 2 y 4 columnas y distribución libre. En modo libre, exponé los porcentajes por banner. Dejá a mano Agregar banner y Reordenar. Separá columnas, altura y separación de los ajustes avanzados de ancho, fondo, margen, espacio interior y visibilidad. Diferenciá los ajustes generales de los que afectan al dispositivo activo. Reutilizá los campos, la herencia y el historial actuales. Las plantillas de distribución deben conservar contenido, orden y diseño individual.
2. En Inicio, recuperá las flechas superpuestas a izquierda y derecha, con el estilo de Destacados, el arrastre con mouse (`grab`/`grabbing`) y el deslizamiento táctil. Ocultá la barra horizontal. Integrá esa navegación en las dos variantes que renderiza `PromoCarousel.jsx`, incluida la personalizada de `VisualBanners.jsx`. Avanzá al banner visible anterior o siguiente según su posición real, con vuelta al otro extremo. Mostrá controles solo si hay desbordamiento y recalculá al cambiar de tamaño, contenido o dispositivo. El clic normal abre el enlace; el arrastre no lo activa. Conservá el desplazamiento vertical en celular, el teclado, el ajuste al banner y el autoplay público con pausa durante interacción y respeto por movimiento reducido.
3. Aplicá la navegación a las filas marcadas como **Carrusel**. La vista previa ampliada debe replicar las flechas y el gesto sin abrir enlaces. El lienzo editable debe conservar la selección, el arrastre del texto y el ajuste de ancho. Mantené los datos publicados, la compatibilidad con filas existentes, la herencia por dispositivo y la separación entre guardar borrador y publicar. Usá los campos y rutas actuales de Strapi.
4. Corré las pruebas específicas de Banners y verificá en navegador con CMS simulado. Probá Perfumería y Hogar en computadora, tablet y celular, grillas, filas históricas y personalizadas, porcentajes, banners ocultos, filas sin desbordamiento y clic versus arrastre. Registrá en el informe mensual qué cambió y qué validaciones ejecutaste.

### Banners principales — Reordenamiento y alto desde el lienzo

- El lienzo editable permite arrastrar banners para reordenarlos dentro de su distribución y ajustar el alto del banner seleccionado desde los bordes superior e inferior. El orden se comparte entre dispositivos. El alto se guarda para el dispositivo activo. Cada gesto genera una acción de deshacer y rehacer.
- Validación con 32 pruebas específicas aprobadas. En Chrome con CMS simulado se verificaron el arrastre, ambos bordes, el alto independiente por dispositivo, deshacer y rehacer, y el guardado del borrador.


### Cómo usar el Menú Header

1. Entrá a **Editor de Inicio → Menú Header** y elegí el contexto **General**, **Perfumería** o **Hogar**.
2. Agregá o quitá categorías publicadas y ordená las opciones arrastrándolas o usando las flechas. Si dos categorías tienen el mismo nombre, revisá a qué sección pertenece cada una.
3. En **Ofertas** y **Lanzamientos** podés organizar las columnas y elegir qué categorías o productos mostrar.
4. Revisá la vista previa en computadora y celular. Usá **Guardar borrador** para seguir editando después o **Publicar** para mostrar los cambios en la tienda.


### Alta de productos desde la plantilla de proveedores

- La importación crea productos nuevos con ID, nombre y proveedor seleccionado, incluyendo clasificaciones y variantes; conserva la actualización de productos existentes. Se rechazan datos obligatorios ausentes, proveedores fuera del filtro y variantes duplicadas.
- Validación local: 21 pruebas de Excel, 2 pruebas de la pantalla y prueba de Strapi con SQLite aislada aprobadas. No se modificó ni verificó la instalación publicada.


### Fondo de imagen en banners principales

- El editor muestra el selector de color junto al ajuste de imagen completa. El fondo predeterminado de los banners principales es blanco; los colores ya guardados y la herencia por dispositivo se conservan.
- Validación: 27 pruebas del editor y la representación de banners aprobadas.


### Campos de ficha en Excel de proveedores

- Se agregaron marca, descripción, especificaciones y características a la exportación e importación de proveedores. La importación acepta planillas anteriores sin modificar esos campos; en la nueva, una celda vacía permite borrarlos.
- Validación: 23 pruebas de Excel y prueba de altas y ediciones en Strapi con SQLite aislada aprobadas.

### Código postal en ubicación
![alt text](image.png)
- El modal conserva el código postal al continuar: de forma permanente si está activado «Recordar mis datos», o durante la sesión si está desactivado.
- Validación: 2 pruebas del modal aprobadas.

### Actualización del menú publicado en tiendas abiertas

- El menú vuelve a consultar las categorías y la configuración publicada al regresar a la pestaña y cada 60 segundos mientras está visible, sin reutilizar la caché del navegador. Guardar borrador sigue sin publicar cambios.
- Validación: 18 pruebas del menú y editor aprobadas; prueba de publicación con Strapi y SQLite aislada aprobada. No se verificó el estado de producción ni la causa específica del caso informado.

### Visibilidad de Ofertas y Lanzamientos en el menú

- El editor permite mostrar u ocultar cada opción por separado en Perfumería y Hogar. Conserva el orden y respeta borradores, publicación y vista previa; General y las configuraciones existentes mantienen su comportamiento.
- Validación: 20 pruebas del menú y editor aprobadas y prueba de publicación con Strapi y SQLite aislada aprobada.

### Espaciado del menú en notebooks

- Se redujo el espacio horizontal entre las opciones del menú de primer nivel en pantallas de 769 a 1366 px.
- Validación: revisión del cambio y git diff --check.
