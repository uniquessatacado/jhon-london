import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';

// Higienizador BLINDADO: Garante que o retorno seja SEMPRE um Array
const safeParseArray = (value: any): any[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'string') {
        try {
          const doubleParsed = JSON.parse(parsed);
          return Array.isArray(doubleParsed) ? doubleParsed : [];
        } catch {
          return [];
        }
      }
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  
  return [];
};

async function fetchProduct(id: string): Promise<Product> {
  const { data } = await api.get(`/produtos/${id}`);
  
  // Intercepta e higieniza os dados antes de entregar para a tela
  return {
    ...data,
    variacoes: safeParseArray(data.variacoes),
    dimensoes_grade: safeParseArray(data.dimensoes_grade),
    imagens_galeria: safeParseArray(data.imagens_galeria),
    composicao_atacado_grade: safeParseArray(data.composicao_atacado_grade)
  };
}

export function useProductDetails(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id, // Só roda se tiver ID
    staleTime: 0, // 👈 KIMI FIX: Dados ficam obsoletos imediatamente
    gcTime: 0,    // 👈 KIMI FIX: Não guarda em cache longo
    refetchOnMount: true, // 👈 KIMI FIX: Força buscar dados novos ao montar
  });
}