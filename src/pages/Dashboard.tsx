import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/use-products';
import { DollarSign, Package, AlertTriangle, TrendingDown, ArrowUpRight } from 'lucide-react';
import { useMemo } from 'react';

export function DashboardPage() {
  const { data: products, isLoading, isError } = useProducts();

  const stats = useMemo(() => {
    if (!products) {
      return {
        totalProducts: 0,
        lowStockProducts: 0,
      };
    }
    const lowStock = products.filter(p => p.estoque < p.estoque_minimo).length;
    return {
      totalProducts: products.length,
      lowStockProducts: lowStock,
    };
  }, [products]);

  // Estilo comum para os cards de vidro
  const glassCardClass = "bg-black/40 backdrop-blur-md border-white/10 shadow-lg hover:border-emerald-500/30 transition-colors duration-300";

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className={`text-center p-8 rounded-3xl border border-red-500/20 bg-red-950/10 backdrop-blur-sm`}>
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-400">Falha na Conexão</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Não foi possível carregar os dados do painel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Visão Geral
            </span>
        </h1>
        <p className="text-muted-foreground">Acompanhe as métricas principais do seu negócio.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card Total de Produtos */}
        <Card className={glassCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Produtos</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-28 mt-1 bg-white/5" />
            ) : (
              <div className="flex items-baseline space-x-2">
                  <div className="text-4xl font-bold text-foreground">{stats.totalProducts}</div>
                  <span className="text-emerald-500 text-xs font-medium flex items-center">+12% <ArrowUpRight className="h-3 w-3 ml-0.5" /></span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">Produtos cadastrados</p>
          </CardContent>
        </Card>

        {/* Card Estoque Baixo */}
        <Card className={glassCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alerta de Estoque</CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <Skeleton className="h-10 w-28 mt-1 bg-white/5" />
            ) : (
              <div className="flex items-baseline space-x-2">
                  <div className="text-4xl font-bold text-foreground">{stats.lowStockProducts}</div>
                  <span className="text-red-400 text-xs font-medium">Crítico</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">Abaixo do mínimo configurado</p>
          </CardContent>
        </Card>

        {/* Card Vendas (Mock) */}
        <Card className={glassCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Hoje</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-2">Integração em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Placeholder */}
      <Card className={`${glassCardClass} h-[400px]`}>
        <CardHeader>
          <CardTitle>Performance de Vendas</CardTitle>
        </CardHeader>
        <CardContent className="h-full">
          <div className="h-[300px] w-full rounded-xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
            <DollarSign className="h-12 w-12 opacity-20 mb-4" />
            <p>Gráficos em desenvolvimento...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}