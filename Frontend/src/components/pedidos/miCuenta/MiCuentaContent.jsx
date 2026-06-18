import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { FiUser, FiShoppingBag, FiHeart, FiLogOut, FiTrash2, FiTruck, FiEdit2, FiChevronDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const DashboardLayout = styled.div`
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: var(--spacing-xl);
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 72px 1fr;
    gap: var(--spacing-lg);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
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

  @media (max-width: 500px) {
    flex-direction: row;
    justify-content: space-around;
  }
`;

const NavLabel = styled.span`
  @media (max-width: 1200px) {
    display: none;
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

  @media (max-width: 1200px) {
    justify-content: center;
    gap: 0;
    padding: 16px 0;
    border-left-width: 3px;
  }

  @media (max-width: 500px) {
    flex: 1;
    padding: 14px 0;
    border-left: none;
    border-bottom: 3px solid ${({ $active }) => ($active ? 'var(--color-bordo-secundario)' : 'transparent')};
  }
`;

const MainPanel = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  min-height: 400px;

  @media (max-width: 600px) {
    padding: var(--spacing-lg) var(--spacing-md);
  }
`;

const SectionTitle = styled.h2`
  font-family: var(--font-family-primary);
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-marron-principal);
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding-bottom: 8px;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);

  @media (max-width: 768px) {
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
  color: #280c0c;
`;

const ValueInput = styled.input`
  background-color: var(--color-fondo-beneficio-tarjeta);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 0.95rem;
  color: var(--color-marron-tercero);
  outline: none;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #3E0102;
  }

  &:focus,
  &:focus-visible {
    border-color: #3E0102;
    outline: none;
  }

  &:-webkit-autofill {
    box-shadow: 0 0 0 1000px var(--color-fondo-beneficio-tarjeta) inset;
    -webkit-text-fill-color: var(--color-marron-tercero);
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


/* ---- Lista estilo "Mis Pedidos" (como la imagen) ---- */
const ListHeader = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-family-primary);
  font-size: 1.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;

  svg {
    width: 26px;
    height: 26px;
    color: #1a1a1a;
  }

  @media (max-width: 600px) {
    font-size: 1.4rem;

    svg {
      width: 22px;
      height: 22px;
    }
  }
`;

const ListDivider = styled.hr`
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin: var(--spacing-lg) 0 var(--spacing-lg);
`;

const WishRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  &:last-child {
    border-bottom: none;
  }
  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`;

const WishThumb = styled.div`
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  border-radius: 12px;
  background-color: #f3f3f3;
  background-image: url('/isologo.png');
  background-size: 46px;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
`;

const WishMeta = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;

  span {
    white-space: nowrap;
  }

  @media (max-width: 1200px) {
    min-width: 0;
    width: 100%;
    align-items: center;
    text-align: center;

    span {
      white-space: normal;
    }
  }
`;

const WishName = styled.span`
  font-family: var(--font-family-secondary);
  font-weight: 600;
  font-size: 1rem;
  color: #1a1a1a;
`;

const WishDate = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 0.8rem;
  color: #8a8a8a;
`;

const WishActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);

  @media (max-width: 1200px) {
    width: 100%;
    max-width: 360px;
    margin: 0 auto;
    justify-content: space-between;
    gap: var(--spacing-md);
  }
`;

const WishPrice = styled.span`
  font-family: var(--font-family-secondary);
  font-weight: 600;
  font-size: 1rem;
  color: #1a1a1a;
  white-space: nowrap;
`;

const CartBtn = styled.button`
  font-family: var(--font-family-secondary);
  font-size: 0.92rem;
  font-weight: 500;
  color: #1a1a1a;
  background-color: var(--color-blanco);
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding: 11px 18px;
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition-fast);

  &:hover {
    border-color: var(--color-bordo-secundario);
    color: var(--color-bordo-secundario);
  }
