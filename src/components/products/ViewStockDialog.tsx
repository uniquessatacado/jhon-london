import { useMemo } from 'react';
import { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Warehouse, DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-emerald-500" />
            Estoque do Produto
          </DialogTitle>
          <DialogDescription>{product.nome}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead>Tamanho</TableHead>
                    <TableHead className="text-right">Estoque Atual</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.variacoes?.map((v, i) => (
                    <TableRow key={i} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-bold"><Badge variant="outline">{v.tamanho}</Badge></TableCell>
                      <TableCell className="text-right font-mono text-lg">{v.estoque}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/10">
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">Estoque Total</span>
                <span className="text-2xl font-bold text-white">{stockData?.totalStock} un</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4 text-red-400"/> Custo Total</span>
                <span className="font-mono text-red-400">{formatCurrency(stockData?.totalCostValue)}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-400"/> Potencial Varejo</span>
                <span className="font-mono text-emerald-400">{formatCurrency(stockData?.totalRetailValue)}</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-purple-400"/> Potencial Atacado</span>
                <span className="font-mono text-purple-400">{formatCurrency(stockData?.totalWholesaleValue)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}