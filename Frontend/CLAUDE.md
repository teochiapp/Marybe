# Reglas del proyecto — Marybe Frontend

## Stack
- **React** (functional components + hooks)
- **styled-components** para todos los estilos
- **React Router v6** para navegación
- **Backend:** Strapi v5 (SQLite en desarrollo) — URL via `REACT_APP_STRAPI_URL`

---

## Reglas obligatorias

### 1. styled-components — siempre en el mismo archivo que el JSX
Nunca crear archivos `.css` separados. Los estilos van definidos con `styled-components` arriba del componente, en el mismo `.jsx`..

```jsx
// ✅ Correcto
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: var(--color-marron-principal);
  display: flex;
`;

export default function MiComponente() {
  return <Wrapper>...</Wrapper>;
}
```

```jsx
// ❌ Incorrecto
import './MiComponente.css';
```

### 2. Variables CSS del proyecto
Siempre usar las variables definidas en `src/index.css`:

```css
/* Tipografías */
--font-family-primary: "Brygada 1918", serif;
--font-family-secondary: "Inter", sans-serif;

/* Colores principales */
--color-marron-principal: #3E0102;
--color-marron-secundario: #28180b;
--color-marron-tercero: #160000;
--color-marron-cuarto: #280101;
--color-bordo-secundario: #7C0405;
--color-bordo-tercero: #560203;
--color-bordo-cuarto: #6A0304;
--color-titulo-marybe: #f2dc8f;
--color-rosa-tercero: #D3C0C0;
--color-fondo-beneficio-tarjeta: #FAF9F7;
--color-blanco-pero-no-tan-blanco: #FAF0F0;
--color-blanco: #FFFFFF;

/* Sección de tarjetas/promociones */
--color-fondo-tarjetas-promo: #F6F4F0;
--color-fondo-info-promo: #e7e2da;
--color-boton-promo: #280101;

/* Espaciados */
--spacing-xs: 0.25rem;   /* 4px  */
--spacing-sm: 0.5rem;    /* 8px  */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-xxl: 3rem;     /* 48px */

/* Radios */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 20px;
--radius-full: 9999px;

/* Sombras */
--shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
--shadow-inner: inset 0 2px 4px 0 rgba(0,0,0,0.06);

/* Transiciones */
--transition-fast: all 0.15s ease;
--transition-normal: all 0.3s ease;
--transition-slow: all 0.5s ease;
```

### 3. Código prolijo
- En las pages solo habrá componentes listados; el código estará en las carpetas de componentes de cada página para tener un `pages/` limpio.
- Un componente por archivo
- Props claras y bien nombradas
- Sin código comentado ni imports sin usar
- Styled-components nombrados de forma descriptiva (`TopBarWrapper`, no `Div1`)

### 4. Responsive
- Siempre pensar en mobile primero
- Usar media queries dentro de los styled-components

```jsx
const Wrapper = styled.div`
  display: flex;
  gap: 48px;

  @media (max-width: 768px) {
    gap: 16px;
  }
`;
```

Breakpoints estándar del proyecto: `480px`, `600px`, `768px`, `992px`, `1200px`, `1440px`.

### 5. Fetch a Strapi
Todos los fetches al backend siguen este patrón:

```js
const STRAPI_URL = process.env.REACT_APP_STRAPI_URL || 'http://localhost:1337';

