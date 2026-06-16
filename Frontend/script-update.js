const fs = require('fs');
const files = [
  'src/components/inicio/hogar/FeaturedSectionHogar.jsx',
  'src/components/inicio/perfumeria/DiscountedSection.jsx',
  'src/components/inicio/perfumeria/FeaturedCategorySection.jsx',
  'src/components/inicio/perfumeria/FeaturedSection.jsx',
  'src/components/inicio/perfumeria/SpecificCategorySection.jsx'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;

  if (!c.includes('generateProductUrl')) {
    c = c.replace(/import \{ useNavigate \} from 'react-router-dom';/, 
                  'import { useNavigate } from \'react-router-dom\';\nimport { generateProductUrl } from \'../../../utils/productUrl\';');
    changed = true;
  }

  if (c.includes('handleProductClick = (id)')) {
    c = c.replace(/handleProductClick = \(id\)/g, 'handleProductClick = (id, nombre)');
    changed = true;
  }

  if (c.includes('navigate(`/producto/${id}`)')) {
    c = c.split('navigate(`/producto/${id}`)').join('navigate(generateProductUrl(id, nombre))');
    changed = true;
  }

  if (c.includes('onClick={() => handleProductClick(id)}')) {
    c = c.split('onClick={() => handleProductClick(id)}').join('onClick={() => handleProductClick(id, nombre)}');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(f, c);
    console.log('Updated', f);
  }
});
