import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardMetrics, Sale, Customer, ProductMetric, DashboardFilters } from '@/types/dashboard';

// Helper to build query string
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

const queryConfig = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  placeholderData: (previousData: any) => previousData,
};

// --- Individual Hooks ---

export function useDashboardMetrics(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard-metrics', filters],
    queryFn: async () => {
      const { data } = await api.get<DashboardMetrics>('/dashboard/metricas', buildParams(filters));
      return data;
    },
    ...queryConfig,
  });
}

export function useRecentSales(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard-recent-sales', filters],
    queryFn: async () => {
      const { data } = await api.get<Sale[]>('/dashboard/ultimas-vendas', buildParams(filters));
      return data;
    },
    ...queryConfig,
  });
}

export function useBiggestOrders(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard-biggest-orders', filters],
    queryFn: async () => {
      const { data } = await api.get<Sale[]>('/dashboard/maiores-pedidos', buildParams(filters));
      return data;
    },
    ...queryConfig,
  });
}

export function useNewCustomers(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard-new-customers', filters],
    queryFn: async () => {
      const { data } = await api.get<Customer[]>('/dashboard/novos-clientes', buildParams(filters));
      return data;
    },
    ...queryConfig,
  });
}

export function useEliteCustomers(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard-elite-customers', filters],
    queryFn: async () => {
      const { data } = await api.get<Customer[]>('/dashboard/elite-clientes', buildParams(filters));
      return data;
    },
    ...queryConfig,
  });
}

export function useTopProducts(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard-top-products', filters],
    queryFn: async () => {
      const { data } = await api.get<ProductMetric[]>('/dashboard/produtos-mais-vendidos', buildParams(filters));
      return data;
    },
    ...queryConfig,
  });
}