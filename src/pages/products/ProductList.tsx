import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Search, Filter, X, PackageOpen, Eye, PackagePlus, Copy } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/use-products';
import { useDeleteProduct } from '@/hooks/use-create-product';
import { useCategories, useSubcategories } from '@/hooks/use-categories';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/types';
import { ViewProductDialog } from '@/components/products/ViewProductDialog';
import { StockReplenishmentDialog } from '@/components/products/StockReplenishmentDialog';
import { useMediaQuery } from '@/hooks/use-media-query';
import { ProductCardMobile } from '@/components/products/ProductCardMobile';

export function ProductListPage() {
  const navigate = useNavigate();
  const { data: products, isLoading, isError } = useProducts();
  const { data: categories } = useCategories();
  const { mutate: deleteProduct } = useDeleteProduct();
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterSub, setFilterSub] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const [viewProductId, setViewProductId] = useState<number | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [replenishProduct, setReplenishProduct] = useState<Product | null>(null);
  const [isReplenishOpen, setIsReplenishOpen] = useState(false);

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data: subcategories } = useSubcategories(filterCat !== 'all' ? Number(filterCat) : null);

  const categoryMap = useMemo(() => {
    if (!categories) return {};
    return categories.reduce((acc, cat) => {
        acc[cat.id] = cat.nome;
        return acc;
    }, {} as Record<number, string>);
  }, [categories]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleViewProduct = (product: Product) => {
    setViewProductId(product.id);
    setIsViewOpen(true);
  };

  const handleViewDialogChange = (open: boolean) => {
    setIsViewOpen(open);
    if (!open) {
      setViewProductId(null);
    }
  };

  const handleReplenishProduct = (product: Product) => {
    setReplenishProduct(product);
    setIsReplenishOpen(true);
  };

  const handleEditProduct = (id: number) => {
    navigate(`/produtos/editar/${id}`);
  };

  const handleDuplicateProduct = (product: Product) => {
    navigate(`/produtos/novo?duplicate_id=${product.id}`);
  };

  const handleDeleteRequest = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCat === 'all' || String(p.categoria_id) === filterCat;
        const matchSub = filterSub === 'all' || String(p.subcategoria_id) === filterSub;
        return matchSearch && matchCat && matchSub;
    });
  }, [products, search, filterCat, filterSub]);

  const handleCatChange = (val: string) => {
    setFilterCat(val);
    setFilterSub('all');
  };

  const getTotalStock = (product: Product) => {
    if (product.variacoes && product.variacoes.length > 0) {
        return product.variacoes.reduce((acc, v) => acc + (Number(v.estoque) || 0), 0);
    }
    return Number(product.estoque) || 0;
  };

  const getInitials = (name: string) => name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const renderDesktopView = () => (
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
            const categoryName = categoryMap[product.categoria_id];
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
                <TableCell><span className="text-muted-foreground font-mono text-xs">#{product.id}</span></TableCell>
                <TableCell><span className="font-medium text-white group-hover:text-emerald-400 transition-colors">{product.nome}</span></TableCell>
                <TableCell>
                     <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-300">{categoryName || '-'}</span>
                        <span className="text-xs text-muted-foreground">{product.subcategoria_nome || '-'}</span> 
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    <Badge variant="outline" className={`rounded-lg border px-3 py-1 font-mono ${getTotalStock(product) > product.estoque_minimo ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-red-500/5 text-red-400 border-red-500/20'}`}>
                        {getTotalStock(product)} un
                    </Badge>
                </TableCell>
                <TableCell className="text-right pr-6"><span className="text-emerald-400 font-mono font-medium text-base">{formatCurrency(product.preco_varejo)}</span></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900/95 backdrop-blur-xl border-white/10 rounded-xl w-40">
                      <DropdownMenuItem onClick={() => handleViewProduct(product)}><Eye className="mr-2 h-4 w-4" /> Visualizar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReplenishProduct(product)}><PackagePlus className="mr-2 h-4 w-4" /> Repor Estoque</DropdownMenuItem>
                      <DropdownMenuItem asChild><Link to={`/produtos/editar/${product.id}`}><Pencil className="mr-2 h-4 w-4" /> Editar</Link></DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}><Copy className="mr-2 h-4 w-4" /> Duplicar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteRequest(product)} className="text-red-500 focus:text-red-400"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })
        ) : (
          <TableRow><TableCell colSpan={7} className="h-64 text-center">Nenhum produto encontrado.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderMobileView = () => (
    <div className="space-y-4 px-4 pb-24">
      {isLoading ? (
        Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl bg-white/10" />)
      ) : filteredProducts.length > 0 ? (
        filteredProducts.map(product => (
          <ProductCardMobile 
            key={product.id}
            product={product}
            onView={handleViewProduct}
            onReplenish={handleReplenishProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteRequest}
          />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground pt-20">
            <PackageOpen className="h-12 w-12 opacity-50 mb-4" />
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
            <p className="text-sm text-center">Tente ajustar seus filtros ou cadastre um novo produto.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="px-4 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Produtos</h1>
            <p className="text-muted-foreground">Gerenciamento de catálogo e estoque.</p>
          </div>
          <Link to="/produtos/novo" className="hidden md:block">
            <Button className="rounded-xl h-10 px-6 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-3xl md:border md:border-white/10 md:bg-black/40 md:backdrop-blur-xl md:shadow-2xl overflow-hidden md:ring-1 md:ring-white/5">
        <div className={`p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 bg-white/[0.02] ${isMobile ? 'sticky top-16 z-10 bg-background/80 backdrop-blur-md' : ''}`}>
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
        
        {showFilters && (
            <div className="p-4 md:p-6 bg-black/40 border-b border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
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

        <div className="p-0 md:p-0">
          {isMobile ? renderMobileView() : renderDesktopView()}
        </div>
      </div>
      
      {isMobile && (
        <Link to="/produtos/novo">
          <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl shadow-emerald-500/30 z-20 flex items-center justify-center">
            <PlusCircle className="h-8 w-8" />
          </Button>
        </Link>
      )}

      <ViewProductDialog productId={viewProductId} open={isViewOpen} onOpenChange={handleViewDialogChange} />
      <StockReplenishmentDialog product={replenishProduct} open={isReplenishOpen} onOpenChange={setIsReplenishOpen} />
      
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o produto "{productToDelete?.nome}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}