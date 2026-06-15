import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xxl) var(--spacing-xl) 5rem;
  color: #3a322c;
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;
  line-height: 1.7;

  @media (max-width: 600px) {
    padding: var(--spacing-xl) var(--spacing-md) 3rem;
  }
`;

const Title = styled.h1`
  font-family: var(--font-family-primary);
  font-style: italic;
  font-weight: 600;
  
  font-size: 2.6rem;
  color: #1f1a17;
  margin: 0 0 var(--spacing-xl);

  @media (max-width: 600px) {
    font-size: 2.5rem;
  }
`;

const Lead = styled.p`
  margin: 0 0 var(--spacing-md);
  color: #280101;
  font-size: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
  font-family: inter;
  color: #280101;
  margin: var(--spacing-xxl) 0 var(--spacing-md);
`;

const SubTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  font-family: inter;
  color: #280101;
  margin: var(--spacing-lg) 0 var(--spacing-sm);
`;

const Text = styled.p`
  margin: 0 0 var(--spacing-md);
  color: #280101;
  font-size: 20px;
`;

const List = styled.ul`
  margin: 0 0 var(--spacing-md);
  padding-left: 1.4rem;
  font-size: 20px;

  li {
    margin-bottom: 6px;
  }
`;

const Link = styled.a`
  color: #1f1a17;
  text-decoration: underline;

  &:hover {
    color: var(--color-bordo-secundario);
  }
`;

const MARYBE = 'https://www.marybe.com.ar';

