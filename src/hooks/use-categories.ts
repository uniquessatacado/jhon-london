import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Category, Subcategory } from '@/types';

async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get('/categorias');
  return data;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
}

async function fetchSubcategories(categoryId: number | null): Promise<Subcategory[]> {
  if (!categoryId) return [];
  const { data } = await api.get(`/subcategorias?categoria_id=${categoryId}`);
  return data;
}

export function useSubcategories(categoryId: number | null) {
  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: () => fetchSubcategories(categoryId),
    enabled: !!categoryId, // Só busca se tiver ID selecionado
  });
}