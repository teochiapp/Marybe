import React, { useEffect, useState } from 'react';
import SingleSimilares from '../tienda/single/SingleSimilares';

// Misma lógica que FeaturedSection.jsx: destacados de Perfumería
export default function GiftCardDestacados() {
  const [productos, setProductos] = useState(null);

  const seccionName = 'Perfumería';

  useEffect(() => {
    fetch(`${process.env.REACT_APP_STRAPI_URL}/api/productos?filters[destacado][$eq]=true&filters[seccion][$eq]=${seccionName}&populate=*`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          setProductos(data.data);
        } else {
          setProductos([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching productos:', err);
        setProductos([]);
      });
  }, [seccionName]);

  if (!productos) return null;

  return <SingleSimilares title="Destacados" items={productos} />;
}
