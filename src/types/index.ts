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
  id?: number; // Adicionado para validar SKU no backend
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
  
  usar_preco_atacado_unico: boolean;
  
  habilita_atacado_geral: boolean; 
  preco_atacado_geral: number;
  
  habilita_atacado_grade: boolean;
  grade_atacado_id: number | null; 
  atacado_grade_qtd_por_tamanho: number; 
  preco_atacado_grade: number; 
  qtd_minima_atacado_grade: number; 
  
  composicao_atacado_grade?: any; 

  estoque: number;
  estoque_minimo: number;
  
  categoria_id: number;
  subcategoria_id: number | null;
  marca_id: number;
  grade_id: number | null; 
  
  categoria_nome?: string;
  subcategoria_nome?: string;
  marca_nome?: string;
  grade_nome?: string;

  variacoes?: ProductVariation[];
  
  ncm: string;
  cfop_padrao: string;
  cst_icms: string;
  unidade_medida: string;
  origem: string;
  
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