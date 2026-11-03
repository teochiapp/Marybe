Te voy pasando los prompts aqui y cuando termines dejas escrito los cambios abajo de la consigna ✅

Arreglar el precio de Variantes en el modal de Agregar al Carrito ✅


Cuando este va al carrito no se actualiza correctamente tampoco con la variante correspondiente ✅

Cambios realizados:
- El modal de Agregar al Carrito ahora recalcula la variante activa y su precio cada vez que se modifica el talle o el color.
- La confirmación desde Single Product conserva la variante que se agregó, junto con su precio normal u oferta correspondiente.
- El carrito identifica cada producto usando también el ID de la variante, para no agrupar variantes distintas que tengan el mismo talle o color.
- Validación realizada: 70 pruebas aprobadas y build de producción compilado correctamente.


Poder modificar el COlor de los Titulares de las secciones destacadas

Ver una forma de con una nueva RUTA de Banners poder manejar mas facil todo lo que es la estetica de la pagina principal


Tener la capacidad de elegir si registrarse o comprar como INVITADO


En el panel de Pedidos, mostrar el SKU en la tabla pero tambien descargar un PDF con todos los datos completos para imprimir como el PDF de Referencia ✅

Cambios realizados:
- Se agregó el SKU a cada producto mostrado en la tabla del panel de pedidos.
- El detalle del pedido ahora incluye fecha de creación y actualización, estado, pago, correo, tracking, ID de Strapi, total, productos con variante, SKU, IDs y subtotales, dirección completa y gift cards generadas.
- Se incorporó el botón "Descargar / imprimir PDF". Abre el diálogo de impresión del navegador con diseño A4 optimizado para guardar el comprobante como PDF.
- Se agregó un acceso directo con ícono de impresora junto al ojo de "Ver detalles" en cada fila para descargar o imprimir el PDF sin abrir el detalle manualmente.
- El comprobante PDF ahora utiliza el logo oficial de Marybe, la paleta principal y un pie de página con la identificación del pedido.
- Se aplicaron estilos visuales al selector de estado: cada estado tiene color de fondo, borde y texto propio para identificarlo rápidamente.
- Se destacó el SKU en la tabla, detalle y PDF con una etiqueta de color principal para facilitar su identificación operativa.
- Se incluyó un bloque desplegable con todos los datos recibidos desde Strapi para no omitir campos adicionales.
- Se agregaron pruebas de normalización de pedido, dirección, SKU/variante y datos adicionales de Strapi.

Revisar la opcion de pago de Retiro en Sucursal, ya que avanza al PAgo sin elegir sucursal ✅

Cambios realizados: 
- Al elegir Retiro por sucursal aparece un panel adicional con un selector obligatorio. Las opciones usan la misma fuente dinámica de Strapi que la página /sucursales y su respaldo local existente.
- El paso de Envío guarda el método de entrega y la sucursal (dirección, provincia y teléfono) para conservarlos al pasar a Pago o recargar la página. El acceso directo a Pago sin entrega válida vuelve a Envío.
- Se separó la entrega del pago: retirar es gratis tanto con efectivo como con transferencia o Mercado Pago; pagar en efectivo a domicilio conserva el costo de envío y se presenta como pago al recibir.
- Se eliminó el selector estático de sucursales del paso de Pago. El resumen muestra la sucursal elegida y permite volver a modificar la entrega.
- El pedido guarda el método y la sucursal en direccion_envio, visibles también en el detalle administrativo y comprobante. La confirmación de compra distingue retiro de entrega a domicilio.
- El servidor exige una sucursal en pedidos de retiro y recalcula el envío a domicilio desde la configuración, sin interpretarlo como retiro porque el cliente mande costo cero.
- Se corrigió el controlador de Mercado Pago para transmitir envío, método de entrega y descuento de gift card al cálculo de la preferencia.
- Si falla el registro del pedido, se conserva el carrito y se informa el error, sin navegar a una confirmación exitosa.
- Validación automatizada: 81 pruebas de frontend y 4 pruebas de backend aprobadas, incluyendo selección obligatoria, persistencia, efectivo con ambos métodos de entrega, totales y rechazo del servidor.
