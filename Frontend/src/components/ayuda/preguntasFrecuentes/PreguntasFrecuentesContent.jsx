import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiTruck, FiCreditCard, FiUser, FiRotateCcw } from 'react-icons/fi';

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.15);
  border-radius: var(--radius-xl);
  padding: 14px var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-fast);

  &:focus-within {
    border-color: var(--color-bordo-secundario);
    box-shadow: var(--shadow-md);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--color-marron-tercero);
  padding-left: 10px;

  &::placeholder {
    color: var(--color-rosa-tercero);
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CategoryCard = styled.button`
  background-color: ${({ $active }) => ($active ? 'var(--color-marron-principal)' : 'var(--color-blanco)')};
  color: ${({ $active }) => ($active ? 'var(--color-blanco)' : 'var(--color-marron-secundario)')};
  border: 1px solid rgba(62, 1, 2, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-sm);

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-bordo-secundario);
  }

  svg {
    width: 28px;
    height: 28px;
    color: ${({ $active }) => ($active ? 'var(--color-titulo-marybe)' : 'var(--color-bordo-secundario)')};
  }

  span {
    font-weight: 600;
    font-size: 0.95rem;
  }
`;

const AccordionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const AccordionItem = styled.div`
  background-color: var(--color-blanco);
  border: 1px solid rgba(62, 1, 2, 0.08);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const AccordionHeader = styled.button`
  width: 100%;
  padding: var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-family-secondary);
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--color-marron-tercero);
  transition: var(--transition-fast);

  &:hover {
    color: var(--color-bordo-secundario);
  }
`;

const AccordionChevron = styled.span`
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0)')};
  color: var(--color-bordo-secundario);
