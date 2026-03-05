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
      // Se depois de dar o parse, ainda for uma string (JSON duplo salvo errado no banco)
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

async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get('/produtos');
  
  if (!Array.isArray(data)) return [];

  // Intercepta e higieniza a lista inteira de produtos
  return data.map((p: any) => ({
    ...p,
    variacoes: safeParseArray(p.variacoes),
    dimensoes_grade: safeParseArray(p.dimensoes_grade),
    imagens_galeria: safeParseArray(p.imagens_galeria),
    composicao_atacado_grade: safeParseArray(p.composicao_atacado_grade)
  }));
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}