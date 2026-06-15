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
    font-size: 2rem;
  }
`;

const Lead = styled.p`
  margin: 0 0 var(--spacing-md);
   font-weight: 500;
   color: #1f1a17;
    font-size: 18px;
`;

const SectionTitle = styled.h2`
  font-size: 25px;
  font-family: inter;
  font-weight: 700;
  color: #1f1a17;
  margin: var(--spacing-xxl) 0 var(--spacing-md);
`;

const Text = styled.p`
  margin: 0 0 var(--spacing-md);
  font-size: 18px;
  font-family: inter;
  color: #1f1a17;
  font-weight: 500;
`;

const Tag = styled.p`
  font-weight: 700;
  color: #1f1a17;
  font-size: 20px;
  margin: 0 0 var(--spacing-sm);
`;

const List = styled.ul`
  margin: 0 0 var(--spacing-md);
  padding-left: 1.4rem;
   font-weight: 500;
   font-size: 18px;

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

export default function MetodoEnvioContent() {
  return (
    <Wrapper>
      <Title>Métodos de envío</Title>

      <Lead>Los productos físicos serán enviados dentro del territorio informado en el Sitio Web.</Lead>
      <Lead>
        Una vez realizada la compra en <Link href={MARYBE} target="_blank" rel="noopener noreferrer">MARYBE</Link>, el usuario recibirá un correo electrónico de confirmación indicando la correcta recepción y preparación del pedido.
      </Lead>
      <Lead>
        Posteriormente, MARYBE SRL se comunicará con el cliente para informarle que el pedido se encuentra listo para su retiro o entrega.
      </Lead>

      <SectionTitle>Retiro en sucursal</SectionTitle>
      <Tag>
        SIN CARGO Sucursales de retiro habilitadas: *Santiago del Estero: Pellegrini 141 *La Banda, SDE: España 99 *Tucumán: Maipu 131
      </Tag>
      <Text>
        Al momento de retirar el pedido, deberá presentarse el titular de la tarjeta utilizada para la compra, exhibiendo:
      </Text>
      <List>
        <li>La tarjeta con la que se realizó el pago.</li>
        <li>Documento Nacional de Identidad (DNI) o documentación que acredite identidad.</li>
        <li>Comprobante de compra.</li>
      </List>

      <SectionTitle>Retiro por terceros</SectionTitle>
      <Text>En caso de que el retiro sea efectuado por un tercero autorizado, éste deberá presentar:</Text>
      <List>
        <li>Comprobante de compra.</li>
        <li>Copia del DNI del titular de la compra.</li>
      </List>
      <Text>
        MARYBE SRL podrá solicitar información adicional para validar la identidad del retirante y garantizar la seguridad de la operación.
      </Text>

      <SectionTitle>Envíos a domicilio</SectionTitle>
      <Tag>
        COSTO A CONVENIR Zonas comprendidas: *Santiago del Estero *La Banda, Santiago del Estero *San Miguel de Tucuman Los pedidos confirmados hasta las 18:00 horas serán entregados dentro del mismo día, sujeto a disponibilidad logística y zona de entrega.
      </Tag>
      <Text>
        Los pedidos ingresados con posterioridad a dicho horario serán procesados y entregados el día hábil siguiente.
      </Text>
      <Text>No se realizan entregas los días domingos.</Text>
      <Text>
        Los plazos de entrega son estimativos y pueden verse afectados por causas ajenas a MARYBE SRL, incluyendo demoras logísticas, condiciones climáticas o situaciones de fuerza mayor.
      </Text>
      <Text>El usuario deberá verificar el estado del paquete al momento de la recepción.</Text>

      <SectionTitle>Envíos a todo el país</SectionTitle>
      <Tag>
        COSTO A CONVENIR Realizamos envíos a todo el país mediante CORREO ARGENTINO. ¡Nos pondremos en contacto con vos! MARYBE SRL realiza envíos a todo el territorio de la República Argentina mediante servicios de logística y correo habilitados.
      </Tag>
      <Text>
        Los costos y tiempos de entrega podrán variar según la localidad de destino, disponibilidad operativa y modalidad de envío seleccionada al momento de la compra.
      </Text>
      <Text>
        Una vez despachado el pedido, el usuario recibirá la información correspondiente para realizar el seguimiento del envío, cuando dicha opción se encuentre disponible.
      </Text>
      <Text>
        MARYBE SRL no será responsable por demoras ocasionadas por terceros prestadores de servicios logísticos, hechos de fuerza mayor o causas ajenas a la empresa.
      </Text>
      <Text>
        En caso de ausencia reiterada en el domicilio informado o imposibilidad de entrega imputable al cliente, el pedido podrá retornar al remitente, quedando los costos de reenvío a cargo del comprador.
      </Text>
    </Wrapper>
  );
}
