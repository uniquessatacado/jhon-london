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

// Busca todas as subcategorias (para combos gerais)
async function fetchAllSubcategories(): Promise<Subcategory[]> {
  const { data } = await api.get('/subcategorias');
  return data;
}

export function useAllSubcategories() {
  return useQuery({
    queryKey: ['all-subcategories'],
    queryFn: fetchAllSubcategories,
  });
}

// Busca subcategorias filtradas por categoria (para árvore/config)
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