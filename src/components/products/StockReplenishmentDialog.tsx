import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product } from '@/types';
import { useReplenishStock } from '@/hooks/use-stock-replenishment';
import { Loader2, PackagePlus, ArrowRight } from 'lucide-react';

interface StockReplenishmentDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockReplenishmentDialog({ product, open, onOpenChange }: StockReplenishmentDialogProps) {
  const { mutate: replenish, isPending } = useReplenishStock();
  const { control, register, handleSubmit, reset, watch } = useForm<{ items: { tamanho: string, atual: number, adicionar: number }[] }>({
    defaultValues: { items: [] }
  });

  const { fields } = useFieldArray({
    control,
    name: "items"
  });

  // Watch for live calculation
  const watchedItems = watch("items");

  useEffect(() => {
    if (product && open) {
      const items = product.variacoes?.map(v => ({
        tamanho: v.tamanho,
        atual: Number(v.estoque) || 0,
        adicionar: 0
      })) || [];
      
      // Se não tiver variações, usa um item "Único" ou similar baseando no estoque geral?
      // O requisito diz "Lista tamanhos da grade". Se não tiver grade, não faz sentido repor por tamanho.
      // Assumindo que produtos têm grade. Se não tiver variações explícitas, talvez seja produto simples.
      if (items.length === 0) {
         items.push({ tamanho: 'UN', atual: Number(product.estoque) || 0, adicionar: 0 });
      }

      reset({ items });
    }
  }, [product, open, reset]);

  const onSubmit = (data: { items: { tamanho: string, adicionar: number }[] }) => {
    if (!product) return;

    const adicoes = data.items
      .filter(i => i.adicionar > 0)
      .map(i => ({
        tamanho: i.tamanho,
        quantidade: i.adicionar
      }));

    if (adicoes.length === 0) return;

    replenish({ id: product.id, adicoes }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-emerald-500" /> Repor Estoque
          </DialogTitle>
          <DialogDescription>
            Adicionar unidades ao produto <strong>{product.nome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[60vh] overflow-y-auto border rounded-md my-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Tam</TableHead>
                  <TableHead className="text-center">Atual</TableHead>
                  <TableHead className="w-[100px]">Chegou</TableHead>
                  <TableHead className="text-right">Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const current = watchedItems?.[index]?.atual || 0;
                  const added = Number(watchedItems?.[index]?.adicionar) || 0;
                  const final = current + added;

                  return (
                    <TableRow key={field.id}>
                      <TableCell className="font-bold">{field.tamanho}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{current}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min="0" 
                          className="h-8 text-center"
                          {...register(`items.${index}.adicionar`, { valueAsNumber: true, min: 0 })} 
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span className={added > 0 ? "text-emerald-500 font-bold" : "text-muted-foreground"}>
                          {final}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending} className="bg-emerald-500 hover:bg-emerald-600">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckIcon className="mr-2 h-4 w-4" />} 
              Confirmar Reposição
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}