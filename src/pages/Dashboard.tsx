import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/use-products';
import { DollarSign, Package, TrendingDown, ArrowUpRight, WifiOff, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

export function DashboardPage() {
  const { data: products, isLoading, isError } = useProducts();

  // Notificar erro via toast apenas uma vez quando ocorrer
  useEffect(() => {
    if (isError) {
      toast.error("Não foi possível conectar ao servidor.", {
        description: "Exibindo dados em cache ou vazios.",
        icon: <WifiOff className="h-4 w-4" />,
      });
    }
  }, [isError]);

  const stats = useMemo(() => {
    // Se der erro ou não tiver produtos, retorna zerado para não quebrar a UI
    if (!products || isError) {
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
  }, [products, isError]);

  // Estilo Glass Card atualizado
  const glassCardClass = "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border-white/10 shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300";

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Visão Geral
              </span>
          </h1>
          <p className="text-muted-foreground">Acompanhe as métricas principais do seu negócio.</p>
        </div>
        
        {/* Indicador de Status da API */}
        {isError && (
             <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm animate-pulse">
                <WifiOff className="h-4 w-4" />
                <span className="font-medium">API Offline / Falha de Conexão</span>
             </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card Total de Produtos */}
        <Card className={glassCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Produtos</CardTitle>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${isError ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                {isError ? <AlertCircle className="h-4 w-4 text-red-500" /> : <Package className="h-4 w-4 text-emerald-500" />}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-28 mt-1 bg-white/5" />
            ) : (
              <div className="flex items-baseline space-x-2">
                  <div className="text-4xl font-bold text-foreground">{stats.totalProducts}</div>
                  {!isError && <span className="text-emerald-500 text-xs font-medium flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">+12% <ArrowUpRight className="h-3 w-3 ml-0.5" /></span>}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">Produtos cadastrados</p>
          </CardContent>
        </Card>

        {/* Card Estoque Baixo */}
        <Card className={glassCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alerta de Estoque</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <TrendingDown className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <Skeleton className="h-10 w-28 mt-1 bg-white/5" />
            ) : (
              <div className="flex items-baseline space-x-2">
                  <div className="text-4xl font-bold text-foreground">{stats.lowStockProducts}</div>
                  {!isError && <span className="text-orange-400 text-xs font-medium bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">Atenção</span>}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">Abaixo do mínimo configurado</p>
          </CardContent>
        </Card>

        {/* Card Vendas (Mock) */}
        <Card className={glassCardClass}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Hoje</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
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