import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Category, Subcategory } from '@/types';
import { toast } from 'sonner';

async function createCategory(newCategory: { nome: string }): Promise<Category> {
  const { data, error } = await supabase.from('categorias').insert([newCategory]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Categoria criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => toast.error('Falha ao criar categoria.', { description: err.message }),
  });
}

async function updateCategory({ id, ...updatedCategory }: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase.from('categorias').update({ nome: updatedCategory.nome }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success('Categoria atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => toast.error('Falha ao atualizar categoria.', { description: err.message }),
  });
}

async function deleteCategory(id: number): Promise<void> {
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Categoria excluída!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => toast.error('Falha ao excluir categoria.', { description: err.message }),
  });
}

async function createSubcategory(newSub: Omit<Subcategory, 'id'>): Promise<Subcategory> {
  const { data, error } = await supabase.from('subcategorias').insert([{
    nome: newSub.nome, ncm: newSub.ncm, cfop_padrao: newSub.cfop_padrao, cst_icms: newSub.cst_icms,
    origem: newSub.origem, unidade_medida: newSub.unidade_medida, categoria_id: newSub.categoria_id,
    grade_id: newSub.grade_id && String(newSub.grade_id) !== "null" ? Number(newSub.grade_id) : null
  }]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubcategory,
    onSuccess: () => {
      toast.success('Subcategoria criada!');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['all-subcategories'] });
    },
    onError: (err) => toast.error('Falha ao criar subcategoria.', { description: err.message }),
  });
}

async function updateSubcategory({ id, ...updatedSub }: Partial<Subcategory> & { id: number }): Promise<Subcategory> {
  const { data, error } = await supabase.from('subcategorias').update({
    nome: updatedSub.nome, ncm: updatedSub.ncm, cfop_padrao: updatedSub.cfop_padrao, cst_icms: updatedSub.cst_icms,
    origem: updatedSub.origem, unidade_medida: updatedSub.unidade_medida, categoria_id: updatedSub.categoria_id,
    grade_id: updatedSub.grade_id && String(updatedSub.grade_id) !== "null" ? Number(updatedSub.grade_id) : null
  }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export function useUpdateSubcategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSubcategory,
    onSuccess: () => {
      toast.success('Subcategoria atualizada!');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['all-subcategories'] });
    },
    onError: (err) => toast.error('Falha ao atualizar subcategoria.', { description: err.message }),
  });
}

async function deleteSubcategory(id: number): Promise<void> {
  const { error } = await supabase.from('subcategorias').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSubcategory,
    onSuccess: () => {
      toast.success('Subcategoria excluída!');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['all-subcategories'] });
    },
    onError: (err) => toast.error('Falha ao excluir subcategoria.', { description: err.message }),
  });
}