import React from 'react';
import styled from 'styled-components';

const DocumentLayout = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: var(--spacing-xxl);
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
`;

const Sidebar = styled.nav`
  position: sticky;
  top: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-left: 2px solid rgba(62, 1, 2, 0.1);
  padding-left: var(--spacing-md);

  @media (max-width: 768px) {
    position: static;
    border-left: none;
    border-bottom: 2px solid rgba(62, 1, 2, 0.1);
    padding-left: 0;
    padding-bottom: var(--spacing-md);
    flex-direction: row;
    overflow-x: auto;
    white-space: nowrap;
    
    &::-webkit-scrollbar { display: none; }
  }
`;

const SidebarLink = styled.a`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-marron-secundario);
  opacity: 0.7;
  transition: var(--transition-fast);

  &:hover {
    opacity: 1;
    color: var(--color-bordo-secundario);
    transform: translateX(2px);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    background-color: var(--color-blanco);
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: var(--radius-sm);
    
    &:hover {
      transform: none;
    }
  }
`;

const DocContent = styled.article`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  color: #4a4a4a;
  line-height: 1.7;

  h2 {
    font-family: var(--font-family-secondary);
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--color-marron-principal);
    margin-top: var(--spacing-md);
    border-bottom: 1px solid rgba(62, 1, 2, 0.05);
    padding-bottom: 8px;
  }

  p {
    color: #4a4a4a;
    margin-bottom: var(--spacing-md);
  }

  ul {
    margin-left: var(--spacing-lg);
    margin-bottom: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

export default function TerminosCondicionesContent() {
  return (
    <DocumentLayout>
      <Sidebar>
        <SidebarLink href="#introduccion">1. Introducción</SidebarLink>
        <SidebarLink href="#registro">2. Registro de Usuario</SidebarLink>
        <SidebarLink href="#precios">3. Precios y Stock</SidebarLink>
        <SidebarLink href="#envios">4. Envíos y Entregas</SidebarLink>
        <SidebarLink href="#cambios">5. Cambios y Revocación</SidebarLink>
        <SidebarLink href="#propiedad">6. Propiedad Intelectual</SidebarLink>
      </Sidebar>

      <DocContent>
        <p>
          Última actualización: 7 de Junio de 2026. Por favor, lea atentamente estos términos y condiciones antes de utilizar nuestro sitio web y realizar compras en línea.
        </p>

        <h2 id="introduccion">1. Introducción</h2>
        <p>
          El presente contrato describe los términos y condiciones generales aplicables al uso de los servicios ofrecidos por Marybe S.A. dentro del sitio web. Cualquier persona que desee acceder o usar el sitio o los servicios podrá hacerlo sujetándose a los Términos y Condiciones Generales, junto con todas las demás políticas y principios que rigen a Marybe S.A.
        </p>
        <p>
          Cualquier persona que no acepte estos términos y condiciones generales, los cuales tienen un carácter obligatorio y vinculante, deberá abstenerse de utilizar el sitio y/o los servicios.
        </p>

        <h2 id="registro">2. Registro de Usuario</h2>
        <p>
          Para realizar compras a través de la plataforma, el usuario puede registrarse o realizar la compra como invitado. En caso de registro:
        </p>
        <ul>
          <li>El usuario se compromete a proporcionar información personal exacta, precisa y verdadera.</li>
          <li>El usuario es responsable de mantener la confidencialidad de su cuenta y contraseña.</li>
          <li>Marybe S.A. se reserva el derecho de rechazar cualquier solicitud de registro o de cancelar un registro previamente aceptado sin previo aviso.</li>
        </ul>

        <h2 id="precios">3. Precios y Stock</h2>
        <p>
          Todos los precios publicados en el sitio web están expresados en pesos argentinos e incluyen el Impuesto al Valor Agregado (IVA), a menos que se especifique lo contrario.
        </p>
        <p>
          La disponibilidad de los productos ofrecidos en el sitio está sujeta al stock diario disponible. En el caso de que se realice una compra y por cuestiones de stock no se pueda entregar el artículo, Marybe S.A. se comunicará inmediatamente con el cliente para ofrecer un reemplazo o gestionar la devolución total del importe cobrado.
        </p>

        <h2 id="envios">4. Envíos y Entregas</h2>
        <p>
          Los envíos serán entregados a través de las empresas de logística asociadas en los tiempos informados al momento de la confirmación de la compra. Las entregas se efectúan de lunes a viernes (excepto feriados) en horario comercial estándar.
        </p>
        <p>
          Es responsabilidad del usuario ingresar de manera exacta la dirección de entrega. Si el paquete no pudiera entregarse por causas ajenas a Marybe S.A., los costos de re-envío correrán por cuenta del comprador.
        </p>

        <h2 id="cambios">5. Cambios y Revocación</h2>
        <p>
          De acuerdo con la legislación vigente en la República Argentina:
        </p>
        <ul>
          <li>Los usuarios tienen derecho a cambiar los productos dentro de los 30 días corridos de la recepción, conservando el envoltorio original sellado y sin usar.</li>
          <li>Derecho de Revocación (Botón de arrepentimiento): El consumidor tiene el derecho legal de revocar la aceptación del contrato de compra dentro de los 10 días corridos a partir de la entrega del producto sin penalización alguna. El producto debe devolverse sin uso y en su empaque original.</li>
        </ul>

        <h2 id="propiedad">6. Propiedad Intelectual</h2>
        <p>
          Los contenidos de las pantallas relativas a los servicios de Marybe como así también los programas, bases de datos, redes, archivos que permiten al usuario acceder y usar su cuenta, son propiedad de Marybe S.A. y están protegidas por las leyes y los tratados internacionales de derecho de autor, marcas, patentes, modelos y diseños industriales. El uso indebido y la reproducción total o parcial de dichos contenidos quedan prohibidos, salvo autorización expresa y por escrito de Marybe S.A.
        </p>
      </DocContent>
    </DocumentLayout>
  );
}
