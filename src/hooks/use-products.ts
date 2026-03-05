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

async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get('/produtos');
  
  if (!Array.isArray(data)) return [];

  // Intercepta e higieniza a lista inteira de produtos
  return data.map((p: any) => ({
    ...p,
    variacoes: safeParse(p.variacoes),
    dimensoes_grade: safeParse(p.dimensoes_grade),
    imagens_galeria: safeParse(p.imagens_galeria),
    composicao_atacado_grade: safeParse(p.composicao_atacado_grade)
  }));
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}