import { useState } from 'react';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  TrendingUp, 
  MousePointerClick 
} from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SalesList } from '@/components/dashboard/SalesList';
import { CustomerList } from '@/components/dashboard/CustomerList';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { 
  useDashboardMetrics,
  useRecentSales,
  useBiggestOrders,
  useNewCustomers,
  useEliteCustomers,
  useTopProducts
} from '@/hooks/use-dashboard-data';
import { DashboardFilters } from '@/types/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { UserPermissions } from '@/types/auth';

export function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: 'este_mes',
    tipo: 'tudo',
  });

  // Data Fetching with individual hooks
  const { data: metrics, isLoading: isLoadingMetrics, refetch: refetchMetrics } = useDashboardMetrics(filters);
  const { data: recentSales, isLoading: isLoadingRecentSales, refetch: refetchRecentSales } = useRecentSales(filters);
  const { data: biggestOrders, isLoading: isLoadingBiggestOrders, refetch: refetchBiggestOrders } = useBiggestOrders(filters);
  const { data: newCustomers, isLoading: isLoadingNewCustomers, refetch: refetchNewCustomers } = useNewCustomers(filters);
  const { data: eliteCustomers, isLoading: isLoadingEliteCustomers, refetch: refetchEliteCustomers } = useEliteCustomers(filters);
  const { data: topProducts, isLoading: isLoadingTopProducts, refetch: refetchTopProducts } = useTopProducts(filters);

  const handleRefresh = () => {
    // Refetch all queries
    refetchMetrics();
    refetchRecentSales();
    refetchBiggestOrders();
    refetchNewCustomers();
    refetchEliteCustomers();
    refetchTopProducts();
  };

  const formatCurrency = (val: number | undefined) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // Helper para verificar permissão
  const canSee = (key: keyof UserPermissions) => {
    if (user?.role === 'admin') return true;
    return user?.permissoes?.[key];
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER & FILTERS */}
      <DashboardHeader 
        filters={filters} 
        onFilterChange={setFilters} 
        onRefresh={handleRefresh} 
      />

      {/* PRIMARY METRICS (ROW 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {canSee('dash_faturamento') && (
            <MetricCard 
                title="Faturamento" 
                value={formatCurrency(metrics?.faturamento)} 
                icon={DollarSign} 
                isLoading={isLoadingMetrics}
                color="emerald"
            />
        )}
        {canSee('dash_lucro') && (
            <MetricCard 
                title="Lucro Bruto" 
                value={formatCurrency(metrics?.lucro_bruto)} 
                icon={TrendingUp} 
                isLoading={isLoadingMetrics}
                color="blue"
            />
        )}
        {canSee('dash_custo') && (
            <MetricCard 
                title="Custo Total" 
                value={formatCurrency(metrics?.custo)} 
                icon={CreditCard} 
                isLoading={isLoadingMetrics}
                color="orange"
            />
        )}
        {canSee('dash_ticket') && (
            <MetricCard 
                title="Ticket Médio" 
                value={formatCurrency(metrics?.ticket_medio)} 
                icon={ShoppingCart} 
                isLoading={isLoadingMetrics}
                color="purple"
            />
        )}
      </div>

      {/* SECONDARY METRICS (ROW 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {canSee('dash_pedidos') && (
            <MetricCard 
                title="Total de Pedidos" 
                value={metrics?.total_pedidos || 0} 
                icon={Package} 
                isLoading={isLoadingMetrics}
                subtext="Vendas finalizadas no período"
                color="emerald"
            />
        )}
        {canSee('dash_media_items') && (
            <MetricCard 
                title="Média Prod./Pedido" 
                value={metrics?.media_produtos_pedido || 0} 
                icon={Package} 
                isLoading={isLoadingMetrics}
                subtext="Itens por carrinho"
                color="blue"
            />
        )}
        {canSee('dash_visitas') && (
            <MetricCard 
                title="Visitas ao Site" 
                value={metrics?.visitas_site || 0} 
                icon={MousePointerClick} 
                isLoading={isLoadingMetrics}
                subtext="Sessões únicas"
                color="purple"
            />
        )}
      </div>

      {/* SALES & ORDERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[450px]">
         {canSee('dash_vendas_recentes') && (
             <SalesList 
                title="Últimas Vendas" 
                sales={recentSales} 
                isLoading={isLoadingRecentSales} 
                type="recent"
             />
         )}
         {canSee('dash_maiores_pedidos') && (
             <SalesList 
                title="Maiores Pedidos" 
                sales={biggestOrders} 
                isLoading={isLoadingBiggestOrders} 
                type="biggest"
             />
         )}
      </div>

      {/* CUSTOMERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
          {canSee('dash_novos_clientes') && (
              <CustomerList 
                 title="Novos Clientes" 
                 customers={newCustomers} 
                 isLoading={isLoadingNewCustomers} 
                 type="new"
              />
          )}
          {canSee('dash_clientes_elite') && (
              <CustomerList 
                 title="Clientes Elite (Top 5)" 
                 customers={eliteCustomers} 
                 isLoading={isLoadingEliteCustomers} 
                 type="elite"
              />
          )}
      </div>

      {/* TOP PRODUCTS */}
      {canSee('dash_top_produtos') && (
        <TopProducts products={topProducts} isLoading={isLoadingTopProducts} />
      )}
    </div>
  );
}