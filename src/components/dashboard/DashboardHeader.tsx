import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Filter, RefreshCcw } from 'lucide-react';
import { DashboardFilters, PeriodOption, TypeOption } from '@/types/dashboard';

interface DashboardHeaderProps {
  filters: DashboardFilters;
  onFilterChange: (newFilters: DashboardFilters) => void;
  onRefresh: () => void;
}

export function DashboardHeader({ filters, onFilterChange, onRefresh }: DashboardHeaderProps) {
  const [localPeriod, setLocalPeriod] = useState<PeriodOption>(filters.periodo);
  const [localType, setLocalType] = useState<TypeOption>(filters.tipo);
  const [dateStart, setDateStart] = useState(filters.data_inicio || '');
  const [dateEnd, setDateEnd] = useState(filters.data_fim || '');

  const handleApply = () => {
    onFilterChange({
      periodo: localPeriod,
      tipo: localType,
      data_inicio: localPeriod === 'customizado' ? dateStart : undefined,
      data_fim: localPeriod === 'customizado' ? dateEnd : undefined,
    });
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card backdrop-blur-xl border p-4 rounded-3xl shadow-lg">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                Dashboard.
            </span>
        </h1>
        <p className="text-xs text-muted-foreground">Visão geral de performance</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        
        {/* Type Selector */}
        <div className="w-full md:w-auto bg-muted p-1 rounded-xl flex border">
            {(['tudo', 'varejo', 'atacado'] as const).map((t) => (
                <button
                    key={t}
                    onClick={() => setLocalType(t)}
                    className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                        localType === t
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
            ))}
        </div>

        <div className="h-8 w-px bg-border hidden md:block" />

        {/* Period Selector */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Select value={localPeriod} onValueChange={(v) => setLocalPeriod(v as PeriodOption)}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background border h-10 rounded-xl focus:ring-emerald-500/20">
                    <Calendar className="mr-2 h-4 w-4 text-emerald-500" />
                    <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="ontem">Ontem</SelectItem>
                    <SelectItem value="7_dias">Últimos 7 dias</SelectItem>
                    <SelectItem value="30_dias">Últimos 30 dias</SelectItem>
                    <SelectItem value="este_mes">Este Mês</SelectItem>
                    <SelectItem value="mes_passado">Mês Passado</SelectItem>
                    <SelectItem value="customizado">Customizado</SelectItem>
                </SelectContent>
            </Select>

            {localPeriod === 'customizado' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 sm:slide-in-from-left-2">
                    <Input
                        type="date"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                        className="flex-1 sm:w-36 bg-background border h-10 rounded-xl"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                        type="date"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                        className="flex-1 sm:w-36 bg-background border h-10 rounded-xl"
                    />
                </div>
            )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
              onClick={handleApply}
              className="flex-1 md:flex-none h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
              <Filter className="mr-2 h-4 w-4" /> Filtrar
          </Button>

          <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              className="h-10 w-10 shrink-0 rounded-xl hover:bg-accent hover:text-emerald-400 text-muted-foreground bg-background md:bg-transparent"
          >
              <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}