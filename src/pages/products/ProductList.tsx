import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Search, Filter, X, PackageOpen, Box, ZoomIn } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/use-products';
import { useCategories, useAllSubcategories } from '@/hooks/use-categories';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductListPage() {
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: allSubcategories } = useAllSubcategories();
  
  // Estados de Filtro
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(p => {
        // Busca SKU nas variações se não tiver no principal
        const productSku = p.sku || p.variacoes?.[0]?.sku || '';
        const searchTerm = search.toLowerCase();
        
        const matchSearch = p.nome.toLowerCase().includes(searchTerm) || productSku.toLowerCase().includes(searchTerm);
        const matchCat = filterCat === 'all' || String(p.categoria_id) === filterCat;
        
        return matchSearch && matchCat;
    });
  }, [products, search, filterCat]);

  // Função auxiliar para pegar nome da categoria de forma segura
  const getCategoryName = (catId: number) => {
    if (!categories) return '...';
    const cat = categories.find(c => String(c.id) === String(catId));
    return cat ? cat.nome : '-';
  };

  // Função auxiliar para pegar nome da subcategoria
  const getSubcategoryName = (subId: number | null) => {
    if (!subId || !allSubcategories) return '-';
    const sub = allSubcategories.find(s => String(s.id) === String(subId));
    return sub ? sub.nome : '-';
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

      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/5">
        {/* Filtros e Busca */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 bg-white/[0.02]">
           <div className="relative flex-1 group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input 
                    placeholder="Buscar por nome ou SKU..." 
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
            <div className="p-6 bg-black/40 border-b border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                    <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Categoria</span>
                    <Select value={filterCat} onValueChange={setFilterCat}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-lg"><SelectValue placeholder="Todas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button variant="ghost" onClick={() => { setFilterCat('all'); setSearch(''); }} className="w-full text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg">
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
                    <TableCell><Skeleton className="h-4 w-48 bg-white/10 mb-2" /><Skeleton className="h-3 w-24 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto bg-white/10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto bg-white/10" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map(product => {
                    // Lógica robusta para SKU
                    const displaySku = product.sku 
                        ? product.sku 
                        : (product.variacoes && product.variacoes.length > 0 && product.variacoes[0].sku) 
                            ? product.variacoes[0].sku 
                            : 'S/ SKU';
                    
                    // Estoque Total
                    const totalEstoque = product.estoque > 0 
                        ? product.estoque 
                        : (product.variacoes?.reduce((acc, v) => acc + (Number(v.estoque) || 0), 0) || 0);

                    return (
                      <TableRow key={product.id} className="border-white/5 hover:bg-white/[0.04] transition-colors group">
                        <TableCell className="pl-6 py-4">
                            {product.imagem_principal ? (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative h-12 w-12 rounded-xl border border-white/10 overflow-hidden cursor-zoom-in group/img shadow-md hover:shadow-emerald-500/20 transition-all">
                                            <img src={product.imagem_principal} alt="" className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                <ZoomIn className="h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl bg-transparent border-none shadow-none p-0 flex items-center justify-center">
                                        <div className="relative">
                                            <img 
                                                src={product.imagem_principal} 
                                                alt={product.nome} 
                                                className="max-h-[85vh] max-w-full rounded-lg shadow-2xl border border-white/10 bg-black" 
                                            />
                                            <Button className="absolute top-4 right-4 rounded-full" size="icon" variant="destructive">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Box className="h-5 w-5 text-muted-foreground/50" />
                                </div>
                            )}
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-white group-hover:text-emerald-400 transition-colors">{product.nome}</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-[10px] bg-white/5 text-muted-foreground hover:bg-white/10 border-white/5 font-mono">
                                        SKU: {displaySku}
                                    </Badge>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                             <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-300">{getCategoryName(product.categoria_id)}</span>
                                <span className="text-xs text-muted-foreground">{getSubcategoryName(product.subcategoria_id)}</span> 
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge 
                                variant="outline" 
                                className={`rounded-lg border px-3 py-1 font-mono ${
                                    totalEstoque > (product.estoque_minimo || 5)
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900/95 backdrop-blur-xl border-white/10 rounded-xl w-40">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              {/* GARANTINDO QUE O LINK NÃO SEJA UNDEFINED */}
                              {product.id ? (
                                  <DropdownMenuItem asChild className="focus:bg-white/10 rounded-lg cursor-pointer">
                                      <Link to={`/produtos/editar/${product.id}`} className="flex items-center w-full">
                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                      </Link>
                                  </DropdownMenuItem>
                              ) : null}
                              <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-400 rounded-lg cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <PackageOpen className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg">Nenhum produto encontrado</p>
                    </div>
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