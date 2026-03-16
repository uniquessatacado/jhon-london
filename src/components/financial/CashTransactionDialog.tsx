import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddCashTransaction } from '@/hooks/use-financial';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface CashTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'entrada' | 'saida';
}

export function CashTransactionDialog({ open, onOpenChange, type }: CashTransactionDialogProps) {
  const { user } = useAuth();
  const { mutate: addTransaction, isPending } = useAddCashTransaction();
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');

  const isEntrada = type === 'entrada';

  const handleSave = () => {
    const numValor = parseFloat(valor.replace(',', '.'));
    if (isNaN(numValor) || numValor <= 0) return;

    addTransaction(
      {
        tipo: type,
        categoria: isEntrada ? 'reforco' : 'retirada',
        valor: numValor,
        descricao: descricao || (isEntrada ? 'Reforço de Caixa' : 'Retirada de Caixa'),
        usuario_id: user?.id,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setValor('');
          setDescricao('');
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${isEntrada ? 'text-emerald-500' : 'text-red-500'}`}>
            {isEntrada ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
            {isEntrada ? 'Registrar Reforço (Entrada)' : 'Registrar Retirada (Saída)'}
          </DialogTitle>
          <DialogDescription>
            {isEntrada 
                ? 'Insira dinheiro no caixa físico para troco ou aportes.' 
                : 'Retire dinheiro do caixa físico para sangria ou pagamentos.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input 
              type="number" 
              step="0.01"
              value={valor} 
              onChange={(e) => setValor(e.target.value)} 
              placeholder="0,00"
              className={`text-xl font-bold h-12 bg-black/40 border-white/10 ${isEntrada ? 'focus-visible:ring-emerald-500' : 'focus-visible:ring-red-500'}`}
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição / Motivo</Label>
            <Input 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              placeholder="Ex: Pagamento de fornecedor, Troco para o dia..."
              className="bg-black/40 border-white/10"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-white/5">Cancelar</Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending || !valor} 
            className={isEntrada ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar {isEntrada ? 'Reforço' : 'Retirada'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}