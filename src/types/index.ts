export interface Subcategory {
  id: number;
  categoria_id: number;
  nome: string;
  ncm: string;
  cfop_padrao: string;
  cst_icms: string;
  origem: string;
  unidade_medida: string;
  grade_id?: number | null;
}

export interface Category {
  id: number;
  nome: string;
  subcategorias?: Subcategory[];
}

export interface Brand {
  id: number;
  nome:string;
}

export interface GridSize {
  id?: number;
  tamanho: string;
  peso_kg: number;
  altura_cm: number;
  largura_cm: number;
  comprimento_cm: number;
}

export interface Grid {
  id: number;
  nome: string;
  tamanhos: GridSize[];
}

export interface ProductVariation {
  tamanho: string;
  estoque: number;
  sku: string;
  codigo_barras: string;
  peso_kg?: number;
  altura_cm?: number;
  largura_cm?: number;
  comprimento_cm?: number;
}

export interface Product {
  id: number;
  nome: string;
  sku: string;
  codigo_barras: string;
  preco_custo: number;
  preco_varejo: number;
  
  // ATACADO (ESTRUTURA DO BANCO DE DADOS)
  tipo_atacado: 'nenhum' | 'geral' | 'grade';
  preco_atacado?: number;
  quantidade_minima_atacado?: number;
  atacado_grade?: {
    tamanho: string;
    preco_atacado: number;
  }[];

  estoque: number;
  estoque_minimo: number;
  
  // Relacionamentos
  categoria_id: number;
  subcategoria_id: number | null;
  marca_id: number;
  grade_id: number | null; 
  
  // Campos extras
  categoria_nome?: string;
  subcategoria_nome?: string;
  marca_nome?: string;
  grade_nome?: string;

  // Variações
  variacoes?: ProductVariation[];
  
  // Fiscal
  ncm: string;
  cfop_padrao: string;
  cst_icms: string;
  unidade_medida: string;
  origem: string;
  
  // Dimensões
  peso_kg: number;
  altura_cm: number;
  largura_cm: number;
  comprimento_cm: number;
  
  dimensoes_grade?: any[]; 

  imagem_principal: string;
  imagens_galeria: string[];
  
  video?: string;
  video_url?: string;
  
  criado_em: string;
  atualizado_em: string;
}

// --- PDV Types ---
export interface CartItem {
  productId: number;
  productName: string;
  variation: {
    tamanho: string;
    sku: string;
  };
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface Customer {
  id: number;
  nome: string;
  cpf_cnpj: string;
  whatsapp: string;
  email?: string;
  tipo_pessoa: 'F' | 'J';
  rg_ie?: string;
  data_nascimento?: string | null;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes?: string;
  tipo_cliente: 'varejo' | 'atacado' | 'ambos';
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}