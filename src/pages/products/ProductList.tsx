import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Search, Filter, X, PackageOpen, Eye, PackagePlus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/use-products';
import { useCreateProduct, useDeleteProduct } from '@/hooks/use-create-product'; // Corrected import
import { useCategories, useSubcategories } from '@/hooks/use-categories';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/types';
import { ViewProductDialog } from '@/components/products/ViewProductDialog';
import { StockReplenishmentDialog } from '@/components/products/StockReplenishmentDialog';

export function ProductListPage() {
  const { data: products, isLoading, isError } = useProducts();
  const { data: categories } = useCategories();
  const { mutate: deleteProduct } = useDeleteProduct();
  
  // Estados de Filtro
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterSub, setFilterSub] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado do Modal de Visualização
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Estado do Modal de Reposição
  const [replenishProduct, setReplenishProduct] = useState<Product | null>(null);
  const [isReplenishOpen, setIsReplenishOpen] = useState(false);

  // Subcategorias filtradas pela categoria selecionada no filtro
  const { data: subcategories } = useSubcategories(filterCat !== 'all' ? Number(filterCat) : null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleViewProduct = (product: Product) => {
    setViewProduct(product);
    setIsViewOpen(true);
  };

  const handleReplenishProduct = (product: Product) => {
    setReplenishProduct(product);
    setIsReplenishOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    deleteProduct(id);
  };

  // Lógica de Filtragem no Frontend
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(p => {
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === 'all' || String(p.categoria_id) === filterCat;
        const matchSub = filterSub === 'all' || String(p.subcategoria_id) === filterSub;
        
        return matchSearch && matchCat && matchSub;
    });
  }, [products, search, filterCat, filterSub]);

  // Reset de subcategoria se categoria mudar
  const handleCatChange = (val: string) => {
    setFilterCat(val);
    setFilterSub('all');
  };

  // Helper para calcular estoque total das variações
  const getTotalStock = (product: Product) => {
    if (product.variacoes && product.variacoes.length > 0) {
        return product.variacoes.reduce((acc, v) => acc + (Number(v.estoque) || 0), 0);
    }
    return Number(product.estoque) || 0;
  };

  // Helper para iniciais
  const getInitials = (name: string) => {
      return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Produtos</h1>
          <p className="text-muted-foreground">Gerenciamento de catálogo e estoque.</p>
        </div>
        <Link to="/produtos/novo">
          <Button className="rounded-xl h-10 px-6 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      {/* CONTAINER PRINCIPAL */}
      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/5">
        
        {/* BARRA DE FERRAMENTAS */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 bg-white/[0.02]">
           <div className="relative flex-1 group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                    placeholder="Buscar por nome..." 
                    className="pl-9 bg-black/20 border-white/10 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all h-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
           </div>
           <Button 
                variant={showFilters ? "secondary" : "outline"} 
                onClick={() => setShowFilters(!showFilters)}
                className={`rounded-xl border-white/10 h-10 transition-all ${showFilters ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-black/20 hover:bg-white/5 text-muted-foreground hover:text-white'}`}
           >
                <Filter className="mr-2 h-4 w-4" /> Filtros
           </Button>
        </div>
        
        {/* ÁREA DE FILTROS */}
        {showFilters && (
            <div className="p-6 bg-black/40 border-b border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                    <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Categoria</span>
                    <Select value={filterCat} onValueChange={handleCatChange}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-lg"><SelectValue placeholder="Todas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Subcategoria</span>
                    <Select value={filterSub} onValueChange={setFilterSub} disabled={filterCat === 'all'}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-lg"><SelectValue placeholder="Todas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {subcategories?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button variant="ghost" onClick={() => { setFilterCat('all'); setFilterSub('all'); setSearch(''); }} className="w-full text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                        <X className="mr-2 h-4 w-4" /> Limpar Filtros
                    </Button>
                </div>
            </div>
        )}

        <div className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.03]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[80px] pl-6">Foto</TableHead>
                <TableHead className="text-emerald-500 font-semibold w-[50px]">ID</TableHead>
                <TableHead className="text-emerald-500 font-semibold">Produto</TableHead>
                <TableHead className="text-emerald-500 font-semibold">Categoria / Sub</TableHead>
                <TableHead className="text-right text-emerald-500 font-semibold">Estoque</TableHead>
                <TableHead className="text-right text-emerald-500 font-semibold pr-6">Preço</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5 hover:bg-white/5">
                    <TableCell className="pl-6"><Skeleton className="h-10 w-10 rounded-lg bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48 bg-white/10 mb-2" /><Skeleton className="h-3 w-24 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto bg-white/10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto bg-white/10" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map(product => {
                    const totalEstoque = getTotalStock(product);
                    
                    return (
                      <TableRow key={product.id} className="border-white/5 hover:bg-white/[0.04] transition-colors group">
                        <TableCell className="pl-6 py-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                                {product.imagem_principal ? (
                                    <img src={product.imagem_principal} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                                        {getInitials(product.nome)}
                                    </div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="text-muted-foreground font-mono text-xs">#{product.id}</span>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-white group-hover:text-emerald-400 transition-colors">{product.nome}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                             <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-300">{product.categoria_nome || categories?.find(c => c.id === product.categoria_id)?.nome || '-'}</span>
                                <span className="text-xs text-muted-foreground">{product.subcategoria_nome || '-'}</span> 
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge 
                                variant="outline" 
                                className={`rounded-lg border px-3 py-1 font-mono ${
                                    totalEstoque > product.estoque_minimo 
                                    ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                                    : 'bg-red-500/5 text-red-400 border-red-500/20'
                                }`}
                            >
                                {totalEstoque} un
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                            <span className="text-emerald-400 font-mono font-medium text-base">
                                {formatCurrency(product.preco_varejo)}
                            </span>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-zinc-900/95 backdrop-blur-xl border-white/10 rounded-xl w-40">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewProduct(product)} className="focus:bg-white/10 rounded-lg cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" /> Visualizar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReplenishProduct(product)} className="focus:bg-white/10 rounded-lg cursor-pointer">
                                  <PackagePlus className="mr-2 h-4 w-4" /> Repor Estoque
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="focus:bg-white/10 rounded-lg cursor-pointer">
                                  <Link to={`/produtos/editar/${product.id}`}>
                                      <Pencil className="mr-2 h-4 w-4" /> Editar
                                  </Link>
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-400 rounded-lg cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação não pode ser desfeita. Isso excluirá permanentemente o produto "{product.nome}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-64">
                    <div className="flex flex-col items-center justify-center text-muted-foreground animate-in fade-in zoom-in duration-500">
                        <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <PackageOpen className="h-8 w-8 opacity-50" />
                        </div>
                        <p className="text-lg font-medium text-white/50">Nenhum produto encontrado</p>
                        <p className="text-sm">Tente ajustar seus filtros ou cadastre um novo produto.</p>
                        <Link to="/produtos/novo" className="mt-4">
                            <Button variant="link" className="text-emerald-400">Cadastrar Agora</Button>
                        </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Modal de Visualização */}
      <ViewProductDialog 
        product={viewProduct} 
        open={isViewOpen} 
        onOpenChange={setIsViewOpen} 
      />

      {/* Modal de Reposição */}
      <StockReplenishmentDialog
        product={replenishProduct}
        open={isReplenishOpen}
        onOpenChange={setIsReplenishOpen}
      />
    </div>
  );
}