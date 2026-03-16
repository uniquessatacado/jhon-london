import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateSaleStatus } from '@/hooks/use-sale-mutations';
import { SaleWithDetails } from '@/hooks/use-sales';
import { useAuth } from '@/contexts/AuthContext';

interface UpdateSaleStatusDialogProps {
  sale: SaleWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateSaleStatusDialog({ sale, open, onOpenChange }: UpdateSaleStatusDialogProps) {
  const { user } = useAuth();
  const [newStatus, setNewStatus] = useState(sale?.status || '');
  const { mutate: updateStatus, isPending } = useUpdateSaleStatus();

  const handleSave = () => {
    if (!sale || !newStatus) return;
    updateStatus(
      { id: sale.id, status: newStatus, userId: user?.id, userName: user?.nome },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Status da Venda #{sale?.id}</DialogTitle>
          <DialogDescription>Selecione o novo status para esta venda.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger><SelectValue placeholder="Selecione um status..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Concluído">Concluído</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
              <SelectItem value="Aguardando Pagamento">Aguardando Pagamento</SelectItem>
              <SelectItem value="Em Separação">Em Separação</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isPending || !newStatus}>
            {isPending ? 'Salvando...' : 'Salvar Alteração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}