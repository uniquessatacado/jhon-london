import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// DTO atualizado para suportar arquivos
export type ProductFormDTO = {
  id?: number; // Opcional para create, obrigatório para update
  nome: string;
  grade_id: string;
  subcategoria_id: string;
  marca_id: string;
  
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
  
  composicao_atacado: {
    tamanho: string;
    quantidade: number;
  }[];

  // Arquivos
  imagem_principal_file?: File | null;
  imagens_galeria_files?: File[];
  video_file?: File | null;
  
  // Para manter imagens existentes em caso de update
  keep_images?: boolean; 
};

// Função auxiliar para montar o FormData
const buildProductFormData = (formData: ProductFormDTO) => {
  const payload = new FormData();

  // Campos Simples
  payload.append('nome', formData.nome);
  payload.append('grade_id', String(formData.grade_id));
  payload.append('subcategoria_id', String(formData.subcategoria_id));
  payload.append('marca_id', String(formData.marca_id));
  
  // Fiscal
  payload.append('ncm', formData.ncm);
  payload.append('cfop_padrao', formData.cfop_padrao);
  payload.append('cst_icms', formData.cst_icms);
  payload.append('origem', formData.origem);
  payload.append('unidade_medida', formData.unidade_medida);

  // Financeiro
  payload.append('preco_custo', String(Number(formData.preco_custo) || 0));
  payload.append('preco_varejo', String(Number(formData.preco_varejo) || 0));
  
  // Atacado Geral
  payload.append('habilita_atacado_geral', String(formData.habilita_atacado_geral));
  payload.append('preco_atacado_geral', String(Number(formData.preco_atacado_geral) || 0));
  
  // Atacado Grade
  payload.append('habilita_atacado_grade', String(formData.habilita_atacado_grade));
  payload.append('usar_preco_atacado_unico', String(formData.usar_preco_atacado_unico));
  
  if (formData.grade_atacado_id && formData.grade_atacado_id !== "null") {
    payload.append('grade_atacado_id', String(formData.grade_atacado_id));
  } else {
    payload.append('grade_atacado_id', '');
  }
  
  const precoAtacadoGrade = formData.usar_preco_atacado_unico 
        ? (Number(formData.preco_atacado_geral) || 0) 
        : (Number(formData.preco_atacado_grade) || 0);
  payload.append('preco_atacado_grade', String(precoAtacadoGrade));

  // --- ARQUIVOS ---
  if (formData.imagem_principal_file) {
    payload.append('imagem_principal', formData.imagem_principal_file);
  }

  if (formData.video_file) {
    payload.append('video', formData.video_file);
  }

  if (formData.imagens_galeria_files && formData.imagens_galeria_files.length > 0) {
    formData.imagens_galeria_files.forEach((file) => {
      payload.append('imagens_galeria', file);
    });
  }

  // --- OBJETOS COMPLEXOS (JSON Stringify) ---
  const variacoesJson = JSON.stringify(formData.variacoes?.map(v => ({
    tamanho: v.tamanho,
    estoque: Number(v.estoque) || 0,
    sku: v.sku || '',
    codigo_barras: v.codigo_barras || ''
  })) || []);
  payload.append('variacoes', variacoesJson);

  let composicaoJson = "[]";
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
  payload.append('composicao_atacado_grade', composicaoJson);
  
  return payload;
};

async function createProduct(formData: ProductFormDTO): Promise<Product> {
  const payload = buildProductFormData(formData);
  // Envio com Content-Type automático (o browser define o boundary do multipart)
  const { data } = await api.post('/produtos', payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
}

async function updateProduct(formData: ProductFormDTO): Promise<Product> {
  if (!formData.id) throw new Error("ID do produto é obrigatório para atualização");
  
  const payload = buildProductFormData(formData);
  // PUT request
  const { data } = await api.put(`/produtos/${formData.id}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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
        description: 'Verifique os dados e tente novamente.',
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      toast.success('Produto atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/produtos');
    },
    onError: (error) => {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Falha ao atualizar o produto.', {
        description: 'Verifique os dados e tente novamente.',
      });
    },
  });
}