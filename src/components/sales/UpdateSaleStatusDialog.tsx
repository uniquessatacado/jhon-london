import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateSaleStatus } from '@/hooks/use-sale-mutations';
import { SaleWithDetails } from '@/hooks/use-sales';
import { useAuth } from '@/contexts/AuthContext';
import { useSaleStatuses } from '@/hooks/use-sale-statuses';
import { Loader2 } from 'lucide-react';

interface UpdateSaleStatusDialogProps {
  sale: SaleWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateSaleStatusDialog({ sale, open, onOpenChange }: UpdateSaleStatusDialogProps) {
  const { user } = useAuth();
  const { data: statuses, isLoading: isLoadingStatuses } = useSaleStatuses();
  const [newStatus, setNewStatus] = useState('');
  const { mutate: updateStatus, isPending } = useUpdateSaleStatus();

  useEffect(() => {
    if (sale?.status) {
      setNewStatus(sale.status);
    }
  }, [sale]);

  const handleSave = () => {
    if (!sale || !newStatus) return;
    updateStatus(
      { id: sale.id, status: newStatus, userId: user?.id, userName: user?.nome },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alterar Status do Pedido #{sale?.id}</DialogTitle>
          <DialogDescription>Selecione o novo status para este pedido. A alteração será registrada no histórico.</DialogDescription>
        </DialogHeader>
        <div className="py-6">
          {isLoadingStatuses ? (
            <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Selecione um status..." />
              </SelectTrigger>
              <SelectContent>
                {statuses?.map((s) => (
                  <SelectItem key={s.id} value={s.label}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isPending || !newStatus} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {isPending ? 'Salvando...' : 'Salvar Alteração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}