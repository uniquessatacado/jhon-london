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

// Busca produto único por ID
async function fetchProduct(id: string): Promise<Product> {
  const { data } = await api.get(`/produtos/${id}`);
  return data;
}

export function useProduct(id: string | undefined) {
  // Validação estrita: só busca se ID existir E não for a string "undefined"
  const isValidId = !!id && id !== 'undefined' && id !== 'novo';

  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: isValidId, // Trava a requisição aqui se o ID for inválido
    retry: false, // Não fica tentando se der 404
  });
}