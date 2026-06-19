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

export interface LayoutFila1Columna extends Struct.ComponentSchema {
  collectionName: 'components_layout_fila_1_columnas';
  info: {
    description: 'Fila que contiene 1 \u00FAnico banner que ocupa el 100% del ancho.';
    displayName: 'Fila 1 Columna';
    icon: 'layout';
  };
  attributes: {
    banners: Schema.Attribute.Component<'shared.banner', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    es_carrusel: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
  };
}

export interface LayoutFila2Columnas extends Struct.ComponentSchema {
  collectionName: 'components_layout_fila_2_columnas';
  info: {
    description: 'Fila que contiene 2 banners dispuestos uno al lado del otro.';
    displayName: 'Fila 2 Columnas';
    icon: 'layout';
  };
  attributes: {
    banners: Schema.Attribute.Component<'shared.banner', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    es_carrusel: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
  };
}

export interface LayoutFila4Columnas extends Struct.ComponentSchema {
  collectionName: 'components_layout_fila_4_columnas';
  info: {
    description: 'Fila que contiene 4 banners.';
    displayName: 'Fila 4 Columnas';
    icon: 'layout';
  };
  attributes: {
    banners: Schema.Attribute.Component<'shared.banner', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    es_carrusel: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
  };
}

export interface LayoutFilaMixta extends Struct.ComponentSchema {
  collectionName: 'components_layout_fila_mixtas';
  info: {
    description: 'Fila con 1 banner principal y 2 banners secundarios.';
    displayName: 'Fila Personalizada';
    icon: 'layout';
  };
  attributes: {
    banners: Schema.Attribute.Component<'shared.banner', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    es_carrusel: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
  };
}

export interface ProductoVariante extends Struct.ComponentSchema {
  collectionName: 'components_producto_variantes';
  info: {
    description: 'Variante de un producto (EAN, stock, precio, volumen)';
    displayName: 'Variante';
  };
  attributes: {
    color_nombre: Schema.Attribute.String;
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

export interface SharedBanner extends Struct.ComponentSchema {
  collectionName: 'components_shared_banners';
  info: {
    description: 'Componente para un banner con im\u00E1genes para diferentes resoluciones.';
    displayName: 'Banner Responsive';
    icon: 'picture';
  };
  attributes: {
    ancho_porcentaje: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<100>;
    enlace: Schema.Attribute.String;
    imagen_desktop: Schema.Attribute.Media<'images'> &
      Schema.Attribute.Required;
    imagen_mobile: Schema.Attribute.Media<'images'>;
    imagen_tablet: Schema.Attribute.Media<'images'>;
    titulo: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'categoria.subcategoria': CategoriaSubcategoria;
      'layout.fila-1-columna': LayoutFila1Columna;
      'layout.fila-2-columnas': LayoutFila2Columnas;
      'layout.fila-4-columnas': LayoutFila4Columnas;
      'layout.fila-mixta': LayoutFilaMixta;
      'producto.variante': ProductoVariante;
      'shared.banner': SharedBanner;
    }
  }
}
