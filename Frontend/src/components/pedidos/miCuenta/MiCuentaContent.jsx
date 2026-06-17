import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { FiUser, FiShoppingBag, FiMapPin, FiHeart, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

const DashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: var(--spacing-xxl);
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    flex-direction: row;
    overflow-x: auto;
    white-space: nowrap;
    
    &::-webkit-scrollbar { display: none; }
  }
`;

const NavItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: ${({ $active }) => ($active ? 'rgba(124, 4, 5, 0.05)' : 'none')};
  color: ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : 'var(--color-marron-secundario)')};
  border: none;
  border-left: 4px solid ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : 'transparent')};
  font-family: var(--font-family-secondary);
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  text-align: left;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background-color: rgba(62, 1, 2, 0.02);
    color: var(--color-bordo-secundario);
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    border-left: none;
    border-bottom: 3px solid ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : 'transparent')};
    padding: 12px 18px;
    flex-shrink: 0;
  }
`;

const MainPanel = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  min-height: 400px;
`;

const SectionTitle = styled.h2`
  font-family: var(--font-family-primary);
  font-size: 1.8rem;
  color: var(--color-marron-principal);
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: 8px;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-rosa-tercero);
`;

const ValueInput = styled.input`
  background-color: var(--color-fondo-beneficio-tarjeta);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 0.95rem;
  color: var(--color-marron-tercero);
  outline: none;

  &:focus {
    border-color: var(--color-bordo-secundario);
  }
`;

const SaveBtn = styled.button`
  background-color: var(--color-marron-principal);
  color: var(--color-blanco);
  font-weight: 600;
  padding: 12px 28px;
  border-radius: var(--radius-md);
  margin-top: var(--spacing-lg);
  align-self: flex-start;
  transition: var(--transition-fast);

  &:hover {
    background-color: var(--color-bordo-secundario);
  }
`;

const OrderCard = styled.div`
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OrderId = styled.span`
  font-weight: 700;
  color: var(--color-marron-principal);
`;

const OrderDate = styled.span`
  font-size: 0.85rem;
  color: #666;
`;

const OrderStatus = styled.span`
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${({ $status }) =>
    $status === 'Entregado' ? '#e8f5e9' : $status === 'En Camino' ? '#e3f2fd' : '#fff8e1'};
  color: ${({ $status }) =>
    $status === 'Entregado' ? '#2e7d32' : $status === 'En Camino' ? '#1565c0' : '#f57f17'};
`;

const OrderTotal = styled.span`
  font-weight: 700;
  color: var(--color-bordo-secundario);
  font-size: 1.1rem;
`;

const AddressCard = styled.div`
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;

export default function MiCuentaContent() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('perfil');
  const [profile, setProfile] = useState({
    nombre: 'Teo Chiappero',
    email: 'teo.chiappero@example.com',
    telefono: '+54 385 4123456',
    nacimiento: '1995-10-24',
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert('¡Cambios guardados con éxito!');
  };

  return (
    <DashboardLayout>
      <NavList>
        <NavItem $active={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')}>
          <FiUser /> Mi Perfil
        </NavItem>
        <NavItem $active={activeTab === 'pedidos'} onClick={() => setActiveTab('pedidos')}>
          <FiShoppingBag /> Mis Pedidos
        </NavItem>
        <NavItem $active={activeTab === 'direcciones'} onClick={() => setActiveTab('direcciones')}>
          <FiMapPin /> Direcciones
        </NavItem>
        <NavItem $active={activeTab === 'favoritos'} onClick={() => setActiveTab('favoritos')}>
          <FiHeart /> Mis Favoritos
        </NavItem>
        <NavItem style={{ color: '#c62828' }} onClick={() => { logout(); navigate('/'); }}>
          <FiLogOut /> Cerrar Sesión
        </NavItem>
      </NavList>

      <MainPanel>
        {activeTab === 'perfil' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <SectionTitle>Datos de Perfil</SectionTitle>
            <ProfileGrid>
              <FieldGroup>
                <Label>Nombre y Apellido</Label>
                <ValueInput
                  type="text"
                  name="nombre"
                  value={profile.nombre}
                  onChange={handleProfileChange}
                />
              </FieldGroup>
              <FieldGroup>
                <Label>Correo electrónico</Label>
                <ValueInput
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                />
              </FieldGroup>
              <FieldGroup>
                <Label>Teléfono</Label>
                <ValueInput
                  type="tel"
                  name="telefono"
                  value={profile.telefono}
                  onChange={handleProfileChange}
                />
              </FieldGroup>
              <FieldGroup>
                <Label>Fecha de nacimiento</Label>
                <ValueInput
                  type="date"
                  name="nacimiento"
                  value={profile.nacimiento}
                  onChange={handleProfileChange}
                />
              </FieldGroup>
            </ProfileGrid>
            <SaveBtn onClick={handleSave}>Guardar Cambios</SaveBtn>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div>
            <SectionTitle>Historial de Pedidos</SectionTitle>
            <OrderCard>
              <OrderInfo>
                <OrderId>Pedido #15843</OrderId>
                <OrderDate>Comprado el 25/05/2026</OrderDate>
              </OrderInfo>
              <OrderStatus $status="Entregado">Entregado</OrderStatus>
              <OrderTotal>$116.760</OrderTotal>
            </OrderCard>

            <OrderCard>
              <OrderInfo>
                <OrderId>Pedido #15629</OrderId>
                <OrderDate>Comprado el 12/04/2026</OrderDate>
              </OrderInfo>
              <OrderStatus $status="Entregado">Entregado</OrderStatus>
              <OrderTotal>$45.890</OrderTotal>
            </OrderCard>

            <OrderCard>
              <OrderInfo>
                <OrderId>Pedido #16012</OrderId>
                <OrderDate>Comprado el 05/06/2026</OrderDate>
              </OrderInfo>
              <OrderStatus $status="En Camino">En Camino</OrderStatus>
              <OrderTotal>$23.400</OrderTotal>
            </OrderCard>
          </div>
        )}

        {activeTab === 'direcciones' && (
          <div>
            <SectionTitle>Direcciones de Entrega</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <AddressCard>
                <div style={{ fontWeight: 700 }}>Domicilio Particular (Principal)</div>
                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                  Av. Belgrano 1245, Piso 4 B<br />
                  Santiago del Estero (CP 4200)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888', marginTop: 10 }}>Editar | Eliminar</div>
              </AddressCard>

              <AddressCard>
                <div style={{ fontWeight: 700 }}>Oficina Trabajo</div>
                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                  Libertad 340, Local 12<br />
                  Tucumán (CP 4000)
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888', marginTop: 10 }}>Editar | Eliminar</div>
              </AddressCard>
            </div>
            <SaveBtn style={{ marginTop: '24px' }}>Agregar Nueva Dirección</SaveBtn>
          </div>
        )}

        {activeTab === 'favoritos' && (
          <div>
            <SectionTitle>Mis Productos Favoritos</SectionTitle>
            <p style={{ color: '#666', fontSize: '0.95rem' }}>No tenés productos guardados en tu lista de favoritos todavía.</p>
          </div>
        )}
      </MainPanel>
    </DashboardLayout>
  );
}
