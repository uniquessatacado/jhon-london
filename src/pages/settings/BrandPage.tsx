import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useBrands } from '@/hooks/use-brands';
import { useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/hooks/use-brand-mutations';
import { Skeleton } from '@/components/ui/skeleton';
import { Brand } from '@/types';

export function BrandPage() {
  const { data: brands, isLoading } = useBrands();
  const { mutate: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand();
  const { mutate: deleteBrand } = useDeleteBrand();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const { register, handleSubmit, reset } = useForm<{ nome: string }>();

  const handleOpenDialog = (brand: Brand | null = null) => {
    setEditingBrand(brand);
    reset({ nome: brand?.nome || '' });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBrand(null);
    reset();
  };

  const onSubmit = (data: { nome: string }) => {
    if (editingBrand) {
      updateBrand({ id: editingBrand.id, ...data }, { onSuccess: handleCloseDialog });
    } else {
      createBrand(data, { onSuccess: handleCloseDialog });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marcas</h1>
          <p className="text-muted-foreground">Gerencie as marcas de produtos.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Marca
        </Button>
      </div>
      
      <Card className="bg-black/20 border-white/10 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="pl-6">Nome da Marca</TableHead>
                <TableHead className="w-[100px] text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell className="pl-6"><Skeleton className="h-6 w-48 bg-white/5" /></TableCell>
                    <TableCell className="pr-6"><Skeleton className="h-8 w-8 ml-auto bg-white/5" /></TableCell>
                  </TableRow>
                ))
              ) : brands?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-32 text-center text-muted-foreground">
                    Nenhuma marca cadastrada.
                  </TableCell>
                </TableRow>
              ) : brands?.map(brand => (
                <TableRow key={brand.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium pl-6">{brand.nome}</TableCell>
                  <TableCell className="text-right pr-6">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="hover:bg-white/10"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                          <DropdownMenuItem onClick={() => handleOpenDialog(brand)} className="hover:bg-white/10 cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-500 hover:bg-red-500/10 focus:text-red-400 cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent className="bg-zinc-950 border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Marca?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente a marca "{brand.nome}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteBrand(brand.id)} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10">
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Editar Marca' : 'Nova Marca'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Marca</Label>
              <Input id="nome" className="bg-black/40 border-white/10" placeholder="Ex: Nike, Adidas..." {...register('nome', { required: true })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="bg-transparent border-white/10 hover:bg-white/5" onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit" disabled={isCreating || isUpdating} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {isCreating || isUpdating ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}