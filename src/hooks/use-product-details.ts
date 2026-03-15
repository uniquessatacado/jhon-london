import { useQuery } from '@tanstack/react-query';
import { supabase, getProductImageUrl } from '@/lib/supabase';
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
  const { data, error } = await supabase
    .from('produtos')
    .select(`
      *,
      variacoes:produto_variacoes (*),
      composicao_atacado_grade:produto_atacado_grade_composicao (*),
      grades (
        id, nome,
        grade_tamanhos (*)
      ),
      categorias (nome),
      subcategorias (nome),
      marcas (nome)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const dimensoes_grade = data.grades?.grade_tamanhos || [];

  return {
    ...data,
    categoria_nome: data.categorias?.nome || '',
    subcategoria_nome: data.subcategorias?.nome || '',
    marca_nome: data.marcas?.nome || '',
    grade_nome: data.grades?.nome || '',
    variacoes: safeParseArray(data.variacoes),
    dimensoes_grade: safeParseArray(dimensoes_grade),
    imagens_galeria: safeParseArray(data.imagens_galeria),
    composicao_atacado_grade: safeParseArray(data.composicao_atacado_grade),
    imagem_principal: getProductImageUrl(data.imagem_principal),
  } as Product;
}

export function useProductDetails(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
  });
}
