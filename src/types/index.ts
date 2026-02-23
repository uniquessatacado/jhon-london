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
  ncm: string;
  cfop_padrao: string;
  cst_icms: string;
  unidade_medida: string;
  origem: string;
  peso_kg: number;
  altura_cm: number;
  largura_cm: number;
  comprimento_cm: number;
  imagem_principal: string;
  imagens_galeria: string[];
  categoria_id: number;
  marca_id: number;
  criado_em: string;
  atualizado_em: string;
}
