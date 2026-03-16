import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useSaleDetails } from '@/hooks/use-sale-details';
import { SaleWithDetails } from '@/hooks/use-sales';

interface SaleDetailsDialogProps {
  sale: SaleWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleDetailsDialog({ sale, open, onOpenChange }: SaleDetailsDialogProps) {
  const { data: items, isLoading } = useSaleDetails(sale?.id || null);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle>Detalhes da Venda #{sale?.id}</DialogTitle>
          <DialogDescription>
            Cliente: {sale?.clientes?.nome || 'N/A'} | Data: {sale ? new Date(sale.created_at).toLocaleDateString('pt-BR') : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden border-t border-white/10">
          {isLoading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
          ) : (
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tam.</TableHead>
                    <TableHead className="text-right">Qtd.</TableHead>
                    <TableHead className="text-right">Vlr. Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.produtos?.nome || 'Produto não encontrado'}</TableCell>
                      <TableCell>{item.tamanho}</TableCell>
                      <TableCell className="text-right">{item.quantidade}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.valor_unitario)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(item.quantidade * item.valor_unitario)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}