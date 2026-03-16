import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { SalesFilters } from '@/hooks/use-sales';

interface SalesListHeaderProps {
  onFilterChange: (filters: SalesFilters) => void;
}

export function SalesListHeader({ onFilterChange }: SalesListHeaderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saleType, setSaleType] = useState('todos');

  const handleApplyFilters = () => {
    onFilterChange({ searchTerm, startDate, endDate, saleType });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSaleType('todos');
    onFilterChange({});
  };

  return (
    <div className="p-4 bg-black/20 border border-white/10 rounded-xl space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por Cliente ou ID..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={saleType} onValueChange={setSaleType}>
          <SelectTrigger><SelectValue placeholder="Tipo de Venda" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Tipos</SelectItem>
            <SelectItem value="varejo">Varejo</SelectItem>
            <SelectItem value="atacado_geral">Atacado Geral</SelectItem>
            <SelectItem value="atacado_grade">Atacado Grade</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={handleClearFilters}><X className="mr-2 h-4 w-4" /> Limpar</Button>
        <Button onClick={handleApplyFilters} className="bg-emerald-500 hover:bg-emerald-600">Aplicar Filtros</Button>
      </div>
    </div>
  );
}