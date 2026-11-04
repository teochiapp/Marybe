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
