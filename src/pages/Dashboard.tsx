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

export function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: 'este_mes',
    tipo: 'tudo',
  });

  // Data Fetching
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useDashboardMetrics(filters);
  const { data: recentSales, isLoading: loadingRecent, refetch: refetchRecent } = useRecentSales(filters);
  const { data: biggestOrders, isLoading: loadingBiggest, refetch: refetchBiggest } = useBiggestOrders(filters);
  const { data: newCustomers, isLoading: loadingNewCust, refetch: refetchNewCust } = useNewCustomers(filters);
  const { data: eliteCustomers, isLoading: loadingElite, refetch: refetchElite } = useEliteCustomers(filters);
  const { data: topProducts, isLoading: loadingTopProd, refetch: refetchTopProd } = useTopProducts(filters);

  const handleRefresh = () => {
    refetchMetrics();
    refetchRecent();
    refetchBiggest();
    refetchNewCust();
    refetchElite();
    refetchTopProd();
  };

  const formatCurrency = (val: number | undefined) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

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
        <MetricCard 
            title="Faturamento" 
            value={formatCurrency(metrics?.faturamento)} 
            icon={DollarSign} 
            isLoading={loadingMetrics}
            color="emerald"
        />
        <MetricCard 
            title="Lucro Bruto" 
            value={formatCurrency(metrics?.lucro_bruto)} 
            icon={TrendingUp} 
            isLoading={loadingMetrics}
            color="blue"
        />
        <MetricCard 
            title="Custo Total" 
            value={formatCurrency(metrics?.custo)} 
            icon={CreditCard} 
            isLoading={loadingMetrics}
            color="orange"
        />
        <MetricCard 
            title="Ticket Médio" 
            value={formatCurrency(metrics?.ticket_medio)} 
            icon={ShoppingCart} 
            isLoading={loadingMetrics}
            color="purple"
        />
      </div>

      {/* SECONDARY METRICS (ROW 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
            title="Total de Pedidos" 
            value={metrics?.total_pedidos || 0} 
            icon={Package} 
            isLoading={loadingMetrics}
            subtext="Vendas finalizadas no período"
            color="emerald"
        />
        <MetricCard 
            title="Média Prod./Pedido" 
            value={metrics?.media_produtos_pedido || 0} 
            icon={Package} 
            isLoading={loadingMetrics}
            subtext="Itens por carrinho"
            color="blue"
        />
        <MetricCard 
            title="Visitas ao Site" 
            value={metrics?.visitas_site || 0} 
            icon={MousePointerClick} 
            isLoading={loadingMetrics}
            subtext="Sessões únicas"
            color="purple"
        />
      </div>

      {/* SALES & ORDERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[450px]">
         <SalesList 
            title="Últimas Vendas" 
            sales={recentSales} 
            isLoading={loadingRecent} 
            type="recent"
         />
         <SalesList 
            title="Maiores Pedidos" 
            sales={biggestOrders} 
            isLoading={loadingBiggest} 
            type="biggest"
         />
      </div>

      {/* CUSTOMERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
          <CustomerList 
             title="Novos Clientes" 
             customers={newCustomers} 
             isLoading={loadingNewCust} 
             type="new"
          />
          <CustomerList 
             title="Clientes Elite (Top 5)" 
             customers={eliteCustomers} 
             isLoading={loadingElite} 
             type="elite"
          />
      </div>

      {/* TOP PRODUCTS */}
      <TopProducts products={topProducts} isLoading={loadingTopProd} />
    </div>
  );
}