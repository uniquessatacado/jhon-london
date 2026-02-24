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
    onError: () => toast.error('Falha ao criar categoria.'),
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
    onError: () => toast.error('Falha ao atualizar categoria.'),
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
    onError: () => toast.error('Falha ao excluir categoria.'),
  });
}

// --- Subcategories ---

async function createSubcategory(newSub: Omit<Subcategory, 'id'>): Promise<Subcategory> {
  const { data } = await api.post('/subcategorias', newSub);
  return data;
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubcategory,
    onSuccess: (_, variables) => {
      toast.success('Subcategoria criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['subcategories', variables.categoria_id] });
    },
    onError: () => toast.error('Falha ao criar subcategoria.'),
  });
}

// Nota: Adicione update/delete subcategory se o backend suportar, mas o foco é a criação conforme prompt.