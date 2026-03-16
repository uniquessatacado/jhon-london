import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, CreditCard, ArrowUpCircle, ArrowDownCircle, Banknote, QrCode } from 'lucide-react';
import { useFinancialData } from '@/hooks/use-financial';
import { DashboardFilters } from '@/types/dashboard';
import { CashTransactionDialog } from '@/components/financial/CashTransactionDialog';

export function FinancialPage() {
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: 'este_mes',
    tipo: 'tudo',
  });

  const { data, isLoading, refetch } = useFinancialData(filters);
  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [isSaidaOpen, setIsSaidaOpen] = useState(false);

  const formatCurrency = (val: number | undefined) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const getPaymentIcon = (method: string) => {
    switch (method.toLowerCase()) {
        case 'pix': return <QrCode className="h-5 w-5 text-emerald-400" />;
        case 'dinheiro': return <Banknote className="h-5 w-5 text-green-400" />;
        case 'credito': return <CreditCard className="h-5 w-5 text-blue-400" />;
        case 'debito': return <CreditCard className="h-5 w-5 text-purple-400" />;
        default: return <Wallet className="h-5 w-5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      
      <DashboardHeader 
        filters={filters} 
        onFilterChange={setFilters} 
        onRefresh={refetch} 
      />

      {/* MÉTRICAS DO PERÍODO SELECIONADO */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resultados do Período</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
                title="Total Vendido" 
                value={formatCurrency(data?.faturamento)} 
                icon={TrendingUp} 
                isLoading={isLoading}
                color="emerald"
            />
            <MetricCard 
                title="Custo de Mercadoria" 
                value={formatCurrency(data?.custo)} 
                icon={CreditCard} 
                isLoading={isLoading}
                color="orange"
            />
            <MetricCard 
                title="Lucro Bruto" 
                value={formatCurrency(data?.lucro)} 
                icon={Wallet} 
                isLoading={isLoading}
                color="blue"
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* CAIXA FÍSICO (DINHEIRO) - NÃO É AFETADO PELO FILTRO DE DATA */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-green-500/10 to-emerald-900/10 border-emerald-500/30 shadow-lg shadow-emerald-500/5">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2 text-emerald-500">
                    <Banknote className="h-6 w-6" /> Saldo do Caixa (Dinheiro)
                </CardTitle>
                <p className="text-sm text-muted-foreground">Gaveta física (Histórico Geral)</p>
            </CardHeader>
            <CardContent>
                <div className="py-4">
                    <span className="text-4xl font-mono font-bold text-emerald-400">
                        {isLoading ? '...' : formatCurrency(data?.saldo_caixa)}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button 
                        onClick={() => setIsEntradaOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
                    >
                        <ArrowUpCircle className="mr-2 h-4 w-4" /> Reforço
                    </Button>
                    <Button 
                        variant="destructive"
                        onClick={() => setIsSaidaOpen(true)}
                        className="shadow-lg"
                    >
                        <ArrowDownCircle className="mr-2 h-4 w-4" /> Retirada
                    </Button>
                </div>
            </CardContent>
        </Card>

        {/* FORMAS DE PAGAMENTO DO PERÍODO */}
        <Card className="lg:col-span-2 bg-card backdrop-blur-xl border shadow-lg">
            <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-500" /> Entradas por Forma de Pagamento
                </CardTitle>
                <p className="text-sm text-muted-foreground">Filtrado pelo período selecionado.</p>
            </CardHeader>
            <CardContent className="p-6">
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
                        <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
                    </div>
                ) : !data?.metodos_pagamento || Object.keys(data.metodos_pagamento).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Nenhum pagamento registrado neste período.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(data.metodos_pagamento).map(([metodo, valor]) => (
                            <div key={metodo} className="flex items-center justify-between p-4 rounded-xl border bg-black/20 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border">
                                        {getPaymentIcon(metodo)}
                                    </div>
                                    <span className="font-semibold text-foreground capitalize">{metodo}</span>
                                </div>
                                <span className="font-mono text-lg font-bold">{formatCurrency(valor as number)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

      </div>

      <CashTransactionDialog open={isEntradaOpen} onOpenChange={setIsEntradaOpen} type="entrada" />
      <CashTransactionDialog open={isSaidaOpen} onOpenChange={setIsSaidaOpen} type="saida" />

    </div>
  );
}