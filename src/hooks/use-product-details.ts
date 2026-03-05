import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';

// Helper para garantir que campos JSON voltem como Array, mesmo se o backend mandar como String
const safeParse = (value: any, fallback: any = []) => {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value || fallback;
};

async function fetchProduct(id: string): Promise<Product> {
  const { data } = await api.get(`/produtos/${id}`);
  
  // Intercepta e higieniza os dados antes de entregar para a tela
  return {
    ...data,
    variacoes: safeParse(data.variacoes),
    dimensoes_grade: safeParse(data.dimensoes_grade),
    imagens_galeria: safeParse(data.imagens_galeria),
    composicao_atacado_grade: safeParse(data.composicao_atacado_grade)
  };
}

export function useProductDetails(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id, // Only run if ID is provided
  });
}