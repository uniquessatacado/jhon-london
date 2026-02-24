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
  nome: string;
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
  id?: number;
  tamanho: string;
  estoque: number;
  sku: string;
  codigo_barras: string;
}

export interface Product {
  id: number;
  nome: string;
  sku: string;
  codigo_barras: string;
  preco_custo: number;
  preco_varejo: number;
  
  // Atacado
  usar_preco_atacado_unico: boolean;
  habilita_atacado_geral: boolean; 
  preco_atacado_geral: number;
  habilita_atacado_grade: boolean;
  grade_atacado_id: number | null;
  preco_atacado_grade: number;

  estoque: number; // Total stock
  estoque_minimo: number;
  
  // IDs
  categoria_id: number;
  subcategoria_id: number | null;
  marca_id: number;
  grade_id: number | null;
  
  // Auxiliary Names (Returned by GET /api/produtos)
  categoria_nome?: string;
  subcategoria_nome?: string;
  marca_nome?: string;
  grade_nome?: string;

  // Nested Data
  variacoes: ProductVariation[];
  
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
  
  imagem_principal: string | null;
  imagens_galeria: string[];
  
  criado_em: string;
  atualizado_em: string;
}