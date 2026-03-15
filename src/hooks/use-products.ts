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

async function fetchProducts(): Promise<Product[]> {
  // Busca os produtos e faz os JOINS automaticamente com as tabelas relacionadas
  const { data, error } = await supabase
    .from('produtos')
    .select(`
      *,
      variacoes:produto_variacoes (*),
      composicao_atacado_grade:produto_atacado_grade_composicao (*),
      grades (
        id,
        nome,
        grade_tamanhos (*)
      ),
      categorias (nome),
      subcategorias (nome),
      marcas (nome)
    `)
    //.eq('ativo', true) // Opcional se houver um campo ativo
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar produtos no Supabase:', error);
    throw new Error(error.message);
  }

  if (!data || !Array.isArray(data)) return [];

  // Mapeia os dados do Supabase para o formato exato que o frontend já espera
  return data.map((p: any) => {
    // Extrai as dimensões da grade, se existir
    const dimensoes_grade = p.grades?.grade_tamanhos || [];

    return {
      ...p,
      categoria_nome: p.categorias?.nome || '',
      subcategoria_nome: p.subcategorias?.nome || '',
      marca_nome: p.marcas?.nome || '',
      grade_nome: p.grades?.nome || '',
      
      // O Supabase retorna arrays nativos nos joins, mas garantimos a segurança
      variacoes: safeParseArray(p.variacoes),
      dimensoes_grade: safeParseArray(dimensoes_grade),
      imagens_galeria: safeParseArray(p.imagens_galeria),
      composicao_atacado_grade: safeParseArray(p.composicao_atacado_grade),
      
      // Converte as URLs das imagens para o formato correto do Storage público
      imagem_principal: getProductImageUrl(p.imagem_principal),
    } as Product;
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}
