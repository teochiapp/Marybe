import type { Schema, Struct } from '@strapi/strapi';

export interface CategoriaSubcategoria extends Struct.ComponentSchema {
  collectionName: 'components_categoria_subcategorias';
  info: {
    displayName: 'subcategoria';
    icon: 'bulletList';
  };
  attributes: {
    nombre: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductoVariante extends Struct.ComponentSchema {
  collectionName: 'components_producto_variantes';
  info: {
    description: 'Variante de un producto (EAN, stock, precio, volumen)';
    displayName: 'Variante';
  };
  attributes: {
    envio: Schema.Attribute.String;
    id_original: Schema.Attribute.String;
    moneda: Schema.Attribute.String & Schema.Attribute.DefaultTo<'ARS'>;
    precio: Schema.Attribute.Decimal & Schema.Attribute.Required;
    precio_oferta: Schema.Attribute.Decimal;
    publicado: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    sku_ean: Schema.Attribute.String;
    stock: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    volumen: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'categoria.subcategoria': CategoriaSubcategoria;
      'producto.variante': ProductoVariante;
    }
  }
}
