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

export interface Product {
  id: number;
  nome: string;
  sku: string;
  codigo_barras: string;
  preco_custo: number;
  preco_varejo: number;
  
  // NOVOS CAMPOS DE PREÇO ATACADO & PACOTE
  usar_preco_atacado_unico: boolean;
  
  // Atacado Geral (Misturado)
  habilita_atacado_geral: boolean; 
  preco_atacado_geral: number;
  
  // Atacado Grade (Pacote Fechado)
  habilita_atacado_grade: boolean;
  grade_atacado_id: number | null; // ID da grade que define o pacote
  atacado_grade_qtd_por_tamanho: number; // Ex: 2 peças de cada tamanho
  preco_atacado_grade: number; // Preço unitário dentro do pacote
  qtd_minima_atacado_grade: number; // Mantido para retrocompatibilidade ou regra extra

  estoque: number;
  estoque_minimo: number;
  
  // Relacionamentos
  categoria_id: number;
  subcategoria_id: number | null;
  marca_id: number;
  grade_id: number | null; // Grade física do produto (pode ser diferente da do pacote)
  
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
  
  imagem_principal: string;
  imagens_galeria: string[];
  
  criado_em: string;
  atualizado_em: string;
}