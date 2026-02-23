import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/use-products';
import { DollarSign, Package, AlertTriangle, TrendingDown } from 'lucide-react';
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

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-card rounded-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Falha ao carregar dados</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Não foi possível conectar ao servidor. Por favor, tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6 tracking-tighter">Painel de Controle</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-28 mt-1" />
            ) : (
              <div className="text-4xl font-bold text-primary">{stats.totalProducts}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Produtos cadastrados no sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Estoque Baixo</CardTitle>
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20 mt-1" />
            ) : (
              <div className="text-4xl font-bold text-warning">{stats.lowStockProducts}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Produtos com estoque abaixo do mínimo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendas Hoje (mock)</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground mt-1">
              Endpoint de vendas não disponível
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-background rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Gráfico de vendas (em breve)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}