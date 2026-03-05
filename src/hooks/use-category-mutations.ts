import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Category, Subcategory } from '@/types';
import { toast } from 'sonner';

// --- Categories ---

async function createCategory(newCategory: { nome: string }): Promise<Category> {
  const { data } = await api.post('/categorias', newCategory);
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
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Erro desconhecido ao criar categoria.';
      toast.error('Falha ao criar categoria.', { description: msg });
    },
  });
}

async function updateCategory({ id, ...updatedCategory }: Partial<Category>): Promise<Category> {
  const { data } = await api.put(`/categorias/${id}`, updatedCategory);
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
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Erro desconhecido ao atualizar categoria.';
      toast.error('Falha ao atualizar categoria.', { description: msg });
    },
  });
}

async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`);
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success('Categoria excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Não é possível excluir categorias em uso.';
      toast.error('Falha ao excluir categoria.', { description: msg });
    },
  });
}

// --- Subcategories ---

async function createSubcategory(newSub: Omit<Subcategory, 'id'>): Promise<Subcategory> {
  const payload = {
    ...newSub,
    grade_id: newSub.grade_id && String(newSub.grade_id) !== "null" ? Number(newSub.grade_id) : null
  };
  const { data } = await api.post('/subcategorias', payload);
  return data;
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubcategory,
    onSuccess: () => {
      toast.success('Subcategoria criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['all-subcategories'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Erro desconhecido ao criar.';
      toast.error('Falha ao criar subcategoria.', { description: msg });
    },
  });
}

async function updateSubcategory({ id, ...updatedSub }: Partial<Subcategory> & { id: number }): Promise<Subcategory> {
  const payload = {
    ...updatedSub,
    grade_id: updatedSub.grade_id && String(updatedSub.grade_id) !== "null" ? Number(updatedSub.grade_id) : null
  };
  const { data } = await api.put(`/subcategorias/${id}`, payload);
  return data;
}

export function useUpdateSubcategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSubcategory,
    onSuccess: () => {
      toast.success('Subcategoria atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['all-subcategories'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Erro desconhecido ao atualizar.';
      toast.error('Falha ao atualizar subcategoria.', { description: msg });
    },
  });
}