`;

const DeleteBtn = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  cursor: pointer;
  color: #555;
  transition: var(--transition-fast);

  &:hover {
    background-color: #fdecec;
    border-color: #e0a0a0;
    color: #c62828;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const pedidosItems = [
  { nombre: 'Neutros Esenciales', fecha: '27 de Julio de 2023', precio: '$22.00' },
  { nombre: 'Eau de Parfum Floral', fecha: '12 de Abril de 2024', precio: '$48.00' },
  { nombre: 'Set de Regalo Premium', fecha: '05 de Junio de 2026', precio: '$75.00' },
];

const OrderPriceMini = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-top: 2px;
`;

const OrderStatusLink = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
  white-space: nowrap;
  color: ${({ $estado }) => ($estado === 'Completado' ? '#2e7d32' : '#1a1a1a')};
`;

const pedidosData = [
  { nombre: 'Línea de camisetas negras crudas', fecha: '27 de Julio de 2023', precio: '$70.00', estado: 'En proceso' },
  { nombre: 'Guardarropa monocromático', fecha: '9 de Marzo de 2023', precio: '$27.00', estado: 'Completado' },
];

/* ---- Dirección (como la imagen) ---- */
const SavedCard = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 14px;
  padding: var(--spacing-lg) var(--spacing-xl);
`;

const SavedRadio = styled.input`
  width: 18px;
  height: 18px;
  accent-color: var(--color-bordo-secundario);
  flex-shrink: 0;
  cursor: pointer;
`;

const SavedInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SavedTitle = styled.span`
  font-family: var(--font-family-secondary);
  font-weight: 600;
  font-size: 0.98rem;
  color: #1a1a1a;
`;

const SavedDetail = styled.span`
  font-family: var(--font-family-secondary);
  font-size: 0.85rem;
  color: #8a8a8a;
`;

const CardIcons = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  color: #555;

  svg {
    width: 18px;
    height: 18px;
    cursor: pointer;
    transition: var(--transition-fast);
  }

  svg:hover {
    color: var(--color-bordo-secundario);
  }
`;

const AddNewHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: var(--spacing-xxl) 0 var(--spacing-lg);
  font-family: var(--font-family-secondary);
  font-weight: 600;
  font-size: 1.05rem;
  color: #1a1a1a;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: var(--transition-fast);

  &:hover {
    color: var(--color-bordo-secundario);
  }

  svg {
    width: 20px;
    height: 20px;
    color: #555;
    transition: transform 0.3s ease, color 0.2s ease;
    transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
  }

  &:hover svg {
    color: var(--color-bordo-secundario);
  }
`;

const FormCollapse = styled(motion.div)`
  overflow: hidden;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RoundedInput = styled.input`
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.18);
  border-radius: 12px;
  padding: 16px 18px;
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;
  color: var(--color-marron-tercero);
  outline: none;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: #b3b3b3;
  }

  &:hover {
    border-color: #3E0102;
  }

  &:focus,
  &:focus-visible {
    border-color: #3E0102;
    outline: none;
  }

  &:-webkit-autofill {
    box-shadow: 0 0 0 1000px var(--color-blanco) inset;
    -webkit-text-fill-color: var(--color-marron-tercero);
  }
`;

const SaveRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
`;

const SaveDark = styled.button`
  background-color: #3e0102;
  color: var(--color-blanco);
  font-family: var(--font-family-secondary);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 13px 32px;
  border-radius: 10px;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    opacity: 0.9;
  }
`;

/* ---- Modal confirmar cerrar sesión ---- */
const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
`;

const ModalCard = styled(motion.div)`
  background-color: var(--color-blanco);
  border-radius: 18px;
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 380px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  text-align: center;
`;

const ModalIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  background-color: rgba(62, 1, 2, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-bordo-secundario);

  svg {
    width: 27px;
    height: 27px;
  }
`;

const ModalTitle = styled.h3`
  font-family: var(--font-family-primary);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-marron-principal);
  margin: 0 0 8px;
`;

