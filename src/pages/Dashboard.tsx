import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/use-products';
import { DollarSign, Package, AlertTriangle } from 'lucide-react';
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
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
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
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Produtos cadastrados no sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.lowStockProducts}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Produtos com estoque abaixo do mínimo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje (mock)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">
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
            <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Gráfico de vendas (em breve)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
