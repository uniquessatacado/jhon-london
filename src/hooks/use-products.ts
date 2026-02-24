import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';

async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get('/produtos');
  return data;
}

async function fetchProductById(id: string): Promise<Product> {
  const { data } = await api.get(`/produtos/${id}`);
  return data;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id, // Só busca se tiver ID
  });
}