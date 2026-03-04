import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import { useGrids } from '@/hooks/use-grids';
import { useCreateGrid, useUpdateGrid, useDeleteGrid } from '@/hooks/use-grid-mutations';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Grid } from '@/types';

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
  const { mutate: updateGrid, isPending: isUpdating } = useUpdateGrid();
  const { mutate: deleteGrid } = useDeleteGrid();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

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

  const handleOpenDialog = (gridToEdit?: Grid) => {
    if (gridToEdit) {
      setEditingId(gridToEdit.id);
      reset({
        nome: gridToEdit.nome,
        tamanhos: gridToEdit.tamanhos.map(t => ({
            tamanho: t.tamanho,
            peso_kg: t.peso_kg || 0,
            altura_cm: t.altura_cm || 0,
            largura_cm: t.largura_cm || 0,
            comprimento_cm: t.comprimento_cm || 0
        }))
      });
    } else {
      setEditingId(null);
      reset({
        nome: '',
        tamanhos: [{ tamanho: '', peso_kg: 0, altura_cm: 0, largura_cm: 0, comprimento_cm: 0 }]
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: GridForm) => {
    if (editingId) {
      updateGrid({ id: editingId, ...data }, { onSuccess: () => setIsDialogOpen(false) });
    } else {
      createGrid(data, { onSuccess: () => setIsDialogOpen(false) });
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grades de Tamanhos</h1>
          <p className="text-muted-foreground">Cadastre grades com dimensões pré-definidas para cálculo de frete.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Grade
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl bg-white/5" />)
        ) : grids?.map(grid => (
          <Card key={grid.id} className="bg-black/20 border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all group shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-xl text-white">{grid.nome}</h3>
                    <p className="text-sm text-muted-foreground">{grid.tamanhos?.length || 0} variações</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg"
                    onClick={() => handleOpenDialog(grid)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-950 border-white/10">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Grade?</AlertDialogTitle>
                        <AlertDialogDescription>Isso não afetará produtos já cadastrados, mas impedirá novos vínculos.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteGrid(grid.id)} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                    {grid.tamanhos?.slice(0, 5).map((t, idx) => (
                        <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-1 text-xs flex items-center gap-2">
                            <span className="font-bold text-emerald-400">{t.tamanho}</span>
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
        {grids?.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-10 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
                Nenhuma grade cadastrada. Crie uma nova grade para começar.
            </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-zinc-950 border-white/10">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Grade' : 'Nova Grade de Tamanhos'}</DialogTitle>
            <DialogDescription>Defina os tamanhos e as dimensões de embalagem para cada um (usado no cálculo de frete).</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden mt-4">
            <div className="mb-6 space-y-2">
              <Label htmlFor="nome">Nome da Grade</Label>
              <Input id="nome" {...register('nome', { required: true })} className="bg-black/40 border-white/10 h-12" placeholder="Ex: Roupas Adulto (P ao GG)" />
              {errors.nome && <p className="text-red-500 text-xs">Obrigatório</p>}
            </div>

            <div className="flex-1 overflow-hidden border border-white/10 rounded-xl bg-black/20 flex flex-col">
                <div className="p-3 border-b border-white/10 bg-white/5 grid grid-cols-12 gap-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    <div className="col-span-2">Tamanho</div>
                    <div className="col-span-2">Peso (kg)</div>
                    <div className="col-span-2">Altura (cm)</div>
                    <div className="col-span-2">Largura (cm)</div>
                    <div className="col-span-3">Comp. (cm)</div>
                    <div className="col-span-1"></div>
                </div>
                <ScrollArea className="flex-1 max-h-[40vh]">
                    <div className="p-2 space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-2 items-center px-2">
                                <div className="col-span-2">
                                    <Input {...register(`tamanhos.${index}.tamanho`, { required: true })} placeholder="Ex: P" className="h-10 bg-black/40 border-white/10 font-bold text-emerald-400 uppercase" />
                                </div>
                                <div className="col-span-2">
                                    <Input type="number" step="0.001" {...register(`tamanhos.${index}.peso_kg`, { required: true })} placeholder="0.000" className="h-10 bg-black/40 border-white/10" />
                                </div>
                                <div className="col-span-2">
                                    <Input type="number" {...register(`tamanhos.${index}.altura_cm`, { required: true })} placeholder="0" className="h-10 bg-black/40 border-white/10" />
                                </div>
                                <div className="col-span-2">
                                    <Input type="number" {...register(`tamanhos.${index}.largura_cm`, { required: true })} placeholder="0" className="h-10 bg-black/40 border-white/10" />
                                </div>
                                <div className="col-span-3">
                                    <Input type="number" {...register(`tamanhos.${index}.comprimento_cm`, { required: true })} placeholder="0" className="h-10 bg-black/40 border-white/10" />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-red-500 hover:bg-red-500/10 rounded-lg">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-3 border-t border-white/10 bg-black/40">
                    <Button type="button" variant="outline" onClick={() => append({ tamanho: '', peso_kg: 0, altura_cm: 0, largura_cm: 0, comprimento_cm: 0 })} className="w-full border-dashed border-white/20 hover:border-emerald-500 hover:text-emerald-500 bg-transparent h-10">
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Linha de Tamanho
                    </Button>
                </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" className="bg-transparent border-white/10 hover:bg-white/5" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  {isSaving ? 'Salvando...' : 'Salvar Grade Completa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}