import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export type ProductFormDTO = {
  id?: number; 
  nome: string;
  grade_id: string;
  subcategoria_id: string;
  marca_id: string;
  
  variacoes: {
    tamanho: string;
    estoque: number;
    sku: string;
    codigo_barras: string;
    peso_kg?: number;
    altura_cm?: number;
    largura_cm?: number;
    comprimento_cm?: number;
  }[];

  ncm: string;
  cfop_padrao: string;
  cst_icms: string;
  origem: string;
  unidade_medida: string;

  preco_custo: number;
  preco_varejo: number;
  
  // Nova Estrutura de Atacado
  tipo_atacado: 'nenhum' | 'geral' | 'grade';
  preco_atacado?: number;
  quantidade_minima_atacado?: number;
  atacado_grade?: {
    tamanho: string;
    preco_atacado: number;
  }[];

  imagem_principal_file?: File | null;
  imagens_galeria_files?: File[];
  video_file?: File | null;
};

const buildProductFormData = (formData: ProductFormDTO) => {
  const payload = new FormData();

  payload.append('nome', formData.nome);
  payload.append('grade_id', String(formData.grade_id));
  payload.append('subcategoria_id', String(formData.subcategoria_id));
  payload.append('marca_id', String(formData.marca_id));
  
  payload.append('ncm', formData.ncm);
  payload.append('cfop_padrao', formData.cfop_padrao);
  payload.append('cst_icms', formData.cst_icms);
  payload.append('origem', formData.origem);
  payload.append('unidade_medida', formData.unidade_medida);

  payload.append('preco_custo', String(Number(formData.preco_custo) || 0));
  payload.append('preco_varejo', String(Number(formData.preco_varejo) || 0));
  
  // --- ATACADO ---
  payload.append('tipo_atacado', formData.tipo_atacado);
  
  if (formData.tipo_atacado === 'geral') {
      payload.append('preco_atacado', String(Number(formData.preco_atacado) || 0));
      payload.append('quantidade_minima_atacado', String(Number(formData.quantidade_minima_atacado) || 0));
  } else if (formData.tipo_atacado === 'grade') {
      const composicaoJson = JSON.stringify(formData.atacado_grade?.map(v => ({
          tamanho: v.tamanho,
          preco_atacado: Number(v.preco_atacado) || 0
      })) || []);
      // Enviando como a interface exigiu
      payload.append('produto_atacado_grade_composicao', composicaoJson);
  }

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

  // --- VARIAÇÕES ---
  const variacoesJson = JSON.stringify(formData.variacoes?.map(v => ({
    tamanho: v.tamanho,
    estoque: Number(v.estoque) || 0,
    sku: v.sku || '',
    codigo_barras: v.codigo_barras || '',
    peso_kg: Number(v.peso_kg) || 0,
    altura_cm: Number(v.altura_cm) || 0,
    largura_cm: Number(v.largura_cm) || 0,
    comprimento_cm: Number(v.comprimento_cm) || 0,
  })) || []);
  payload.append('variacoes', variacoesJson);

  return payload;
};

async function createProduct(formData: ProductFormDTO): Promise<Product> {
  const payload = buildProductFormData(formData);
  const toastId = toast.loading("Salvando dados do produto...");

  try {
    const { data } = await api.post('/produtos', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
  if (!formData.id) throw new Error("ID do produto é obrigatório");
  const payload = buildProductFormData(formData);
  const toastId = toast.loading("Atualizando produto...");

  try {
    const { data } = await api.put(`/produtos/${formData.id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
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
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/produtos');
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
    onError: () => toast.error('Falha ao excluir o produto.'),
  });
}