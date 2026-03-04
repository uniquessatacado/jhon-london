import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardMetrics, Sale, Customer, ProductMetric, DashboardFilters } from '@/types/dashboard';

const buildParams = (filters: DashboardFilters) => {
  const params: any = { tipo: filters.tipo };
  if (filters.periodo === 'customizado' && filters.data_inicio && filters.data_fim) {
    params.data_inicio = filters.data_inicio;
    params.data_fim = filters.data_fim;
  } else {
    params.periodo = filters.periodo;
  }
  return { params };
};

// Carregamento paralelo com Promise.all para máxima velocidade
async function fetchAllDashboardData(filters: DashboardFilters) {
  const params = buildParams(filters);

  const [
    metricsRes,
    recentSalesRes,
    biggestOrdersRes,
    newCustomersRes,
    eliteCustomersRes,
    topProductsRes
  ] = await Promise.all([
    api.get<DashboardMetrics>('/dashboard/metricas', params),
    api.get<Sale[]>('/dashboard/ultimas-vendas', params),
    api.get<Sale[]>('/dashboard/maiores-pedidos', params),
    api.get<Customer[]>('/dashboard/novos-clientes', params),
    api.get<Customer[]>('/dashboard/elite-clientes', params),
    api.get<ProductMetric[]>('/dashboard/produtos-mais-vendidos', params)
  ]);

  return {
    metrics: metricsRes.data,
    recentSales: recentSalesRes.data,
    biggestOrders: biggestOrdersRes.data,
    newCustomers: newCustomersRes.data,
    eliteCustomers: eliteCustomersRes.data,
    topProducts: topProductsRes.data,
  };
}

export function useDashboardData(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard-all', filters],
    queryFn: () => fetchAllDashboardData(filters),
    staleTime: 2 * 60 * 1000, 
    gcTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}