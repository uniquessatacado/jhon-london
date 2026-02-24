import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductListPage() {
  const { data: products, isLoading, isError } = useProducts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerenciamento de catálogo e estoque.</p>
        </div>
        <Link to="/produtos/novo">
          <Button className="rounded-xl h-10 px-6 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/10 flex gap-4">
           <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar produtos..." 
                    className="pl-9 bg-white/5 border-white/10 rounded-xl focus:ring-emerald-500/20"
                />
           </div>
           <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
                <Filter className="mr-2 h-4 w-4" /> Filtros
           </Button>
        </div>
        
        <div className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-emerald-500 font-semibold">Status</TableHead>
                <TableHead className="text-emerald-500 font-semibold">Nome</TableHead>
                <TableHead className="text-emerald-500 font-semibold">SKU</TableHead>
                <TableHead className="text-right text-emerald-500 font-semibold">Estoque</TableHead>
                <TableHead className="text-right text-emerald-500 font-semibold">Preço Varejo</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5 hover:bg-white/5">
                    <TableCell><Skeleton className="h-6 w-20 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-48 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 bg-white/10" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto bg-white/10" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto bg-white/10" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-red-400">
                    Falha ao carregar produtos. Verifique sua conexão.
                  </TableCell>
                </TableRow>
              ) : products && products.length > 0 ? (
                products.map(product => (
                  <TableRow key={product.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`rounded-lg border-0 px-3 py-1 ${
                            product.estoque > product.estoque_minimo 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : product.estoque > 0 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {product.estoque > product.estoque_minimo ? 'Em estoque' : product.estoque > 0 ? 'Estoque baixo' : 'Fora de estoque'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-white">{product.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                    <TableCell className="text-right text-white font-mono">{product.estoque}</TableCell>
                    <TableCell className="text-right text-emerald-400 font-mono font-medium">{formatCurrency(product.preco_varejo)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" className="hover:bg-white/10 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-xl border-white/10 rounded-xl">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem className="focus:bg-white/10 rounded-lg cursor-pointer"><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-400 rounded-lg cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}