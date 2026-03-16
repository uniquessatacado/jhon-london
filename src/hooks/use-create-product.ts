import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
  variacoes: any[];
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
  composicao_atacado: any[];
  imagem_principal_file?: File | null;
  imagens_galeria_files?: File[];
  video_file?: File | null;
  keep_images?: boolean; 
};

const parseToNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = parseFloat(String(value).replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
};

// Faz o upload direto pro Supabase Storage
const uploadMediaToSupabase = async (file: File, folder: string = 'produtos') => {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  const { error } = await supabase.storage.from(folder).upload(fileName, file);
  if (error) throw new Error(`Falha no upload: ${error.message}`);
  
  // Pegar URL Pública
  const { data } = supabase.storage.from(folder).getPublicUrl(fileName);
  return data.publicUrl;
};

async function createProduct(formData: ProductFormDTO): Promise<Product> {
  const toastId = toast.loading("Enviando mídia e salvando produto...");

  try {
    // 1. Upload das Imagens/Videos
    let imagem_principal = '';
    if (formData.imagem_principal_file) {
      imagem_principal = await uploadMediaToSupabase(formData.imagem_principal_file);
    }
    let video_url = '';
    if (formData.video_file) {
      video_url = await uploadMediaToSupabase(formData.video_file);
    }
    let imagens_galeria: string[] = [];
    if (formData.imagens_galeria_files && formData.imagens_galeria_files.length > 0) {
      imagens_galeria = await Promise.all(formData.imagens_galeria_files.map(f => uploadMediaToSupabase(f)));
    }

    // 2. Inserir Produto
    const { data: prod, error: prodErr } = await supabase.from('produtos').insert([{
      nome: formData.nome,
      categoria_id: formData.categoria_id ? Number(formData.categoria_id) : null,
      grade_id: formData.grade_id ? Number(formData.grade_id) : null,
      subcategoria_id: formData.subcategoria_id ? Number(formData.subcategoria_id) : null,
      marca_id: formData.marca_id ? Number(formData.marca_id) : null,
      ncm: formData.ncm,
      cfop_padrao: formData.cfop_padrao,
      cst_icms: formData.cst_icms,
      origem: formData.origem,
      unidade_medida: formData.unidade_medida,
      preco_custo: parseToNumber(formData.preco_custo),
      preco_varejo: parseToNumber(formData.preco_varejo),
      habilita_atacado_geral: formData.habilita_atacado_geral,
      preco_atacado_geral: parseToNumber(formData.preco_atacado_geral),
      habilita_atacado_grade: formData.habilita_atacado_grade,
      preco_atacado_grade: parseToNumber(formData.preco_atacado_grade),
      qtd_minima_atacado_grade: parseToNumber(formData.qtd_minima_atacado_grade),
      grade_atacado_id: formData.grade_atacado_id && formData.grade_atacado_id !== 'null' ? Number(formData.grade_atacado_id) : null,
      imagem_principal,
      video_url,
      imagens_galeria
    }]).select().single();

    if (prodErr) throw new Error(prodErr.message);

    // 3. Inserir Variações
    if (formData.variacoes?.length) {
      const vars = formData.variacoes.map(v => ({
        produto_id: prod.id,
        tamanho: v.tamanho,
        estoque: parseToNumber(v.estoque),
        sku: v.sku || '',
        codigo_barras: v.codigo_barras || '',
        peso_kg: parseToNumber(v.peso_kg),
        altura_cm: parseToNumber(v.altura_cm),
        largura_cm: parseToNumber(v.largura_cm),
        comprimento_cm: parseToNumber(v.comprimento_cm)
      }));
      const { error: varErr } = await supabase.from('produto_variacoes').insert(vars);
      if (varErr) throw new Error(varErr.message);
    }

    // 4. Inserir Composição do Atacado Grade
    if (formData.habilita_atacado_grade && formData.composicao_atacado?.length) {
      const comp = formData.composicao_atacado.filter(c => parseToNumber(c.quantidade) > 0).map(c => ({
        produto_id: prod.id,
        tamanho: c.tamanho,
        quantidade: parseToNumber(c.quantidade)
      }));
      if (comp.length > 0) {
        const { error: compErr } = await supabase.from('produto_atacado_grade_composicao').insert(comp);
        if (compErr) throw new Error(compErr.message);
      }
    }

    toast.success('Produto criado com sucesso!', { id: toastId });
    return prod;

  } catch (error: any) {
    toast.error('Falha ao criar o produto.', { id: toastId, description: error.message });
    throw error;
  }
}

