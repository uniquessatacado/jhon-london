import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, History, ShoppingBag } from 'lucide-react';
import { useSaleDetails, useSaleHistory } from '@/hooks/use-sale-details';
import { SaleWithDetails } from '@/hooks/use-sales';

interface SaleDetailsDialogProps {
  sale: SaleWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SaleHistoryTab({ saleId }: { saleId: number }) {
  const { data: history, isLoading } = useSaleHistory(saleId);

  if (isLoading) return <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-4">
      {history?.map(log => (
        <div key={log.id} className="flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <History className="h-4 w-4" />
            </div>
            <div className="w-px flex-1 bg-white/10 my-1"></div>
          </div>
          <div>
            <p className="font-medium">{log.acao}</p>
            <p className="text-sm text-muted-foreground">
              por <span className="font-semibold text-white">{log.usuario_nome || 'Sistema'}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(log.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SaleDetailsDialog({ sale, open, onOpenChange }: SaleDetailsDialogProps) {
  const { data: items, isLoading } = useSaleDetails(sale?.id || null);
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col bg-zinc-950 border-white/10 p-0">
        <DialogHeader className="p-6">
          <DialogTitle>Detalhes da Venda #{sale?.id}</DialogTitle>
          <DialogDescription>
            Cliente: {sale?.clientes?.nome || 'N/A'} | Data: {sale ? new Date(sale.created_at).toLocaleDateString('pt-BR') : ''}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="items" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-y border-white/10">
            <TabsList className="bg-transparent">
              <TabsTrigger value="items"><ShoppingBag className="mr-2 h-4 w-4" /> Itens da Venda</TabsTrigger>
              <TabsTrigger value="history"><History className="mr-2 h-4 w-4" /> Histórico</TabsTrigger>
            </TabsList>
          </div>
          <ScrollArea className="flex-1 p-6">
            <TabsContent value="items">
              {isLoading ? (
                <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-emerald-500" /></div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Produto</TableHead><TableHead>Tam.</TableHead><TableHead className="text-right">Qtd.</TableHead><TableHead className="text-right">Vlr. Unit.</TableHead><TableHead className="text-right">Subtotal</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {items?.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.produtos?.nome || 'Produto não encontrado'}</TableCell>
                        <TableCell>{item.tamanho}</TableCell>
                        <TableCell className="text-right">{item.quantidade}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.preco_unitario)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(item.quantidade * item.preco_unitario)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            <TabsContent value="history">
              {sale && <SaleHistoryTab saleId={sale.id} />}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}