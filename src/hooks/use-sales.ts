import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SaleWithDetails {
  id: number;
  created_at: string;
  cliente_id: number;
  valor_total: number;
  status: string;
  tipo_venda: 'varejo' | 'atacado_geral' | 'atacado_grade';
  origem: string;
  itens_count: number;
  clientes: {
    nome: string;
  } | null;
}

export interface SalesFilters {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  saleType?: string;
}

async function fetchSales(filters: SalesFilters): Promise<SaleWithDetails[]> {
  let query = supabase
    .from('vendas')
    .select(`
      id, created_at, cliente_id, valor_total, status, tipo_venda, origem, itens_count,
      clientes ( nome )
    `)
    .order('created_at', { ascending: false });

  if (filters.searchTerm) {
    query = query.or(`id::text.eq.${filters.searchTerm},clientes.nome.ilike.%${filters.searchTerm}%`);
  }
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', `${filters.endDate}T23:59:59`);
  }
  if (filters.saleType && filters.saleType !== 'todos') {
    query = query.eq('tipo_venda', filters.saleType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching sales:", error);
    throw new Error(error.message);
  }

  return data as unknown as SaleWithDetails[];
}

export function useSales(filters: SalesFilters) {
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: () => fetchSales(filters),
  });
}