import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useSales, SaleWithDetails, SalesFilters } from '@/hooks/use-sales';
import { useDeleteSale } from '@/hooks/use-sale-mutations';
import { Skeleton } from '@/components/ui/skeleton';
import { SaleDetailsDialog } from '../../components/sales/SaleDetailsDialog';
import { SalesListHeader } from '../../components/sales/SalesListHeader';
import { UpdateSaleStatusDialog } from '../../components/sales/UpdateSaleStatusDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

export function SalesListPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SalesFilters>({});
  const { data: sales, isLoading } = useSales(filters);
  const { mutate: deleteSale } = useDeleteSale();

  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);
  const [editingSale, setEditingSale] = useState<SaleWithDetails | null>(null);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const saleTypeLabels = {
    varejo: { label: 'Varejo', className: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
    atacado_geral: { label: 'Atacado Geral', className: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
    atacado_grade: { label: 'Atacado Grade', className: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
  };

  const handleDelete = (saleId: number) => {
    deleteSale({ id: saleId, userId: user?.id, userName: user?.nome });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Vendas</h1>
        <p className="text-muted-foreground">Consulte todas as vendas realizadas no sistema.</p>
      </div>

      <SalesListHeader onFilterChange={setFilters} />

      <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : sales?.map((sale) => (
                <TableRow key={sale.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-mono text-xs text-muted-foreground">#{sale.id}</TableCell>
                  <TableCell className="font-medium">{sale.clientes?.nome || 'N/A'}</TableCell>
                  <TableCell>{formatDate(sale.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={saleTypeLabels[sale.tipo_venda]?.className || ''}>
                      {saleTypeLabels[sale.tipo_venda]?.label || sale.tipo_venda}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{sale.origem || 'N/A'}</Badge></TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/20 text-emerald-300">{sale.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-400">{formatCurrency(sale.valor_total)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedSale(sale)}><Eye className="mr-2 h-4 w-4" /> Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingSale(sale)}><Pencil className="mr-2 h-4 w-4" /> Alterar Status</DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(sale.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <SaleDetailsDialog sale={selectedSale} open={!!selectedSale} onOpenChange={() => setSelectedSale(null)} />
      <UpdateSaleStatusDialog sale={editingSale} open={!!editingSale} onOpenChange={() => setEditingSale(null)} />
    </div>
  );
}