const ModalText = styled.p`
  font-family: var(--font-family-secondary);
  font-size: 0.95rem;
  color: #6a6a6a;
  margin: 0 0 var(--spacing-xl);
`;

const ModalActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
`;

const CancelBtn = styled.button`
  flex: 1;
  font-family: var(--font-family-secondary);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 12px 0;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  background-color: var(--color-blanco);
  color: #1a1a1a;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    border-color: #3e0102;
    color: #3e0102;
  }
`;

const ConfirmBtn = styled.button`
  flex: 1;
  font-family: var(--font-family-secondary);
  font-weight: 600;
  font-size: 0.95rem;
  padding: 12px 0;
  border-radius: 10px;
  background-color: #3e0102;
  color: var(--color-blanco);
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background-color: var(--color-bordo-secundario);
  }
`;

export default function MiCuentaContent() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('perfil');
  const [showAddressForm, setShowAddressForm] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState({
    nombre: '',
    email: '',
    telefono: '',
    nacimiento: '',
  });
  const [direcciones, setDirecciones] = useState([]);

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
          const res = await fetch(`${apiUrl}/api/mi-perfil`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          
          if (json && json.data) {
            const data = json.data;
            setProfile({
              nombre: user?.username || '',
              email: user?.email || '',
              telefono: data.telefono || '',
              nacimiento: data.nacimiento || '',
            });
            setDirecciones(data.direcciones || []);
          } else if (user) {
            setProfile(prev => ({
              ...prev,
              nombre: user.username || '',
              email: user.email || ''
            }));
          }
        } catch (error) {
          console.error("Error fetching profile data", error);
        }
      };
      fetchData();
    }
  }, [token, user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Aquí idealmente haríamos un PUT/POST a la API para actualizar el perfil
    alert('¡Cambios guardados localmente! (Integración de guardado pendiente)');
  };

  return (
    <DashboardLayout>
      <NavList>
        <NavItem $active={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')}>
          <FiUser /> <NavLabel>Mi Perfil</NavLabel>
        </NavItem>
        <NavItem $active={activeTab === 'pedidos'} onClick={() => setActiveTab('pedidos')}>
          <FiShoppingBag /> <NavLabel>Mis Pedidos</NavLabel>
        </NavItem>
        <NavItem $active={activeTab === 'direcciones'} onClick={() => setActiveTab('direcciones')}>
          <FiTruck /> <NavLabel>Dirección</NavLabel>
        </NavItem>
        <NavItem $active={activeTab === 'favoritos'} onClick={() => setActiveTab('favoritos')}>
          <FiHeart /> <NavLabel>Mis Favoritos</NavLabel>
        </NavItem>
        <NavItem style={{ color: '#c62828' }} onClick={() => setShowLogoutModal(true)}>
          <FiLogOut /> <NavLabel>Cerrar Sesión</NavLabel>
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
            <SaveBtn onClick={handleSave}>Guardar</SaveBtn>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div>
            <ListHeader>
              <FiShoppingBag /> Mis Pedidos
            </ListHeader>
            <ListDivider />
            {pedidosData.map((item, idx) => (
              <WishRow key={idx}>
                <WishThumb />
                <WishMeta>
                  <WishName>{item.nombre}</WishName>
                  <WishDate>Pedido el: {item.fecha}</WishDate>
                  <OrderPriceMini>{item.precio}</OrderPriceMini>
                </WishMeta>
                <WishActions>
                  <OrderStatusLink $estado={item.estado}>{item.estado}</OrderStatusLink>
                  <CartBtn>Ver artículo</CartBtn>
                </WishActions>
              </WishRow>
            ))}
          </div>
        )}

        {activeTab === 'direcciones' && (
          <div>
            <ListHeader>
              <FiTruck /> Dirección
            </ListHeader>
            <ListDivider />

            {direcciones.length > 0 ? (
              direcciones.map((dir, idx) => (
                <SavedCard key={idx} style={{ marginBottom: 'var(--spacing-md)' }}>
                  <SavedRadio type="radio" name="direccion" defaultChecked={idx === 0} />
                  <SavedInfo>
                    <SavedTitle>{idx === 0 ? 'Dirección Guardada' : `Dirección ${idx + 1}`}</SavedTitle>
                    <SavedDetail>
                      {dir.calle} {dir.numero}{dir.piso_depto ? `, ${dir.piso_depto}` : ''}, {dir.ciudad}, {dir.provincia}{dir.cp ? `, CP ${dir.cp}` : ''}
                    </SavedDetail>
                  </SavedInfo>
                  <CardIcons>
                    <FiEdit2 />
                    <FiTrash2 />
                  </CardIcons>
                </SavedCard>
              ))
            ) : (
              <SavedCard>
                <SavedRadio type="radio" name="direccion" defaultChecked />
                <SavedInfo>
                  <SavedTitle>Dirección Guardada</SavedTitle>
                  <SavedDetail>Av. Dirección 1234, Ciudad, Provincia, CP 0000</SavedDetail>
                </SavedInfo>
                <CardIcons>
                  <FiEdit2 />
                  <FiTrash2 />
                </CardIcons>
              </SavedCard>
            )}

            <AddNewHeader
              type="button"
              $open={showAddressForm}
              onClick={() => setShowAddressForm((v) => !v)}
              aria-expanded={showAddressForm}
            >
              Agregar nueva dirección
              <FiChevronDown />
            </AddNewHeader>

            <AnimatePresence initial={false}>
              {showAddressForm && (
                <FormCollapse
                  key="address-form"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] },
                    opacity: { duration: 0.25 },
                  }}
                >
                  <FormGrid>
                    <RoundedInput type="text" placeholder="Dirección" />
                    <RoundedInput type="text" placeholder="Número / Departamento" />
                    <RoundedInput type="text" placeholder="Provincia" />
                    <RoundedInput type="text" placeholder="Ciudad" />
                    <RoundedInput type="text" placeholder="País" />
                    <RoundedInput type="text" placeholder="Código postal" />
                  </FormGrid>

                  <SaveRow>
                    <SaveDark onClick={handleSave}>Guardar</SaveDark>
                  </SaveRow>
                </FormCollapse>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'favoritos' && (
          <div>
            <ListHeader>
              <FiHeart /> Lista de deseos
            </ListHeader>
            <ListDivider />
            {pedidosItems.map((item, idx) => (
              <WishRow key={idx}>
                <WishThumb />
                <WishMeta>
                  <WishName>{item.nombre}</WishName>
                  <WishDate>Agregado el: {item.fecha}</WishDate>
                </WishMeta>
                <WishActions>
                  <WishPrice>{item.precio}</WishPrice>
                  <CartBtn>Agregar al carrito</CartBtn>
                  <DeleteBtn aria-label="Eliminar">
                    <FiTrash2 />
                  </DeleteBtn>
                </WishActions>
              </WishRow>
            ))}
          </div>
        )}
      </MainPanel>

      {createPortal(
        <AnimatePresence>
          {showLogoutModal && (
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowLogoutModal(false)}
            >
              <ModalCard
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              >
                <ModalIcon>
                  <FiLogOut />
                </ModalIcon>
                <ModalTitle>¿Cerrar sesión?</ModalTitle>
                <ModalText>¿Estás seguro de que querés cerrar tu sesión?</ModalText>
                <ModalActions>
                  <CancelBtn onClick={() => setShowLogoutModal(false)}>Cancelar</CancelBtn>
                  <ConfirmBtn onClick={() => { setShowLogoutModal(false); logout(); navigate('/'); }}>
                    Cerrar sesión
                  </ConfirmBtn>
                </ModalActions>
              </ModalCard>
            </Overlay>
          )}
        </AnimatePresence>,
        document.body
      )}
    </DashboardLayout>
  );
}
