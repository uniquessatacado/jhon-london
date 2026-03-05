import { useMemo } from 'react';
import { Product } from '@/types';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Warehouse, DollarSign, TrendingUp, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewStockDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewStockDialog({ product, open, onOpenChange }: ViewStockDialogProps) {
  const formatCurrency = (val: number | undefined) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const stockData = useMemo(() => {
    if (!product) return null;

    const totalStock = product.variacoes?.reduce((acc, v) => acc + (Number(v.estoque) || 0), 0) || 0;
    const totalCostValue = totalStock * (product.preco_custo || 0);
    const totalRetailValue = totalStock * (product.preco_varejo || 0);
    const totalWholesaleValue = totalStock * (product.preco_atacado_geral || 0);

    return {
      totalStock,
      totalCostValue,
      totalRetailValue,
      totalWholesaleValue,
    };
  }, [product]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* [&>button]:hidden oculta o "X" padrão do shadcn para usarmos o nosso customizado no header */}
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border-white/10 p-0 overflow-hidden shadow-2xl [&>button]:hidden sm:rounded-2xl">
        
        {/* CABEÇALHO FIXO */}
        <div className="flex items-start justify-between p-6 border-b border-white/10 bg-white/[0.02] shrink-0">
          <div>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-white">
              <Warehouse className="h-6 w-6 text-emerald-500" />
              Estoque Detalhado
            </DialogTitle>
            <DialogDescription className="mt-2 text-base text-muted-foreground font-medium">
              {product.nome}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-colors border border-white/10">
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </div>
        
        {/* ÁREA CENTRAL ROLÁVEL (TABELA) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-black/20 relative">
          <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden shadow-inner">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent bg-white/5">
                  <TableHead className="font-semibold text-emerald-500/80 h-12">Tamanho / Variação</TableHead>
                  <TableHead className="text-right font-semibold text-emerald-500/80 h-12">Estoque Atual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.variacoes?.map((v, i) => (
                  <TableRow key={i} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="font-bold py-4">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-4 py-1.5 text-base shadow-sm group-hover:bg-emerald-500/20 transition-colors">
                            {v.tamanho}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono py-4">
                        <div className="flex items-baseline justify-end gap-1">
                            <span className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">{v.estoque}</span>
                            <span className="text-sm text-muted-foreground font-sans">un</span>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!product.variacoes || product.variacoes.length === 0) && (
                  <TableRow>
                     <TableCell colSpan={2} className="text-center py-10 text-muted-foreground">
                        Nenhuma variação encontrada.
                     </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* RODAPÉ FIXO COM TOTAIS (METRICS) */}
        <div className="p-4 md:p-6 border-t border-white/10 bg-zinc-900 shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                
                {/* Card 1: Estoque Total */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col justify-center transition-transform hover:scale-[1.02]">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        Estoque Total
                    </span>
                    <span className="text-2xl md:text-3xl font-bold text-white">{stockData?.totalStock} <span className="text-sm font-normal text-muted-foreground">un</span></span>
                </div>

                {/* Card 2: Custo Total */}
                <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex flex-col justify-center transition-transform hover:scale-[1.02]">
                    <span className="text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <DollarSign className="h-3 w-3" /> Custo Total
                    </span>
                    <span className="text-xl md:text-2xl font-bold font-mono text-red-400">{formatCurrency(stockData?.totalCostValue)}</span>
                </div>

                {/* Card 3: Potencial Varejo */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex flex-col justify-center transition-transform hover:scale-[1.02]">
                    <span className="text-xs font-semibold text-emerald-400/70 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3" /> Potencial Varejo
                    </span>
                    <span className="text-xl md:text-2xl font-bold font-mono text-emerald-400">{formatCurrency(stockData?.totalRetailValue)}</span>
                </div>

                {/* Card 4: Potencial Atacado */}
                <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-xl flex flex-col justify-center transition-transform hover:scale-[1.02]">
                    <span className="text-xs font-semibold text-purple-400/70 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <ShoppingBag className="h-3 w-3" /> Potencial Atacado
                    </span>
                    <span className="text-xl md:text-2xl font-bold font-mono text-purple-400">{formatCurrency(stockData?.totalWholesaleValue)}</span>
                </div>

            </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}