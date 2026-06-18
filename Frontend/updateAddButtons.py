import os
import re

files = [
    r'c:\Users\Ileana Lis\Desktop\Workspace Teo\React Proyects\Marybe\Frontend\src\components\tienda\single\SingleSimilares.jsx',
    r'c:\Users\Ileana Lis\Desktop\Workspace Teo\React Proyects\Marybe\Frontend\src\components\inicio\hogar\FeaturedSectionHogar.jsx',
    r'c:\Users\Ileana Lis\Desktop\Workspace Teo\React Proyects\Marybe\Frontend\src\components\inicio\perfumeria\SpecificCategorySection.jsx',
    r'c:\Users\Ileana Lis\Desktop\Workspace Teo\React Proyects\Marybe\Frontend\src\components\inicio\perfumeria\FeaturedSection.jsx',
    r'c:\Users\Ileana Lis\Desktop\Workspace Teo\React Proyects\Marybe\Frontend\src\components\inicio\perfumeria\FeaturedCategorySection.jsx',
    r'c:\Users\Ileana Lis\Desktop\Workspace Teo\React Proyects\Marybe\Frontend\src\components\inicio\perfumeria\DiscountedSection.jsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'AddToCartModal' in content:
        print(f'Skipped (already applied): {file}')
        continue
        
    # 1. Add import
    content = content.replace(
        "import { generateProductUrl } from '../../../utils/productUrl';",
        "import { generateProductUrl } from '../../../utils/productUrl';\nimport AddToCartModal from '../../carrito/AddToCartModal';"
    )
    if 'import AddToCartModal' not in content:
        # Maybe the import is different, try another hook
        content = content.replace(
            "import { useNavigate } from 'react-router-dom';",
            "import { useNavigate } from 'react-router-dom';\nimport AddToCartModal from '../../carrito/AddToCartModal';"
        )

    # 2. Add state inside component
    # Find something like: const scrollRef = useRef(null); or const navigate = useNavigate();
    state_added = False
    new_state = """
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
"""
    
    if 'const navigate = useNavigate();' in content:
        content = content.replace(
            'const navigate = useNavigate();',
            'const navigate = useNavigate();\n' + new_state,
            1
        )
        state_added = True
    elif 'const scrollRef = useRef(null);' in content:
        content = content.replace(
            'const scrollRef = useRef(null);',
            'const scrollRef = useRef(null);\n' + new_state,
            1
        )
        state_added = True
        
    if not state_added:
        print(f'Warning: Could not add state to {file}')
        
    # 3. Modify AddButton
    content = re.sub(
        r'<AddButton>',
        r'<AddButton onClick={(e) => handleAddClick(item, e)}>',
        content
    )
    
    # 4. Add Modal before </SectionWrapper> or </SectionContainer> or </SimilarContainer>
    modal_code = """
      {selectedProduct && (
        <AddToCartModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
          initialMode="select"
        />
      )}
"""
    if '</SectionWrapper>' in content:
        content = content.replace('</SectionWrapper>', modal_code + '</SectionWrapper>')
    elif '</SectionContainer>' in content:
        content = content.replace('</SectionContainer>', modal_code + '</SectionContainer>')
    elif '</SimilarContainer>' in content:
        content = content.replace('</SimilarContainer>', modal_code + '</SimilarContainer>')
    else:
        print(f'Warning: Could not find closing tag for {file}')
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f'Successfully updated {file}')
