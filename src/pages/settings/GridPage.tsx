import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Ruler } from 'lucide-react';
import { useGrids } from '@/hooks/use-grids';
import { useCreateGrid, useDeleteGrid } from '@/hooks/use-grid-mutations';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

type GridForm = {
  nome: string;
  tamanhos: {
    tamanho: string;
    peso_kg: number;
    altura_cm: number;
    largura_cm: number;
    comprimento_cm: number;
  }[];
};

export function GridPage() {
  const { data: grids, isLoading } = useGrids();
  const { mutate: createGrid, isPending: isCreating } = useCreateGrid();
  const { mutate: deleteGrid } = useDeleteGrid();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<GridForm>({
    defaultValues: {
      nome: '',
      tamanhos: [{ tamanho: '', peso_kg: 0, altura_cm: 0, largura_cm: 0, comprimento_cm: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tamanhos"
  });

  const handleOpenDialog = () => {
    reset({
      nome: '',
      tamanhos: [{ tamanho: '', peso_kg: 0, altura_cm: 0, largura_cm: 0, comprimento_cm: 0 }]
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: GridForm) => {
    createGrid(data, { 
      onSuccess: () => setIsDialogOpen(false) 
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Grades de Tamanhos</h1>
          <p className="text-muted-foreground">Cadastre grades com dimensões pré-definidas para cálculo de frete.</p>
        </div>
        <Button onClick={handleOpenDialog} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Grade
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
        ) : grids?.map(grid => (
          <Card key={grid.id} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-xl">{grid.nome}</h3>
                    <p className="text-sm text-muted-foreground">{grid.tamanhos?.length || 0} variações</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Grade?</AlertDialogTitle>
                      <AlertDialogDescription>Isso não afetará produtos já cadastrados, mas impedirá novos vínculos.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteGrid(grid.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                    {grid.tamanhos?.slice(0, 5).map((t, idx) => (
                        <div key={idx} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-xs flex items-center gap-2">
                            <span className="font-bold text-emerald-400">{t.tamanho}</span>
                            <span className="text-muted-foreground text-[10px]">{t.peso_kg}kg</span>
                        </div>
                    ))}
                    {(grid.tamanhos?.length || 0) > 5 && (
                        <span className="text-xs text-muted-foreground self-center">+{grid.tamanhos!.length - 5} mais...</span>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Nova Grade de Tamanhos</DialogTitle>
            <DialogDescription>Defina os tamanhos e as dimensões de embalagem para cada um.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="mb-6">
              <Label htmlFor="nome">Nome da Grade (Ex: Camisetas Adulto)</Label>
              <Input id="nome" {...register('nome', { required: true })} className="mt-1" placeholder="Identificação da grade..." />
              {errors.nome && <p className="text-red-500 text-sm">Obrigatório</p>}
            </div>

            <div className="flex-1 overflow-hidden border border-white/10 rounded-xl bg-black/20 flex flex-col">
                <div className="p-2 border-b border-white/10 bg-white/5 grid grid-cols-12 gap-2 font-medium text-sm text-muted-foreground px-4">
                    <div className="col-span-2">Tamanho</div>
                    <div className="col-span-2">Peso (kg)</div>
                    <div className="col-span-2">Altura (cm)</div>
                    <div className="col-span-2">Largura (cm)</div>
                    <div className="col-span-3">Comp. (cm)</div>
                    <div className="col-span-1"></div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-2 items-center px-2 animate-in fade-in slide-in-from-left-2">
                                <div className="col-span-2">
                                    <Input {...register(`tamanhos.${index}.tamanho`, { required: true })} placeholder="Ex: P" className="h-9" />
                                </div>
                                <div className="col-span-2">
                                    <Input type="number" step="0.001" {...register(`tamanhos.${index}.peso_kg`, { required: true })} placeholder="0.000" className="h-9" />
                                </div>
                                <div className="col-span-2">
                                    <Input type="number" {...register(`tamanhos.${index}.altura_cm`, { required: true })} placeholder="0" className="h-9" />
                                </div>
                                <div className="col-span-2">
                                    <Input type="number" {...register(`tamanhos.${index}.largura_cm`, { required: true })} placeholder="0" className="h-9" />
                                </div>
                                <div className="col-span-3">
                                    <Input type="number" {...register(`tamanhos.${index}.comprimento_cm`, { required: true })} placeholder="0" className="h-9" />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-red-500 hover:bg-red-500/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-2 border-t border-white/10 bg-white/5">
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ tamanho: '', peso_kg: 0, altura_cm: 0, largura_cm: 0, comprimento_cm: 0 })} className="w-full border-dashed border-white/20 hover:border-emerald-500 hover:text-emerald-500">
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tamanho
                    </Button>
                </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Salvando...' : 'Salvar Grade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}