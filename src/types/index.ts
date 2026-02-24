export interface Subcategory {
  id: number;
  categoria_id: number;
  nome: string;
  ncm: string;
  cfop_padrao: string;
  cst_icms: string;
  origem: string;
  unidade_medida: string;
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
  id?: number; // Opcional pois na criação não tem ID ainda
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

export interface Product {
  id: number;
  nome: string;
  sku: string;
  codigo_barras: string;
  preco_custo: number;
  preco_varejo: number;
  preco_atacado: number;
  estoque: number;
  estoque_minimo: number;
  
  // Relacionamentos
  categoria_id: number;
  subcategoria_id: number | null;
  marca_id: number;
  grade_id: number | null;
  
  // Fiscal
  ncm: string;
  cfop_padrao: string;
  cst_icms: string;
  unidade_medida: string;
  origem: string;
  
  // Dimensões (usadas se não tiver grade)
  peso_kg: number;
  altura_cm: number;
  largura_cm: number;
  comprimento_cm: number;
  
  imagem_principal: string;
  imagens_galeria: string[];
  
  criado_em: string;
  atualizado_em: string;
}