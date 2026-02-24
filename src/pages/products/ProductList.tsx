import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Search, Filter, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/hooks/use-products';
import { useCategories, useSubcategories } from '@/hooks/use-categories';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductListPage() {
  const { data: products, isLoading, isError } = useProducts();
  const { data: categories } = useCategories();
  
  // Estados de Filtro
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterSub, setFilterSub] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Subcategorias filtradas pela categoria selecionada no filtro
  const { data: subcategories } = useSubcategories(filterCat !== 'all' ? Number(filterCat) : null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Lógica de Filtragem no Frontend (já que a API retorna tudo por enquanto)
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(p => {
        const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerenciamento de catálogo e estoque.</p>
        </div>
        <Link to="/produtos/novo">
          <Button className="rounded-xl h-10 px-6 font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        {/* BARRA DE FERRAMENTAS */}
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por nome ou SKU..." 
                    className="pl-9 bg-white/5 border-white/10 rounded-xl focus:ring-emerald-500/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
           </div>
           <Button 
                variant={showFilters ? "secondary" : "outline"} 
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
           >
                <Filter className="mr-2 h-4 w-4" /> Filtros
           </Button>
        </div>
        
        {/* ÁREA DE FILTROS EXPANSÍVEL */}
        {showFilters && (
            <div className="p-4 bg-black/20 border-b border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
                <div>
                    <span className="text-xs text-muted-foreground mb-1 block">Categoria</span>
                    <Select value={filterCat} onValueChange={handleCatChange}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Todas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {categories?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <span className="text-xs text-muted-foreground mb-1 block">Subcategoria</span>
                    <Select value={filterSub} onValueChange={setFilterSub} disabled={filterCat === 'all'}>
                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Todas" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {subcategories?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-end">
                    <Button variant="ghost" onClick={() => { setFilterCat('all'); setFilterSub('all'); setSearch(''); }} className="text-muted-foreground hover:text-white">
                        <X className="mr-2 h-4 w-4" /> Limpar Filtros
                    </Button>
                </div>
            </div>
        )}

        <div className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-[80px]"></TableHead>
                <TableHead className="text-emerald-500 font-semibold">Produto</TableHead>
                <TableHead className="text-emerald-500 font-semibold">Categoria / Sub</TableHead>
                <TableHead className="text-right text-emerald-500 font-semibold">Estoque</TableHead>
                <TableHead className="text-right text-emerald-500 font-semibold">Preço</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5 hover:bg-white/5">
                    <TableCell><Skeleton className="h-10 w-10 rounded bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-48 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32 bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 ml-auto bg-white/10" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 ml-auto bg-white/10" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map(product => {
                    // Encontrar nomes para exibição (mockup visual já que a API de produtos pode vir apenas com IDs)
                    const catName = categories?.find(c => c.id === product.categoria_id)?.nome || '-';
                    // Nota: Subcategoria precisaria ser buscada ou vir populada no produto. Assumindo ID por enquanto ou buscando se tiver cache.
                    
                    return (
                      <TableRow key={product.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell>
                            <div className="h-10 w-10 rounded-lg bg-white/10 overflow-hidden">
                                {product.imagem_principal ? (
                                    <img src={product.imagem_principal} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Foto</div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium text-white">{product.nome}</span>
                                <span className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                             <div className="flex flex-col">
                                <span className="text-sm">{catName}</span>
                                {/* Como não temos a lista completa de todas subcategorias carregadas aqui, mostramos só se tiver filtro ou se backend mandar expandido */}
                                <span className="text-xs text-muted-foreground">ID Sub: {product.subcategoria_id || '-'}</span> 
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge 
                                variant="outline" 
                                className={`rounded-md border-0 px-2 py-0.5 ${
                                    product.estoque > product.estoque_minimo 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : 'bg-red-500/10 text-red-400'
                                }`}
                            >
                                {product.estoque} un
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right text-emerald-400 font-mono font-medium">{formatCurrency(product.preco_varejo)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost" className="hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900/95 backdrop-blur-xl border-white/10 rounded-xl">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem className="focus:bg-white/10 rounded-lg cursor-pointer"><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-400 rounded-lg cursor-pointer"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    Nenhum produto encontrado com os filtros selecionados.
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