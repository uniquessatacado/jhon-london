import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SaleItem {
  id: number;
  produto_id: number;
  tamanho: string;
  quantidade: number;
  preco_unitario: number;
  produtos: {
    nome: string;
  } | null;
}

async function fetchSaleDetails(saleId: number | null): Promise<SaleItem[]> {
  if (!saleId) return [];

  const { data, error } = await supabase
    .from('venda_itens')
    .select(`
      id,
      produto_id,
      tamanho,
      quantidade,
      preco_unitario,
      produtos ( nome )
    `)
    .eq('venda_id', saleId);

  if (error) {
    console.error("Error fetching sale details:", error);
    throw new Error(error.message);
  }

  return data as unknown as SaleItem[];
}

export function useSaleDetails(saleId: number | null) {
  return useQuery({
    queryKey: ['saleDetails', saleId],
    queryFn: () => fetchSaleDetails(saleId),
    enabled: !!saleId,
  });
}