async function updateProduct(formData: ProductFormDTO): Promise<Product> {
  if (!formData.id) throw new Error("ID obrigatório.");
  const toastId = toast.loading("Enviando mídia e atualizando produto...");

  try {
    const { data: oldProd } = await supabase.from('produtos').select('*').eq('id', formData.id).single();

    let imagem_principal = oldProd?.imagem_principal || '';
    if (formData.imagem_principal_file) {
      imagem_principal = await uploadMediaToSupabase(formData.imagem_principal_file);
    }
    let video_url = oldProd?.video_url || '';
    if (formData.video_file) {
      video_url = await uploadMediaToSupabase(formData.video_file);
    }
    let imagens_galeria = oldProd?.imagens_galeria || [];
    if (formData.imagens_galeria_files && formData.imagens_galeria_files.length > 0) {
      const newImages = await Promise.all(formData.imagens_galeria_files.map(f => uploadMediaToSupabase(f)));
      imagens_galeria = [...imagens_galeria, ...newImages];
    }

    const { data: prod, error: prodErr } = await supabase.from('produtos').update({
      nome: formData.nome,
      categoria_id: formData.categoria_id ? Number(formData.categoria_id) : null,
      grade_id: formData.grade_id ? Number(formData.grade_id) : null,
      subcategoria_id: formData.subcategoria_id ? Number(formData.subcategoria_id) : null,
      marca_id: formData.marca_id ? Number(formData.marca_id) : null,
      ncm: formData.ncm,
      cfop_padrao: formData.cfop_padrao,
      cst_icms: formData.cst_icms,
      origem: formData.origem,
      unidade_medida: formData.unidade_medida,
      preco_custo: parseToNumber(formData.preco_custo),
      preco_varejo: parseToNumber(formData.preco_varejo),
      habilita_atacado_geral: formData.habilita_atacado_geral,
      preco_atacado_geral: parseToNumber(formData.preco_atacado_geral),
      habilita_atacado_grade: formData.habilita_atacado_grade,
      preco_atacado_grade: parseToNumber(formData.preco_atacado_grade),
      qtd_minima_atacado_grade: parseToNumber(formData.qtd_minima_atacado_grade),
      grade_atacado_id: formData.grade_atacado_id && formData.grade_atacado_id !== 'null' ? Number(formData.grade_atacado_id) : null,
      imagem_principal,
      video_url,
      imagens_galeria
    }).eq('id', formData.id).select().single();

    if (prodErr) throw new Error(prodErr.message);

    // Upsert Variacoes (Atualiza os existentes, insere novos)
    if (formData.variacoes?.length) {
      const vars = formData.variacoes.map(v => ({
        ...(v.id ? { id: v.id } : {}), // Se tiver ID, atualiza
        produto_id: prod.id,
        tamanho: v.tamanho,
        estoque: parseToNumber(v.estoque),
        sku: v.sku || '',
        codigo_barras: v.codigo_barras || '',
        peso_kg: parseToNumber(v.peso_kg),
        altura_cm: parseToNumber(v.altura_cm),
        largura_cm: parseToNumber(v.largura_cm),
        comprimento_cm: parseToNumber(v.comprimento_cm)
      }));
      const { error: varErr } = await supabase.from('produto_variacoes').upsert(vars);
      if (varErr) throw new Error(varErr.message);
    }

    // Recria a composição do atacado
    await supabase.from('produto_atacado_grade_composicao').delete().eq('produto_id', prod.id);
    if (formData.habilita_atacado_grade && formData.composicao_atacado?.length) {
      const comp = formData.composicao_atacado.filter(c => parseToNumber(c.quantidade) > 0).map(c => ({
        produto_id: prod.id,
        tamanho: c.tamanho,
        quantidade: parseToNumber(c.quantidade)
      }));
      if (comp.length > 0) {
        const { error: compErr } = await supabase.from('produto_atacado_grade_composicao').insert(comp);
        if (compErr) throw new Error(compErr.message);
      }
    }

    toast.success('Produto atualizado com sucesso!', { id: toastId });
    return prod;

  } catch (error: any) {
    toast.error('Falha ao atualizar o produto.', { id: toastId, description: error.message });
    throw error;
  }
}

async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('produtos').delete().eq('id', id);
  if (error) throw new Error(error.message);
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (variables.id) queryClient.invalidateQueries({ queryKey: ['product', String(variables.id)] });
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
    onError: (err) => toast.error('Falha ao excluir o produto.', { description: err.message }),
  });
}