import { Button } from '@/components/ui/button';
import { User, Tag, Power } from 'lucide-react';
import { usePdv } from '@/contexts/PdvContext';

export function PdvHeader() {
  const { customer, saleType, clearSale } = usePdv();

  const saleTypeLabels = {
    varejo: 'Varejo',
    atacado_geral: 'Atacado Geral',
    atacado_grade: 'Atacado Grade',
  };

  return (
    <div className="bg-black/20 border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4 text-emerald-400" />
          <span>Cliente</span>
        </div>
        <p className="text-lg font-bold text-white">{customer?.nome}</p>
      </div>
      <div className="w-px h-10 bg-white/10 hidden md:block" />
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="h-4 w-4 text-emerald-400" />
          <span>Tipo de Venda</span>
        </div>
        <p className="text-lg font-bold text-white">{saleType ? saleTypeLabels[saleType] : '-'}</p>
      </div>
      <Button onClick={clearSale} variant="destructive" className="w-full md:w-auto">
        <Power className="mr-2 h-4 w-4" />
        Cancelar Venda
      </Button>
    </div>
  );
}