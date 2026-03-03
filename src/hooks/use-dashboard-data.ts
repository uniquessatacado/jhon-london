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

// Consolidated hook for all dashboard data
export function useDashboardData(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard-data', filters],
    queryFn: async () => {
      const queryParams = buildParams(filters);
      
      const [
        metricsRes,
        recentSalesRes,
        biggestOrdersRes,
        newCustomersRes,
        eliteCustomersRes,
        topProductsRes
      ] = await Promise.all([
        api.get<DashboardMetrics>('/dashboard/metricas', queryParams),
        api.get<Sale[]>('/dashboard/ultimas-vendas', queryParams),
        api.get<Sale[]>('/dashboard/maiores-pedidos', queryParams),
        api.get<Customer[]>('/dashboard/novos-clientes', queryParams),
        api.get<Customer[]>('/dashboard/elite-clientes', queryParams),
        api.get<ProductMetric[]>('/dashboard/produtos-mais-vendidos', queryParams)
      ]);

      return {
        metrics: metricsRes.data,
        recentSales: recentSalesRes.data,
        biggestOrders: biggestOrdersRes.data,
        newCustomers: newCustomersRes.data,
        eliteCustomers: eliteCustomersRes.data,
        topProducts: topProductsRes.data,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}