`;

const AccordionContent = styled.div`
  max-height: ${({ $open }) => ($open ? '500px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
  padding: ${({ $open }) => ($open ? '0 var(--spacing-lg) var(--spacing-lg) var(--spacing-lg)' : '0 var(--spacing-lg)')};
  font-size: 0.95rem;
  line-height: 1.6;
  color: #4a4a4a;
  border-top: ${({ $open }) => ($open ? '1px solid rgba(62, 1, 2, 0.05)' : 'none')};
  margin-top: ${({ $open }) => ($open ? '10px' : '0')};
`;

const NoResults = styled.div`
  text-align: center;
  padding: var(--spacing-xxl) 0;
  color: var(--color-rosa-tercero);

  h3 {
    color: var(--color-marron-principal);
    margin-bottom: 10px;
  }
`;

const FAQ_DATA = [
  {
    category: 'envios',
    icon: <FiTruck />,
    categoryLabel: 'Envíos',
    questions: [
      {
        q: '¿Cuáles son los métodos de envío disponibles?',
        a: 'Ofrecemos tres métodos principales: Envío Estándar a domicilio (entrega de 3 a 5 días hábiles), Envío Express (entrega en 24-48 horas para ciudades seleccionadas) y Retiro en sucursal (gratuito, listo en 2 horas).',
      },
      {
        q: '¿Cómo realizo el seguimiento de mi pedido?',
        a: 'Una vez despachado el pedido, recibirás un correo electrónico con el número de seguimiento y un enlace de la empresa de logística. También puedes ingresar a la sección "Seguimiento de envío" en nuestro sitio con tu correo y número de orden.',
      },
      {
        q: '¿Cuál es el costo del envío a mi localidad?',
        a: 'El costo depende del método de envío seleccionado y de tu código postal. Puedes calcular el costo exacto antes de finalizar tu compra usando el simulador en el carrito o visitando la sección de Envíos en nuestro footer.',
      },
    ],
  },
  {
    category: 'pagos',
    icon: <FiCreditCard />,
    categoryLabel: 'Pagos y Promos',
    questions: [
      {
        q: '¿Qué medios de pago aceptan?',
        a: 'Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, American Express, Cabal), Mercado Pago y transferencia bancaria directa. Contamos con promociones bancarias específicas que se detallan en la sección correspondiente.',
      },
      {
        q: '¿Cómo obtengo mi factura de compra?',
        a: 'La factura digital se envía automáticamente a tu dirección de correo electrónico una vez facturado tu pedido. Si necesitas una factura tipo A, asegúrate de completar los datos de CUIT y Razón Social al momento del pago.',
      },
    ],
  },
  {
    category: 'cuenta',
    icon: <FiUser />,
    categoryLabel: 'Mi Cuenta',
    questions: [
      {
        q: '¿Es obligatorio registrarse para comprar?',
        a: 'No, puedes realizar una compra como invitado. Sin embargo, registrarse te permite guardar tus direcciones, acceder al historial de compras de forma rápida, acumular puntos y hacer un seguimiento simple de tus envíos.',
      },
      {
        q: '¿Cómo cambio mi contraseña?',
        a: 'Ingresa a "Mi Cuenta", ve a la sección "Seguridad" o "Editar Perfil" y selecciona cambiar contraseña. Recibirás un enlace por correo para reestablecerla con seguridad.',
      },
    ],
  },
  {
    category: 'cambios',
    icon: <FiRotateCcw />,
    categoryLabel: 'Cambios',
    questions: [
      {
        q: '¿Cuál es la política de cambios y devoluciones?',
        a: 'Dispones de un plazo de 30 días corridos a partir de la entrega para solicitar un cambio. El producto debe estar en perfectas condiciones, cerrado en su celofán original y sin signos de uso por cuestiones de higiene en cosmética.',
      },
      {
        q: '¿Cómo solicito un reembolso usando el Botón de arrepentimiento?',
        a: 'Si compraste online, por ley tienes 10 días desde la entrega para revocar tu compra sin costo alguno. Ingresa a la página "Botón de arrepentimiento", completa el formulario y un representante de atención al cliente gestionará el retiro y reintegro del pago.',
      },
    ],
  },
];

export default function PreguntasFrecuentesContent() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredQuestions = FAQ_DATA.flatMap((catData) => {
    if (activeCategory !== 'todos' && catData.category !== activeCategory) {
      return [];
    }
    return catData.questions
      .filter(
        (faq) =>
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((faq) => ({
        ...faq,
        category: catData.category,
        id: `${catData.category}-${faq.q}`,
      }));
  });

  return (
    <>
      <SearchContainer>
        <FiSearch size={20} color="var(--color-bordo-secundario)" />
        <SearchInput
          type="text"
          placeholder="Buscá preguntas frecuentes... (ej. envíos, tarjetas, cambios)"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </SearchContainer>

      <CategoryGrid>
        <CategoryCard $active={activeCategory === 'todos'} onClick={() => setActiveCategory('todos')}>
          <div style={{ fontSize: '1.5rem', height: 28, display: 'flex', alignItems: 'center' }}>✨</div>
          <span>Ver todo</span>
        </CategoryCard>
        {FAQ_DATA.map((cat) => (
          <CategoryCard
            key={cat.category}
            $active={activeCategory === cat.category}
            onClick={() => setActiveCategory(cat.category)}
          >
            {cat.icon}
            <span>{cat.categoryLabel}</span>
          </CategoryCard>
        ))}
      </CategoryGrid>

      {filteredQuestions.length > 0 ? (
        <AccordionList>
          {filteredQuestions.map((faq) => (
            <AccordionItem key={faq.id}>
              <AccordionHeader onClick={() => toggleItem(faq.id)}>
                {faq.q}
                <AccordionChevron $open={openItems[faq.id]}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1L6 7L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </AccordionChevron>
              </AccordionHeader>
              <AccordionContent $open={openItems[faq.id]}>
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </AccordionList>
      ) : (
        <NoResults>
          <h3>No encontramos resultados</h3>
          <p>Intentá usar otras palabras clave o elegí una categoría diferente.</p>
        </NoResults>
      )}
    </>
  );
}
