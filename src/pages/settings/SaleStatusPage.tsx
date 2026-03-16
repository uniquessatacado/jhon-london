import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Tag, Save, Loader2 } from 'lucide-react';
import { useSaleStatuses, useSaveSaleStatuses, SaleStatus } from '@/hooks/use-sale-statuses';

const COLOR_OPTIONS = [
  { value: 'emerald', label: 'Verde (Concluído/Sucesso)', class: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' },
  { value: 'blue', label: 'Azul (Informativo/Processando)', class: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
  { value: 'amber', label: 'Amarelo (Alerta/Aguardando)', class: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
  { value: 'red', label: 'Vermelho (Erro/Cancelado)', class: 'bg-red-500/20 text-red-500 border-red-500/30' },
  { value: 'purple', label: 'Roxo (Destaque)', class: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
  { value: 'zinc', label: 'Cinza (Neutro/Pendente)', class: 'bg-zinc-500/20 text-zinc-500 border-zinc-500/30 dark:text-zinc-300' },
];

export function SaleStatusPage() {
  const { data: initialStatuses, isLoading } = useSaleStatuses();
  const { mutate: saveStatuses, isPending } = useSaveSaleStatuses();
  
  const [statuses, setStatuses] = useState<SaleStatus[]>([]);
  const [isEdited, setIsEdited] = useState(false);

  // Inicializa o estado local quando os dados chegam
  if (initialStatuses && statuses.length === 0 && !isEdited) {
    setStatuses(initialStatuses);
  }

  const handleAddStatus = () => {
    setStatuses([...statuses, { id: Date.now().toString(), label: 'Novo Status', color: 'zinc' }]);
    setIsEdited(true);
  };

  const handleUpdateStatus = (id: string, field: keyof SaleStatus, value: string) => {
    setStatuses(statuses.map(s => s.id === id ? { ...s, [field]: value } : s));
    setIsEdited(true);
  };

  const handleRemoveStatus = (id: string) => {
    setStatuses(statuses.filter(s => s.id !== id));
    setIsEdited(true);
  };

  const handleSave = () => {
    // Evita salvar status vazios
    const validStatuses = statuses.filter(s => s.label.trim() !== '');
    saveStatuses(validStatuses, {
      onSuccess: () => setIsEdited(false)
    });
  };

  if (isLoading) {
    return <div className="flex justify-center h-[60vh] items-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Status de Vendas</h1>
          <p className="text-muted-foreground">Personalize as etapas pelas quais seus pedidos passam.</p>
        </div>
        <Button onClick={handleSave} disabled={!isEdited || isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>

      <Card className="bg-card backdrop-blur-xl border shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-emerald-500" /> Etiquetas de Status</CardTitle>
          <CardDescription>Crie novos status e defina cores para facilitar a identificação visual dos pedidos.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          
          <div className="grid gap-3">
            {statuses.map((status) => {
              const colorObj = COLOR_OPTIONS.find(c => c.value === status.color) || COLOR_OPTIONS[5];
              return (
                <div key={status.id} className="flex items-center gap-4 p-3 rounded-xl border bg-muted/50 transition-all hover:bg-muted group">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <Input 
                      value={status.label} 
                      onChange={(e) => handleUpdateStatus(status.id, 'label', e.target.value)}
                      placeholder="Nome do status..."
                      className="font-medium bg-background"
                    />
                    <div className="flex items-center gap-3">
                      <Select value={status.color} onValueChange={(val) => handleUpdateStatus(status.id, 'color', val)}>
                        <SelectTrigger className="bg-background flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COLOR_OPTIONS.map(c => (
                            <SelectItem key={c.value} value={c.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full border ${c.class.split(' ')[0]} border-current`} />
                                {c.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="hidden md:flex w-32 justify-end">
                        <Badge variant="outline" className={`px-3 py-1 text-xs border ${colorObj.class}`}>
                          {status.label || 'Preview'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveStatus(status.id)} className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <Button variant="outline" onClick={handleAddStatus} className="w-full border-dashed h-12 text-muted-foreground hover:text-foreground hover:border-emerald-500/50">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Status
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}