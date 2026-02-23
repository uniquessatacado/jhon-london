import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { Loader, AlertCircle } from 'lucide-react';

export function ApiStatusPage() {
  const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts, refetch: refetchProducts } = useProducts();
  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories, refetch: refetchCategories } = useCategories();
  const { data: brands, isLoading: isLoadingBrands, isError: isErrorBrands, refetch: refetchBrands } = useBrands();

  const [showProducts, setShowProducts] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showBrands, setShowBrands] = useState(false);

  const handleFetchProducts = () => {
    refetchProducts();
    setShowProducts(true);
  };

  const handleFetchCategories = () => {
    refetchCategories();
    setShowCategories(true);
  };

  const handleFetchBrands = () => {
    refetchBrands();
    setShowBrands(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Status da API</h1>
        <p className="text-muted-foreground">
          Visualize os dados brutos recebidos dos endpoints da sua API.
        </p>
      </div>
      <div className="space-y-6">
        {/* Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>Endpoint: /api/produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleFetchProducts} disabled={isLoadingProducts}>
              {isLoadingProducts ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              Carregar Dados de Produtos
            </Button>
            {showProducts && (
              <div className="mt-4 p-4 rounded-lg bg-background max-h-96 overflow-auto">
                {isLoadingProducts && <p>Carregando...</p>}
                {isErrorProducts && <p className="text-destructive flex items-center"><AlertCircle className="mr-2 h-4 w-4" />Erro ao buscar dados.</p>}
                {products && <pre>{JSON.stringify(products, null, 2)}</pre>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>Endpoint: /api/categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleFetchCategories} disabled={isLoadingCategories}>
              {isLoadingCategories ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              Carregar Dados de Categorias
            </Button>
            {showCategories && (
              <div className="mt-4 p-4 rounded-lg bg-background max-h-96 overflow-auto">
                {isLoadingCategories && <p>Carregando...</p>}
                {isErrorCategories && <p className="text-destructive flex items-center"><AlertCircle className="mr-2 h-4 w-4" />Erro ao buscar dados.</p>}
                {categories && <pre>{JSON.stringify(categories, null, 2)}</pre>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Marcas */}
        <Card>
          <CardHeader>
            <CardTitle>Marcas</CardTitle>
            <CardDescription>Endpoint: /api/marcas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleFetchBrands} disabled={isLoadingBrands}>
              {isLoadingBrands ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              Carregar Dados de Marcas
            </Button>
            {showBrands && (
              <div className="mt-4 p-4 rounded-lg bg-background max-h-96 overflow-auto">
                {isLoadingBrands && <p>Carregando...</p>}
                {isErrorBrands && <p className="text-destructive flex items-center"><AlertCircle className="mr-2 h-4 w-4" />Erro ao buscar dados.</p>}
                {brands && <pre>{JSON.stringify(brands, null, 2)}</pre>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}