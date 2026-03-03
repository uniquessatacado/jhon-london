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
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { DashboardFilters } from '@/types/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { UserPermissions } from '@/types/auth';

export function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: 'este_mes',
    tipo: 'tudo',
  });

  // Data Fetching
  const { data, isLoading, refetch } = useDashboardData(filters);

  const handleRefresh = () => {
    refetch();
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
                value={formatCurrency(data?.metrics?.faturamento)} 
                icon={DollarSign} 
                isLoading={isLoading}
                color="emerald"
            />
        )}
        {canSee('dash_lucro') && (
            <MetricCard 
                title="Lucro Bruto" 
                value={formatCurrency(data?.metrics?.lucro_bruto)} 
                icon={TrendingUp} 
                isLoading={isLoading}
                color="blue"
            />
        )}
        {canSee('dash_custo') && (
            <MetricCard 
                title="Custo Total" 
                value={formatCurrency(data?.metrics?.custo)} 
                icon={CreditCard} 
                isLoading={isLoading}
                color="orange"
            />
        )}
        {canSee('dash_ticket') && (
            <MetricCard 
                title="Ticket Médio" 
                value={formatCurrency(data?.metrics?.ticket_medio)} 
                icon={ShoppingCart} 
                isLoading={isLoading}
                color="purple"
            />
        )}
      </div>

      {/* SECONDARY METRICS (ROW 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {canSee('dash_pedidos') && (
            <MetricCard 
                title="Total de Pedidos" 
                value={data?.metrics?.total_pedidos || 0} 
                icon={Package} 
                isLoading={isLoading}
                subtext="Vendas finalizadas no período"
                color="emerald"
            />
        )}
        {canSee('dash_media_items') && (
            <MetricCard 
                title="Média Prod./Pedido" 
                value={data?.metrics?.media_produtos_pedido || 0} 
                icon={Package} 
                isLoading={isLoading}
                subtext="Itens por carrinho"
                color="blue"
            />
        )}
        {canSee('dash_visitas') && (
            <MetricCard 
                title="Visitas ao Site" 
                value={data?.metrics?.visitas_site || 0} 
                icon={MousePointerClick} 
                isLoading={isLoading}
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
                sales={data?.recentSales} 
                isLoading={isLoading} 
                type="recent"
             />
         )}
         {canSee('dash_maiores_pedidos') && (
             <SalesList 
                title="Maiores Pedidos" 
                sales={data?.biggestOrders} 
                isLoading={isLoading} 
                type="biggest"
             />
         )}
      </div>

      {/* CUSTOMERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
          {canSee('dash_novos_clientes') && (
              <CustomerList 
                 title="Novos Clientes" 
                 customers={data?.newCustomers} 
                 isLoading={isLoading} 
                 type="new"
              />
          )}
          {canSee('dash_clientes_elite') && (
              <CustomerList 
                 title="Clientes Elite (Top 5)" 
                 customers={data?.eliteCustomers} 
                 isLoading={isLoading} 
                 type="elite"
              />
          )}
      </div>

      {/* TOP PRODUCTS */}
      {canSee('dash_top_produtos') && (
        <TopProducts products={data?.topProducts} isLoading={isLoading} />
      )}
    </div>
  );
}