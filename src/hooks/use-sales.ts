import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SaleWithDetails {
  id: number;
  created_at: string;
  cliente_id: number;
  valor_total: number;
  status: string;
  tipo_venda: 'varejo' | 'atacado_geral' | 'atacado_grade';
  itens_count: number;
  clientes: {
    nome: string;
  } | null;
}

async function fetchSales(): Promise<SaleWithDetails[]> {
  const { data, error } = await supabase
    .from('vendas')
    .select(`
      id,
      created_at,
      cliente_id,
      valor_total,
      status,
      tipo_venda,
      itens_count,
      clientes ( nome )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching sales:", error);
    throw new Error(error.message);
  }

  return data as unknown as SaleWithDetails[];
}

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: fetchSales,
  });
}