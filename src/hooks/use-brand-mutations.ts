import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Brand } from '@/types';
import { toast } from 'sonner';

async function createBrand(newBrand: { nome: string }): Promise<Brand> {
  const { data, error } = await supabase.from('marcas').insert([newBrand]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      toast.success('Marca criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err) => toast.error('Falha ao criar marca.', { description: err.message }),
  });
}

async function updateBrand({ id, ...updatedBrand }: Partial<Brand>): Promise<Brand> {
  const { data, error } = await supabase.from('marcas').update(updatedBrand).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBrand,
    onSuccess: () => {
      toast.success('Marca atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err) => toast.error('Falha ao atualizar marca.', { description: err.message }),
  });
}

async function deleteBrand(id: number): Promise<void> {
  const { error } = await supabase.from('marcas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      toast.success('Marca excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (err) => toast.error('Falha ao excluir marca.', { description: err.message }),
  });
}