export default function TerminosCondicionesContent() {
  return (
    <Wrapper>
      <Title>Términos y condiciones</Title>

      <Lead>
        Bienvenido/a a <Link href={MARYBE} target="_blank" rel="noopener noreferrer">MARYBE</Link> (en adelante, el “Sitio Web”), titularidad de MARYBE SRL (en adelante, “MARYBE”, “la Empresa” o “nosotros”). Los presentes Términos y Condiciones regulan el acceso, navegación, uso del Sitio Web y la adquisición de productos físicos, productos digitales y/o servicios ofrecidos por MARYBE.
      </Lead>
      <Lead>
        El acceso y utilización del Sitio Web implica la aceptación plena y sin reservas de estos Términos y Condiciones.
      </Lead>

      <SectionTitle>1. IDENTIFICACIÓN DEL TITULAR</SectionTitle>
      <Text>
        Razón Social: MARYBE SRL<br />
        CUIT: 30686646595<br />
        Domicilio legal: Pellegrini 141, Santiago del Estero, Argentina<br />
        Correo electrónico: pelle.marybe@gmail.com<br />
        Sitio Web: <Link href={MARYBE} target="_blank" rel="noopener noreferrer">www.marybe.com.ar</Link>
      </Text>

      <SectionTitle>2. CAPACIDAD LEGAL</SectionTitle>
      <Text>
        Los productos y servicios ofrecidos en el Sitio Web están disponibles únicamente para personas con capacidad legal para contratar conforme a las leyes de la República Argentina.
      </Text>
      <Text>Los menores de edad deberán actuar a través de sus representantes legales.</Text>

      <SectionTitle>3. ACEPTACIÓN DE LOS TÉRMINOS</SectionTitle>
      <Text>
        La utilización del Sitio Web implica el conocimiento y aceptación de los presentes Términos y Condiciones.
      </Text>
      <Text>
        MARYBE SRL podrá modificar estos términos en cualquier momento, siendo responsabilidad del usuario revisarlos periódicamente.
      </Text>

      <SectionTitle>4. PRODUCTOS Y SERVICIOS</SectionTitle>
      <Text>MARYBE SRL comercializa:</Text>
      <List>
        <li>Productos físicos</li>
        <li>Productos digitales</li>
        <li>Servicios</li>
      </List>
      <Text>
        Las imágenes, fotografías y descripciones publicadas son ilustrativas y pueden presentar variaciones menores respecto del producto o servicio final.
      </Text>
      <Text>La disponibilidad está sujeta a stock y/o capacidad operativa.</Text>
      <Text>
        MARYBE SRL podrá modificar, discontinuar o actualizar productos, servicios y precios sin previo aviso.
      </Text>

      <SectionTitle>5. PRECIOS</SectionTitle>
      <Text>
        Todos los precios se encuentran expresados en pesos argentinos (ARS), salvo indicación en contrario.
      </Text>
      <Text>
        Los precios pueden ser modificados sin previo aviso, aunque los cambios no afectarán operaciones ya confirmadas.
      </Text>

      <SectionTitle>6. MEDIOS DE PAGO</SectionTitle>
      <Text>El usuario podrá abonar mediante los medios de pago habilitados en el Sitio Web.</Text>
      <Text>
        Las operaciones estarán sujetas a validaciones y autorizaciones por parte de las entidades financieras y plataformas de pago intervinientes.
      </Text>
      <Text>
        MARYBE SRL no será responsable por rechazos, demoras o inconvenientes ocasionados por terceros proveedores de pago.
      </Text>

      <SectionTitle>7. ENVÍOS Y ENTREGAS</SectionTitle>
      <Text>Los productos físicos serán enviados dentro del territorio informado en el Sitio Web.</Text>
      <Text>
        Una vez realizada la compra en <Link href={MARYBE} target="_blank" rel="noopener noreferrer">MARYBE</Link>, el usuario recibirá un correo electrónico de confirmación indicando la correcta recepción y preparación del pedido.
      </Text>
      <Text>
        Posteriormente, MARYBE SRL se comunicará con el cliente para informarle que el pedido se encuentra listo para su retiro o entrega.
      </Text>

      <SubTitle>Retiro en sucursal</SubTitle>
      <Text>
        Al momento de retirar el pedido, deberá presentarse el titular de la tarjeta utilizada para la compra, exhibiendo:
      </Text>
      <List>
        <li>La tarjeta con la que se realizó el pago.</li>
        <li>Documento Nacional de Identidad (DNI) o documentación que acredite identidad.</li>
        <li>Comprobante de compra.</li>
      </List>

      <SubTitle>Retiro por terceros</SubTitle>
      <Text>En caso de que el retiro sea efectuado por un tercero autorizado, éste deberá presentar:</Text>
      <List>
        <li>Comprobante de compra.</li>
        <li>Copia del DNI del titular de la compra.</li>
      </List>
      <Text>
        MARYBE SRL podrá solicitar información adicional para validar la identidad del retirante y garantizar la seguridad de la operación.
      </Text>

      <SubTitle>Envíos a domicilio</SubTitle>
      <Text>
        Los pedidos confirmados hasta las 18:00 horas serán entregados dentro del mismo día, sujeto a disponibilidad logística y zona de entrega.
      </Text>
      <Text>
        Los pedidos ingresados con posterioridad a dicho horario serán procesados y entregados el día hábil siguiente.
      </Text>
      <Text>No se realizan entregas los días domingos.</Text>
      <Text>
        Los plazos de entrega son estimativos y pueden verse afectados por causas ajenas a MARYBE SRL, incluyendo demoras logísticas, condiciones climáticas o situaciones de fuerza mayor.
      </Text>
      <Text>El usuario deberá verificar el estado del paquete al momento de la recepción.</Text>

      <SubTitle>Varios</SubTitle>
      <Text>El mínimo de compra es de 1 producto.</Text>
      <Text>Los pedidos no podrán ser entregado a menores de edad.</Text>
      <Text>
        La entrega de regalos por compra ofrecidos en la tienda online se encuentra sujeta a disponibilidad de stock. Las imágenes de los regalos por compra y colores atribuidos a ellos son meramente ilustrativos y orientativos, así como también, pueden variar dependiendo del stock disponible.
      </Text>

      <SectionTitle>8. CAMBIOS, DEVOLUCIONES Y DERECHO DE ARREPENTIMIENTO</SectionTitle>
      <Text>Para solicitar cambios o devoluciones, el usuario deberá comunicarse a:</Text>
      <Text>Email: pelle.marybe@gmail.com</Text>
      <Text>Los productos deberán encontrarse:</Text>
      <List>
        <li>Sin uso</li>
        <li>En perfecto estado</li>
        <li>Con etiquetas y embalaje original</li>
        <li>Deberá encontrarse en igual estado al del momento de la venta</li>
        <li>Conservar el envase</li>
        <li>Celofán protector</li>
        <li>Etiquetas originales de importación</li>
        <li>Presentar el ticket de compra.</li>
      </List>
      <Text>No tendrán cambio ni devolución:</Text>
      <List>
        <li>Productos personalizados</li>
        <li>Productos digitales ya descargados o utilizados</li>
        <li>Productos dañados por mal uso del cliente</li>
        <li>Servicios ya prestados o ejecutados</li>
        <li>Productos donde no se puede verificar la modificación de su contenido no podrán ser cambiados.</li>
      </List>
      <Text>
        En caso de corresponder devolución de dinero, la misma se realizará por el mismo medio de pago utilizado en la compra.
      </Text>

      <SectionTitle>9. PROPIEDAD INTELECTUAL</SectionTitle>
      <Text>
        Todo el contenido del Sitio Web, incluyendo textos, imágenes, diseños, logos, marcas y material audiovisual, es propiedad de MARYBE SRL o cuenta con autorización de uso.
      </Text>
      <Text>Queda prohibida su reproducción total o parcial sin autorización expresa y por escrito.</Text>

      <SectionTitle>10. USO PROHIBIDO DEL SITIO</SectionTitle>
      <Text>El usuario se compromete a no:</Text>
      <List>
        <li>Utilizar el Sitio Web para fines ilícitos</li>
        <li>Introducir malware o virus</li>
        <li>Vulnerar medidas de seguridad</li>
        <li>Realizar fraudes</li>
        <li>Publicar contenido ofensivo, ilegal o discriminatorio</li>
      </List>
      <Text>MARYBE SRL podrá bloquear o suspender usuarios que incumplan estas condiciones.</Text>

      <SectionTitle>11. LIMITACIÓN DE RESPONSABILIDAD</SectionTitle>
      <Text>MARYBE SRL no garantiza el funcionamiento ininterrumpido del Sitio Web.</Text>
      <Text>En ningún caso será responsable por:</Text>
      <List>
        <li>Daños indirectos</li>
        <li>Pérdidas económicas</li>
        <li>Lucro cesante</li>
        <li>Interrupciones técnicas</li>
        <li>Errores atribuibles a terceros</li>
      </List>
      <Text>
        La responsabilidad máxima de MARYBE SRL se limitará al monto efectivamente abonado por el usuario.
      </Text>

      <SectionTitle>12. PROTECCIÓN DE DATOS PERSONALES</SectionTitle>
      <Text>
        MARYBE SRL tratará los datos personales conforme a la Ley 25.326 de Protección de Datos Personales.
      </Text>
      <Text>Los datos recopilados serán utilizados para:</Text>
      <List>
        <li>Procesar compras</li>
        <li>Gestionar envíos</li>
        <li>Brindar soporte</li>
        <li>Enviar comunicaciones comerciales cuando exista consentimiento</li>
      </List>
      <Text>
        El usuario podrá ejercer sus derechos de acceso, rectificación o supresión escribiendo a: pelle.marybe@gmail.com
      </Text>
      <Text>La Agencia de Acceso a la Información Pública es el órgano de control de la Ley 25.326.</Text>

      <SectionTitle>13. COOKIES</SectionTitle>
      <Text>El Sitio Web podrá utilizar cookies para mejorar la experiencia del usuario.</Text>
      <Text>
        El usuario podrá configurar su navegador para rechazar cookies, aunque ello podría afectar algunas funcionalidades del sitio.
      </Text>

      <SectionTitle>14. ENLACES A TERCEROS</SectionTitle>
      <Text>El Sitio Web puede contener enlaces a sitios de terceros.</Text>
      <Text>
        MARYBE SRL no será responsable por contenidos, políticas o prácticas de dichos sitios externos.
      </Text>

      <SectionTitle>15. JURISDICCIÓN Y LEY APLICABLE</SectionTitle>
      <Text>Los presentes Términos y Condiciones se rigen por las leyes de la República Argentina.</Text>
    </Wrapper>
  );
}
