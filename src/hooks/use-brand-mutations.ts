import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Brand } from '@/types';
import { toast } from 'sonner';

// --- Create ---
async function createBrand(newBrand: { nome: string }): Promise<Brand> {
  const { data } = await api.post('/marcas', newBrand);
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
    onError: () => {
      toast.error('Falha ao criar marca.');
    },
  });
}

// --- Update ---
async function updateBrand({ id, ...updatedBrand }: Partial<Brand>): Promise<Brand> {
  const { data } = await api.put(`/marcas/${id}`, updatedBrand);
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
    onError: (error: any) => {
      console.error('Falha ao atualizar marca:', error.response?.data);
      toast.error('Falha ao atualizar marca.', {
        description: error.response?.data?.message || 'Erro desconhecido.'
      });
    },
  });
}

// --- Delete ---
async function deleteBrand(id: number): Promise<void> {
  await api.delete(`/marcas/${id}`);
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      toast.success('Marca excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
    onError: (error: any) => {
      console.error('Falha ao excluir marca:', error.response?.data);
      toast.error('Falha ao excluir marca.', {
        description: error.response?.data?.message || 'Erro desconhecido.'
      });
    },
  });
}