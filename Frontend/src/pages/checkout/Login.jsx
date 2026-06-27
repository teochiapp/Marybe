import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';

// Styled Components (Shared with Envio)
const PageContainer = styled.div`
  min-height: 80vh;
  background-color: var(--color-blanco);
  padding: 40px 60px;
  font-family: var(--font-family-secondary, sans-serif);

  @media (max-width: 1024px) {
    padding: 30px 20px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Breadcrumb = styled.div`
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 40px;

  a {
    color: #777;
    text-decoration: none;
    &:hover { color: #333; }
  }
  span {
    margin: 0 8px;
  }
  .active {
    color: #333;
    font-weight: 600;
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto 60px;
  position: relative;
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 1;

  .circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${({ $active, $completed }) => ($active || $completed ? '#5C0A0A' : '#d3d3d3')};
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .label {
    font-size: 0.9rem;
    font-weight: ${({ $active }) => ($active ? '700' : '500')};
    color: ${({ $active, $completed }) => ($active || $completed ? '#5C0A0A' : '#a0a0a0')};
  }
`;

const ProgressLine = styled.div`
  position: absolute;
  top: 16px;
  left: 40px;
  right: 40px;
  height: 1px;
  background-color: #d3d3d3;
  z-index: 0;
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 60px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const SectionTitle = styled.h2`
  font-family: var(--font-family-secondary, sans-serif);
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin-top: 30px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  
  &:first-child {
    margin-top: 0;
  }
`;

// Form Styles
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.full-width {
    grid-column: 1 / -1;
  }

  label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #333;
  }

  input {
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    color: black;
    font-family: var(--font-family-secondary, sans-serif);
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #5C0A0A;
    }
  }
`;

// Order Summary
const SummaryCard = styled.div`
  background-color: #ffffff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0px 8px 24px 0px rgba(0, 0, 0, 0.04);
  font-family: var(--font-family-secondary, sans-serif);
`;

const SummaryTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: black;
  margin-bottom: 25px;
`;

const ProductsPreview = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ProductImagesRow = styled.div`
  display: flex;
  gap: 10px;

  .img-wrapper {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
`;

const EditCartBtn = styled(Link)`
  font-size: 0.85rem;
  color: #555;
  text-decoration: none;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 0.95rem;
  color: #555;

  .val {
    font-weight: 600;
    color: #333;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e0e0e0;
  margin: 20px 0;
`;

const TotalRow = styled(SummaryRow)`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 30px;
  font-weight: 700;

  .val {
    font-size: 1.3rem;
  }
`;

const PrimaryBtn = styled.button`
  width: 100%;
  background-color: #2b0b0a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  font-family: var(--font-family-secondary, sans-serif);

  &:hover {
    background-color: #4a1311;
  }
`;

