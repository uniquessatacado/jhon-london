import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';

async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get('/produtos');
  return data;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}
