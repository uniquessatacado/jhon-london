import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';

async function fetchProduct(id: string): Promise<Product> {
  const { data } = await api.get(`/produtos/${id}`);
  return data;
}

export function useProductDetails(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id, // Only run if ID is provided
  });
}