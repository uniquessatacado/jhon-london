import { Customer } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Crown } from 'lucide-react';

interface CustomerListProps {
  title: string;
  customers?: Customer[];
  isLoading: boolean;
  type?: 'new' | 'elite';
}

export function CustomerList({ title, customers, isLoading, type = 'new' }: CustomerListProps) {
  const Icon = type === 'elite' ? Crown : Users;
  const iconColor = type === 'elite' ? 'text-amber-400' : 'text-blue-400';

  return (
    <Card className="bg-card border backdrop-blur-sm h-full">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Icon className={`h-4 w-4 ${iconColor}`} /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
           <div className="p-4 space-y-4">
             {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                    <Skeleton className="h-4 w-32 bg-muted" />
                </div>
             ))}
           </div>
        ) : !customers || customers.length === 0 ? (
           <div className="p-6 text-center text-sm text-muted-foreground">Nenhum cliente.</div>
        ) : (
          <div className="divide-y">
            {customers.map((customer, index) => (
              <div key={customer.id} className="p-4 hover:bg-accent transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border ${type === 'elite' && index === 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-muted text-muted-foreground'}`}>
                        {type === 'elite' ? index + 1 : (customer.nome || '?').substring(0, 1)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-foreground truncate">{customer.nome || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground truncate">{customer.cidade ? `${customer.cidade}/${customer.estado}` : (customer.email || 'N/A')}</p>
                    </div>
                </div>
                {type === 'elite' && customer.total_gasto && (
                    <div className="text-sm font-bold text-amber-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(customer.total_gasto)}
                    </div>
                )}
                {type === 'new' && customer.data_cadastro && (
                    <div className="text-xs text-muted-foreground">
                        {new Date(customer.data_cadastro).toLocaleDateString()}
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}