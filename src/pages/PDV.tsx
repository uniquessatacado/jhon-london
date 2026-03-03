import { SalesForm } from '@/components/pdv/SalesForm';
import { ShoppingCart } from 'lucide-react';

export function PDVPage() {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShoppingCart className="h-6 w-6" />
        </div>
        <div>
            <h1 className="text-3xl font-bold">PDV (Ponto de Venda)</h1>
            <p className="text-muted-foreground">Inicie uma nova venda preenchendo os dados abaixo.</p>
        </div>
      </div>
      
      <div className="flex-1">
        <SalesForm />
      </div>
    </div>
  );
}