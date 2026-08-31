export interface Cafe {
  id: number;
  productId?: string;
  name: string;
  category: 'tradicional' | 'especial';
  description: string;
  descriptionLong: string;
  priceBase: number; // For 250g
  aroma: string;
  sabor: string;
  acidez: string;
  corpo: string;
  notasMarcantes: string[];
  produtor: string;
  fazenda: string;
  safra: string;
  localizacao: string;
  processo: string;
  variedade: string;
  sommelierComment: string;
  pontuacao?: number; // Only for special coffees (e.g. SCA score 84-90)
  image: string;
  imagesLavoura: string[]; // 4 or more photos of the production cycle
  altitude: string;
}

export interface Equipamento {
  id: number;
  productId?: string;
  name: string;
  description: string;
  descriptionLong: string;
  price: number;
  image: string;
  specs: string[];
  objective: string;
  howToUse: string;
}

export interface PlanoAssinatura {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  benefits: string[];
  level: 'basico' | 'essencial' | 'completo';
}

export interface ArtigoBlog {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

export interface Cafeicultor {
  id: number;
  name: string;
  location: string;
  history: string;
  farm: string;
  specialty: string;
  image: string;
}

export interface CartItem {
  id: string; // Unique ID for cart item
  productType: 'cafe' | 'equipamento';
  quantity: number;
  priceUnit: number;
  priceTotal: number;
  cafeDetails?: {
    id: number;
    productId?: string;
    name: string;
    image: string;
    weight: 250 | 500 | 1000;
    type: 'Grão' | 'Torrado';
    roast?: 'Clara' | 'Média' | 'Escura';
  };
  equipamentoDetails?: {
    id: number;
    productId?: string;
    name: string;
    image: string;
  };
}
