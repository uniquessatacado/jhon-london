import { Sale } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';

interface SalesListProps {
  title: string;
  sales?: Sale[];
  isLoading: boolean;
  type?: 'recent' | 'biggest';
}

export function SalesList({ title, sales, isLoading, type = 'recent' }: SalesListProps) {
  return (
    <Card className="bg-black/20 border-white/10 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-emerald-500" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto max-h-[400px]">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
               <div key={i} className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-white/5" />
                    <Skeleton className="h-3 w-20 bg-white/5" />
                  </div>
                  <Skeleton className="h-5 w-16 bg-white/5" />
               </div>
            ))}
          </div>
        ) : !sales || sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p className="text-sm">Nenhuma venda encontrada.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sales.map((sale) => (
              <div key={sale.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-muted-foreground border border-white/10 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-colors">
                        {sale.cliente_nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{sale.cliente_nome}</p>
                        <p className="text-xs text-muted-foreground">
                            {type === 'recent' ? new Date(sale.data).toLocaleDateString('pt-BR') : `${sale.itens_count} itens`}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.valor_total)}
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5 border-white/10 text-muted-foreground">
                        {sale.status}
                    </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {sales && sales.length > 0 && (
          <div className="p-3 border-t border-white/5 bg-white/[0.02]">
            <button className="w-full text-xs text-muted-foreground hover:text-emerald-400 flex items-center justify-center gap-1 transition-colors">
                Ver tudo <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
      )}
    </Card>
  );
}