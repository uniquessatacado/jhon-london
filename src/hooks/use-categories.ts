import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Category, Subcategory } from '@/types';

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categorias').select('*, subcategorias(*)').order('nome');
  
  if (error) throw new Error(error.message);
  return data || [];
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
}

// Busca todas as subcategorias
async function fetchAllSubcategories(): Promise<Subcategory[]> {
  const { data, error } = await supabase.from('subcategorias').select('*').order('nome');
  
  if (error) throw new Error(error.message);
  return data || [];
}

export function useAllSubcategories() {
  return useQuery({
    queryKey: ['all-subcategories'],
    queryFn: fetchAllSubcategories,
  });
}

// Busca subcategorias filtradas por categoria
async function fetchSubcategories(categoryId: number | null): Promise<Subcategory[]> {
  if (!categoryId) return [];
  const { data, error } = await supabase
    .from('subcategorias')
    .select('*')
    .eq('categoria_id', categoryId)
    .order('nome');
    
  if (error) throw new Error(error.message);
  return data || [];
}

export function useSubcategories(categoryId: number | null) {
  return useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: () => fetchSubcategories(categoryId),
    enabled: !!categoryId,
  });
}
