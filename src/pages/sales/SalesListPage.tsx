import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useSales, SaleWithDetails, SalesFilters } from '@/hooks/use-sales';
import { useDeleteSale } from '@/hooks/use-sale-mutations';
import { useSaleStatuses } from '@/hooks/use-sale-statuses';
import { Skeleton } from '@/components/ui/skeleton';
import { SalesListHeader } from '../../components/sales/SalesListHeader';
import { UpdateSaleStatusDialog } from '../../components/sales/UpdateSaleStatusDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

export function SalesListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<SalesFilters>({});
  const { data: sales, isLoading } = useSales(filters);
  const { data: statuses } = useSaleStatuses();
  const { mutate: deleteSale } = useDeleteSale();

  const [editingSale, setEditingSale] = useState<SaleWithDetails | null>(null);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const saleTypeLabels = {
    varejo: { label: 'Varejo', className: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
    atacado_geral: { label: 'Atacado Geral', className: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
    atacado_grade: { label: 'Atacado Grade', className: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  };

  const handleDelete = (saleId: number) => {
    deleteSale({ id: saleId, userId: user?.id, userName: user?.nome });
  };

  const getStatusColor = (statusLabel: string) => {
    const s = statuses?.find(st => st.label === statusLabel);
    if (!s) return 'bg-muted text-muted-foreground';
    return `bg-${s.color}-500/20 text-${s.color}-600 dark:text-${s.color}-400 border-${s.color}-500/30`;
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Vendas</h1>
        <p className="text-muted-foreground">Consulte todas as vendas, filtre por período e acompanhe o status.</p>
      </div>

      <SalesListHeader onFilterChange={setFilters} />

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">ID</TableHead>
                <TableHead>Data e Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="w-[50px] pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-6"><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                    <TableCell className="pr-6" />
                  </TableRow>
                ))
              ) : sales?.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">Nenhuma venda encontrada com os filtros atuais.</TableCell>
                </TableRow>
              ) : sales?.map((sale) => {
                const { date, time } = formatDateTime(sale.created_at);
                return (
                  <TableRow 
                    key={sale.id} 
                    className="hover:bg-muted/50 cursor-pointer group transition-colors"
                    onClick={() => navigate(`/vendas/${sale.id}`)}
                  >
                    <TableCell className="pl-6 font-mono text-xs text-muted-foreground font-bold">#{sale.id}</TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="font-medium">{date}</span>
                          <span className="text-xs text-muted-foreground">{time}</span>
                       </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{sale.clientes?.nome || 'Cliente Desconhecido'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`px-2 py-0.5 text-xs ${saleTypeLabels[sale.tipo_venda]?.className || ''}`}>
                        {saleTypeLabels[sale.tipo_venda]?.label || sale.tipo_venda}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="uppercase text-[10px] tracking-wider">{sale.origem || 'SISTEMA'}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border ${getStatusColor(sale.status)}`}>{sale.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-500">{formatCurrency(sale.valor_total)}</TableCell>
                    <TableCell className="pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/vendas/${sale.id}`); }}><Eye className="mr-2 h-4 w-4" /> Detalhes Completos</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingSale(sale); }}><Pencil className="mr-2 h-4 w-4" /> Alterar Status</DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={(e) => e.stopPropagation()} className="text-red-500 focus:text-red-500 focus:bg-red-500/10"><Trash2 className="mr-2 h-4 w-4" /> Excluir Venda</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle><AlertDialogDescription>Esta ação apagará todo o registro financeiro e histórico desta venda. O estoque não será devolvido automaticamente.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={(e) => { e.stopPropagation(); handleDelete(sale.id); }} className="bg-red-600 hover:bg-red-700">Sim, Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <UpdateSaleStatusDialog sale={editingSale} open={!!editingSale} onOpenChange={() => setEditingSale(null)} />
    </div>
  );
}