useEffect(() => {
  async function fetchData() {
    const res = await fetch(`${STRAPI_URL}/api/<coleccion>?populate=*`);
    const json = await res.json();
    setData(json.data);
  }
  fetchData();
}, []);
```

---

## Estructura de carpetas

```
Marybe/
├── Backend/                        ← Strapi v5
│   ├── config/                     ← admin, database, plugins, server
│   ├── src/
│   │   ├── api/                    ← Content types: producto, categoria, oferta,
│   │   │                              seccion-descuento, seccion-destacada,
│   │   │                              seccion-descuento-hogar, seccion-destacada-hogar,
│   │   │                              categoria-especifica, categoria-especifica-hogar
│   │   └── components/categoria/   ← Componente: subcategoria
│   └── scripts/                    ← Utilidades de migración / importación de datos
│
└── Frontend/                       ← React App
    ├── public/
    │   └── inicio/                 ← Imágenes estáticas de la home
    ├── src/
    │   ├── App.js                  ← Router principal
    │   ├── index.css               ← Variables globales y reset
    │   ├── pages/
    │   │   ├── inicio/
    │   │   │   └── Inicio.jsx      ← Página home (perfumería + hogar)
    │   │   ├── tienda/
    │   │   │   └── Catalogo.jsx
    │   │   ├── categorias/
    │   │   │   ├── Ofertas.jsx
    │   │   │   ├── Lanzamientos.jsx
    │   │   │   ├── Eventos.jsx
    │   │   │   └── PromocionesBancarias.jsx
    │   │   ├── ayuda/
    │   │   │   ├── PreguntasFrecuentes.jsx
    │   │   │   ├── Envios.jsx
    │   │   │   ├── CambiosDevoluciones.jsx
    │   │   │   ├── TerminosCondiciones.jsx
    │   │   │   └── BotonArrepentimiento.jsx
    │   │   └── pedidos/
    │   │       ├── MiCuenta.jsx
    │   │       ├── SeguimientoEnvio.jsx
    │   │       └── CanjearGiftCard.jsx
    │   └── components/
    │       ├── header/
    │       │   ├── Header.jsx
    │       │   ├── NavBar.jsx
    │       │   ├── TopBar.jsx
    │       │   ├── CategoryNav.jsx
    │       │   └── UbicacionPopup.jsx
    │       ├── footer/
    │       │   ├── Footer.jsx
    │       │   ├── FooterBrand.jsx
    │       │   ├── FooterContact.jsx
    │       │   ├── FooterIcons.jsx
    │       │   ├── FooterNavColumn.jsx
    │       │   └── footerData.js
    │       ├── inicio/
    │       │   ├── perfumeria/
    │       │   │   ├── ToggleSelection.jsx     ← Switch perfumería / hogar
    │       │   │   ├── PromoCarousel.jsx       ← Carousel de banners (Strapi)
    │       │   │   ├── FeaturedSection.jsx
    │       │   │   ├── FeaturedCategorySection.jsx
    │       │   │   ├── CategoriesSection.jsx
    │       │   │   ├── OfertasSection.jsx
    │       │   │   ├── DiscountedSection.jsx
    │       │   │   ├── SpecificCategorySection.jsx
    │       │   │   ├── TarjetasPromociones.jsx ← Beneficios de tarjetas bancarias
    │       │   │   ├── ProximosEventos.jsx
    │       │   │   └── DescubriMas.jsx
    │       │   ├── hogar/
    │       │   │   ├── FeaturedSectionHogar.jsx
    │       │   │   └── DiscountedSectionHogar.jsx
    │       │   └── shared/
    │       │       └── GiftCard.jsx            ← Banner gift card (compartido)
    │       ├── shared/
    │       │   └── PageLayout.jsx
    │       └── ScrollToTopButton.jsx
```

---

## Orden de componentes en Inicio.jsx

### Sección perfumería
1. `ToggleSelection` — switch de sección
2. `PromoCarousel` — banners del CMS
3. `FeaturedSection`
4. `CategoriesSection`
5. `FeaturedCategorySection`
6. `OfertasSection`
7. `DiscountedSection`
8. `SpecificCategorySection`
9. `TarjetasPromociones` — beneficios de tarjetas bancarias
10. `GiftCard` (dentro de `GiftCardWrapper`)
11. `ProximosEventos`
12. `DescubriMas`

### Sección hogar
1. `ToggleSelection`
2. `PromoCarousel`
3. `OfertasSection`
4. `FeaturedSectionHogar`
5. `CategoriesSection`
6. `FeaturedCategorySection`
7. `DiscountedSectionHogar`
8. `SpecificCategorySection`
9. `TarjetasPromociones`
10. `GiftCard` (dentro de `GiftCardWrapper`)
11. `DescubriMas`

---

## Rutas (App.js)

| Ruta | Componente |
|---|---|
| `/` | Redirige a `/inicio` |
| `/inicio` | `Inicio` |
| `/tienda` | `Catalogo` |
| `/productos` | `ApiProductos` |
| `/ofertas` | `Ofertas` |
| `/lanzamientos` | `Lanzamientos` |
| `/eventos` | `Eventos` |
| `/promociones-bancarias` | `PromocionesBancarias` |
| `/preguntas-frecuentes` | `PreguntasFrecuentes` |
| `/envios` | `Envios` |
| `/cambios-devoluciones` | `CambiosDevoluciones` |
| `/terminos-condiciones` | `TerminosCondiciones` |
| `/boton-arrepentimiento` | `BotonArrepentimiento` |
| `/mi-cuenta` | `MiCuenta` |
| `/seguimiento-envio` | `SeguimientoEnvio` |
| `/canjear-gift-card` | `CanjearGiftCard` |
