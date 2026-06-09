# Reglas del proyecto — Marybe Frontend

## Stack
- **React** (functional components + hooks)
- **styled-components** para todos los estilos

## Reglas obligatorias

### 1. styled-components — siempre en el mismo archivo que el JSX
Nunca crear archivos `.css` separados. Los estilos van definidos con `styled-components` arriba del componente, en el mismo `.jsx`.

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
--font-family-primary: "Brygada 1918", serif;
--font-family-secondary: "Inter", sans-serif;
--color-marron-principal: #3E0102;
--color-marron-secundario: #28180b;
--color-marron-tercero: #160000;
--color-bordo-secundario: #7C0405;
--color-titulo-marybe: #f2dc8f;
--color-rosa-tercero: #D3C0C0;
--color-fondo-beneficio-tarjeta: #FAF9F7;
--color-blanco-pero-no-tan-blanco: #FAF0F0;
--color-blanco: #FFFFFF;
```

### 3. Código prolijo
- En las pages solo habrá componentes listados, el codigo estará en las carpetas de componentes de cada página para tener un pages limpio.
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

### 5. Estructura de carpetas
```
src/
├── pages/                  ← Páginas principales (minúsculas)
│   ├── inicio/
│   │   └── Inicio.jsx
│   ├── tienda/
│   │   └── Tienda.jsx
│   ├── tests/              ← Carpeta de pruebas
│   │   └── ApiProductos.test.jsx
│   └── ApiProductos.jsx
├── components/             ← Componentes comunes y de layout (minúsculas)
│   ├── header/
│   │   ├── Header.jsx
│   │   ├── NavBar.jsx
│   │   ├── TopBar.jsx
│   │   └── CategoryNav.jsx
│   └── footer/
│       └── Footer.jsx
├── index.css                ← Solo variables globales y reset
└── App.js
```