const formatPrice = (price) => {
  if (!price) return '$0.00';
  return '$ ' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function Login() {
  const { cartItems, cartTotal } = useContext(CartContext);
  const { user, token, openAuthModal } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isEditing = new URLSearchParams(location.search).get('edit') === 'true';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    nombre: user?.username || '',
    apellido: '',
    telefono: '',
    email: user?.email || '',
    calle: '',
    numero: '',
    cp: '',
    ciudad: '',
    provincia: ''
  });

  // Fetch profile when token changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.username || prev.nombre,
        email: user.email || prev.email
      }));
    }

    if (token) {
      const fetchProfile = async () => {
        setIsLoadingProfile(true);
        try {
          const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
          const res = await fetch(`${apiUrl}/api/mi-perfil`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          
          if (json && json.data) {
            const profile = json.data;
            const tieneDireccion = profile.direcciones && profile.direcciones.length > 0;
            const dir = tieneDireccion ? profile.direcciones[0] : {};
            
            // Si tiene datos completos y no viene con flag de edición, redirigimos automáticamente a envío
            if (!isEditing && profile.telefono && tieneDireccion && dir.calle && dir.numero && dir.cp && dir.ciudad && dir.provincia) {
              navigate('/envio');
              return;
            }

            // Si no está completo o estamos editando, rellenamos el formulario con lo que tenga
            setFormData(prev => ({
              ...prev,
              telefono: profile.telefono || prev.telefono,
              calle: dir.calle || prev.calle,
              numero: dir.numero || prev.numero,
              cp: dir.cp || prev.cp,
              ciudad: dir.ciudad || prev.ciudad,
              provincia: dir.provincia || prev.provincia
            }));
          }
        } catch (err) {
          console.error("Error al cargar perfil", err);
        } finally {
          setIsLoadingProfile(false);
        }
      };
      fetchProfile();
    }
  }, [token, user, navigate, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !user) {
      setErrorMsg('Debes iniciar sesión para guardar tus datos.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const apiUrl = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';
      const direccionCompleta = {
        calle: formData.calle,
        numero: formData.numero,
        cp: formData.cp,
        ciudad: formData.ciudad,
        provincia: formData.provincia
      };

      const checkRes = await fetch(`${apiUrl}/api/mi-perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const checkData = await checkRes.json();
      
      const payload = {
        data: {
          telefono: formData.telefono,
          direcciones: [direccionCompleta]
        }
      };

      let res;
      if (checkData.data && checkData.data.length > 0) {
        const clienteId = checkData.data[0].id;
        res = await fetch(`${apiUrl}/api/clientes/${clienteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${apiUrl}/api/mi-perfil`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error?.message || 'Error guardando datos');
      }

      navigate('/envio');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProductImage = (product) => {
    let imgUrl = '/placeholder.png';
    if (product.portada?.data?.attributes?.url) {
      imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${product.portada.data.attributes.url}`;
    } else if (product.portada?.url) {
      imgUrl = `${process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337'}${product.portada.url}`;
    }
    return imgUrl;
  };

  return (
    <PageContainer>
      <ContentWrapper>
        
        <Breadcrumb>
          <Link to="/">Inicio</Link> <span>/</span> <Link to="/carrito">Carrito</Link> <span>/</span> <span className="active">Identificación</span>
        </Breadcrumb>

        {/* Progress Bar */}
        <ProgressContainer>
          <ProgressLine />
          <ProgressStep $active={false} $completed={true}>
            <div className="circle">1</div>
            <div className="label">Carrito</div>
          </ProgressStep>
          <ProgressStep $active={true} $completed={false}>
            <div className="circle">2</div>
            <div className="label">Identificación</div>
          </ProgressStep>
          <ProgressStep $active={false} $completed={false}>
            <div className="circle">3</div>
            <div className="label">Envío</div>
          </ProgressStep>
          <ProgressStep $active={false} $completed={false}>
            <div className="circle">4</div>
            <div className="label">Pago</div>
          </ProgressStep>
        </ProgressContainer>

        <LayoutGrid>
          {/* Formulario de Datos */}
          <div>
            <SectionTitle>Tus Datos</SectionTitle>
            
            {!token ? (
              <div style={{ padding: '30px 0', textAlign: 'center' }}>
                <p style={{ fontSize: '1.05rem', color: '#555', marginBottom: '20px' }}>
                  Para continuar con tu compra, inicia sesión o crea una cuenta rápida.
                </p>
                <PrimaryBtn type="button" onClick={() => openAuthModal('/envio')}>
                  Iniciar Sesión / Registrarse
                </PrimaryBtn>
              </div>
            ) : isLoadingProfile ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: '#666' }}>
                Cargando tus datos...
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <FormGrid>
                  <FormGroup>
                    <label>Nombre</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup>
                    <label>Apellido</label>
                    <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup>
                    <label>Teléfono</label>
                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup>
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required readOnly style={{ backgroundColor: '#f9f9f9', cursor: 'not-allowed' }} />
                  </FormGroup>
                  <FormGroup>
                    <label>Calle</label>
                    <input type="text" name="calle" value={formData.calle} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup>
                    <label>Número / Depto</label>
                    <input type="text" name="numero" value={formData.numero} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup>
                    <label>Código Postal</label>
                    <input type="text" name="cp" value={formData.cp} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup>
                    <label>Ciudad</label>
                    <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} required />
                  </FormGroup>
                  <FormGroup className="full-width">
                    <label>Provincia</label>
                    <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} required />
                  </FormGroup>
                </FormGrid>
                
                {errorMsg && <div style={{ color: '#c0392b', marginTop: '15px', fontSize: '0.9rem', fontWeight: '500' }}>{errorMsg}</div>}

                <div style={{ marginTop: '30px' }}>
                  <PrimaryBtn type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar y volver a Envío' : 'Continuar a Envío')}
                  </PrimaryBtn>
                </div>
              </form>
            )}
          </div>

          {/* Resumen de Pedido */}
          <div>
            <SummaryCard>
              <SummaryTitle>Tu pedido</SummaryTitle>

              <ProductsPreview>
                <ProductImagesRow>
                  {cartItems.slice(0, 4).map((item) => (
                    <div className="img-wrapper" key={item.cartId}>
                      <img src={getProductImage(item.product)} alt={item.product.nombre} />
                    </div>
                  ))}
                  {cartItems.length > 4 && (
                    <div className="img-wrapper" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>
                      +{cartItems.length - 4}
                    </div>
                  )}
                </ProductImagesRow>
                <EditCartBtn to="/carrito">Editar Carrito</EditCartBtn>
              </ProductsPreview>

              <SummaryRow>
                <span>Subtotal</span>
                <span className="val">{formatPrice(cartTotal)}</span>
              </SummaryRow>

              <Divider />

              <TotalRow>
                <span>Total</span>
                <span className="val">{formatPrice(cartTotal)}</span>
              </TotalRow>

            </SummaryCard>
          </div>
        </LayoutGrid>

      </ContentWrapper>
    </PageContainer>
  );
}
