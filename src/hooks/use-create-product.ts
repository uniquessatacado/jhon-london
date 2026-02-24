import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// DTO para o formulário (antes de converter para o payload da API)
type ProductFormDTO = {
  nome: string;
  grade_id: string;
  subcategoria_id: string;
  marca_id: string;
  
  // Array de variações que será convertido em string JSON
  variacoes: {
    tamanho: string;
    estoque: number;
    sku: string;
    codigo_barras: string;
  }[];

  // Fiscal
  ncm: string;
  cfop_padrao: string;
  cst_icms: string;
  origem: string;
  unidade_medida: string;

  // Financeiro
  preco_custo: number;
  preco_varejo: number;
  
  // Atacado
  habilita_atacado_geral: boolean;
  preco_atacado_geral: number;
  
  habilita_atacado_grade: boolean;
  usar_preco_atacado_unico: boolean;
  grade_atacado_id: string;
  preco_atacado_grade: number;
  
  // NOVO: Composição do pacote (grade fechada)
  composicao_atacado: {
    tamanho: string;
    quantidade: number;
  }[];

  imagens_galeria: string;
  imagem_principal: string;
};

async function createProduct(formData: Partial<ProductFormDTO>): Promise<Product> {
  
  // Conversão de Variações para JSON String
  const variacoesJson = JSON.stringify(formData.variacoes?.map(v => ({
    tamanho: v.tamanho,
    estoque: Number(v.estoque) || 0,
    sku: v.sku || '',
    codigo_barras: v.codigo_barras || ''
  })) || []);

  // Conversão da Composição do Atacado Grade para JSON String
  // Filtra apenas se tiver grade selecionada e quantidades preenchidas
  let composicaoJson = null;
  if (formData.habilita_atacado_grade && formData.grade_atacado_id && formData.composicao_atacado) {
      const composicaoValida = formData.composicao_atacado
          .filter(c => c && c.tamanho && Number(c.quantidade) > 0)
          .map(c => ({
              tamanho: c.tamanho,
              quantidade: Number(c.quantidade)
          }));
      
      if (composicaoValida.length > 0) {
          composicaoJson = JSON.stringify(composicaoValida);
      }
  }

  const payload = {
    nome: formData.nome,
    grade_id: Number(formData.grade_id),
    subcategoria_id: Number(formData.subcategoria_id),
    marca_id: Number(formData.marca_id),
    
    variacoes: variacoesJson,

    // Fiscal
    ncm: formData.ncm,
    cfop_padrao: formData.cfop_padrao,
    cst_icms: formData.cst_icms,
    origem: formData.origem,
    unidade_medida: formData.unidade_medida,

    // Financeiro
    preco_custo: Number(formData.preco_custo) || 0,
    preco_varejo: Number(formData.preco_varejo) || 0,
    
    // Atacado Geral
    habilita_atacado_geral: formData.habilita_atacado_geral,
    preco_atacado_geral: Number(formData.preco_atacado_geral) || 0,
    
    // Atacado Grade (Pacote)
    habilita_atacado_grade: formData.habilita_atacado_grade,
    usar_preco_atacado_unico: formData.usar_preco_atacado_unico,
    grade_atacado_id: formData.grade_atacado_id ? Number(formData.grade_atacado_id) : null,
    
    // Enviamos o JSON da composição
    composicao_atacado_grade: composicaoJson,
    
    preco_atacado_grade: formData.usar_preco_atacado_unico 
        ? (Number(formData.preco_atacado_geral) || 0) 
        : (Number(formData.preco_atacado_grade) || 0),

    // Imagens
    imagem_principal: formData.imagem_principal,
    imagens_galeria: formData.imagens_galeria ? formData.imagens_galeria.split(',').map((s: string) => s.trim()) : [],
  };

  const { data } = await api.post('/produtos', payload);
  return data;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success('Produto criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/produtos');
    },
    onError: (error) => {
      console.error('Erro ao criar produto:', error);
      toast.error('Falha ao criar o produto.', {
        description: 'Verifique se a grade e as variações estão preenchidas corretamente.',
      });
    },
  });
}