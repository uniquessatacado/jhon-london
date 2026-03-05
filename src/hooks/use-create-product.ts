import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export type ProductFormDTO = {
  id?: number; 
  nome: string;
  categoria_id?: string;
  grade_id: string;
  subcategoria_id: string;
  marca_id: string;
  
  variacoes: {
    id?: number;
    tamanho: string;
    estoque: number | string;
    sku: string;
    codigo_barras: string;
    peso_kg?: number | string;
    altura_cm?: number | string;
    largura_cm?: number | string;
    comprimento_cm?: number | string;
  }[];

  ncm: string;
  cfop_padrao: string;
  cst_icms: string;
  origem: string;
  unidade_medida: string;

  preco_custo: number | string;
  preco_varejo: number | string;
  
  habilita_atacado_geral: boolean;
  preco_atacado_geral: number | string;
  
  habilita_atacado_grade: boolean;
  grade_atacado_id: string;
  preco_atacado_grade: number | string;
  qtd_minima_atacado_grade: number | string;
  
  composicao_atacado: {
    tamanho: string;
    quantidade: number | string;
  }[];

  imagem_principal_file?: File | null;
  imagens_galeria_files?: File[];
  video_file?: File | null;
  keep_images?: boolean; 
};

// Blindagem: Transforma vírgula em ponto e previne NaN
const parseToNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = parseFloat(String(value).replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
};

const buildProductFormData = (formData: ProductFormDTO) => {
  const payload = new FormData();

  payload.append('nome', formData.nome);
  
  if (formData.categoria_id) {
      payload.append('categoria_id', String(formData.categoria_id));
  }
  
  payload.append('grade_id', String(formData.grade_id));
  payload.append('subcategoria_id', String(formData.subcategoria_id));
  payload.append('marca_id', String(formData.marca_id));
  
  payload.append('ncm', formData.ncm);
  payload.append('cfop_padrao', formData.cfop_padrao);
  payload.append('cst_icms', formData.cst_icms);
  payload.append('origem', formData.origem);
  payload.append('unidade_medida', formData.unidade_medida);

  payload.append('preco_custo', String(parseToNumber(formData.preco_custo)));
  payload.append('preco_varejo', String(parseToNumber(formData.preco_varejo)));
  
  payload.append('habilita_atacado_geral', String(formData.habilita_atacado_geral));
  payload.append('preco_atacado_geral', String(parseToNumber(formData.preco_atacado_geral)));
  
  payload.append('habilita_atacado_grade', String(formData.habilita_atacado_grade));
  payload.append('preco_atacado_grade', String(parseToNumber(formData.preco_atacado_grade)));
  payload.append('qtd_minima_atacado_grade', String(parseToNumber(formData.qtd_minima_atacado_grade)));
  
  if (formData.grade_atacado_id && formData.grade_atacado_id !== "null") {
    payload.append('grade_atacado_id', String(formData.grade_atacado_id));
  } else {
    payload.append('grade_atacado_id', '');
  }

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

  const variacoesJson = JSON.stringify(formData.variacoes?.map(v => ({
    id: v.id, // O Backend precisa saber o ID para não zerar as coisas na edição
    tamanho: v.tamanho,
    estoque: parseToNumber(v.estoque),
    sku: v.sku || '',
    codigo_barras: v.codigo_barras || '',
    peso_kg: parseToNumber(v.peso_kg),
    altura_cm: parseToNumber(v.altura_cm),
    largura_cm: parseToNumber(v.largura_cm),
    comprimento_cm: parseToNumber(v.comprimento_cm),
  })) || []);
  payload.append('variacoes', variacoesJson);

  // Enviamos dimensoes_grade separadamente para garantir a compatibilidade com a API
  const dimensoesJson = JSON.stringify(formData.variacoes?.map(v => ({
    tamanho: v.tamanho,
    peso_kg: parseToNumber(v.peso_kg),
    altura_cm: parseToNumber(v.altura_cm),
    largura_cm: parseToNumber(v.largura_cm),
    comprimento_cm: parseToNumber(v.comprimento_cm),
  })) || []);
  payload.append('dimensoes_grade', dimensoesJson);

  let composicaoJson = "[]";
  if (formData.habilita_atacado_grade && formData.grade_atacado_id && formData.composicao_atacado) {
      const composicaoValida = formData.composicao_atacado
          .filter(c => c && c.tamanho && parseToNumber(c.quantidade) > 0)
          .map(c => ({
              tamanho: c.tamanho,
              quantidade: parseToNumber(c.quantidade)
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
  const toastId = toast.loading("Salvando dados do produto...");

  try {
    const { data } = await api.post('/produtos', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && (formData.imagem_principal_file || formData.imagens_galeria_files?.length || formData.video_file)) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          toast.loading(`Enviando mídias... ${percentCompleted}%`, { id: toastId });
        }
      },
    });
    toast.success('Produto criado com sucesso!', { id: toastId });
    return data;
  } catch (error: any) {
    const description = error.response?.data?.error || error.response?.data?.message || 'Verifique os dados e tente novamente.';
    toast.error('Falha ao criar o produto.', { id: toastId, description });
    throw error;
  }
}

async function updateProduct(formData: ProductFormDTO): Promise<Product> {
  if (!formData.id) throw new Error("ID do produto é obrigatório para atualização");
  const payload = buildProductFormData(formData);
  const toastId = toast.loading("Atualizando produto...");

  try {
    const { data } = await api.put(`/produtos/${formData.id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && (formData.imagem_principal_file || formData.imagens_galeria_files?.length || formData.video_file)) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          toast.loading(`Enviando mídias... ${percentCompleted}%`, { id: toastId });
        }
      },
    });
    toast.success('Produto atualizado com sucesso!', { id: toastId });
    return data;
  } catch (error: any) {
    const description = error.response?.data?.error || error.response?.data?.message || 'Verifique os dados e tente novamente.';
    toast.error('Falha ao atualizar o produto.', { id: toastId, description });
    throw error;
  }
}

async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/produtos/${id}`);
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/produtos');
    },
    onError: (error: any) => {
      console.error('Erro ao criar produto:', error);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (variables.id) {
         queryClient.invalidateQueries({ queryKey: ['product', String(variables.id)] });
      }
      navigate('/produtos');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar produto:', error);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Produto excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Erro ao excluir produto:', error);
      toast.error('Falha ao excluir o produto.');
    },
  });
}