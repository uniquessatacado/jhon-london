import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Category } from '@/types';

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