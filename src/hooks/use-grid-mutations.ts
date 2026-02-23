import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Grid } from '@/types';
import { toast } from 'sonner';

// --- Create ---
async function createGrid(newGrid: { nome: string }): Promise<Grid> {
  const { data } = await api.post('/grades', newGrid);
  return data;
}

export function useCreateGrid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGrid,
    onSuccess: () => {
      toast.success('Grade criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['grids'] });
    },
    onError: () => {
      toast.error('Falha ao criar grade.');
    },
  });
}

// --- Update ---
async function updateGrid({ id, ...updatedGrid }: Partial<Grid>): Promise<Grid> {
  const { data } = await api.put(`/grades/${id}`, updatedGrid);
  return data;
}

export function useUpdateGrid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGrid,
    onSuccess: () => {
      toast.success('Grade atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['grids'] });
    },
    onError: () => {
      toast.error('Falha ao atualizar grade.');
    },
  });
}

// --- Delete ---
async function deleteGrid(id: number): Promise<void> {
  await api.delete(`/grades/${id}`);
}

export function useDeleteGrid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGrid,
    onSuccess: () => {
      toast.success('Grade excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['grids'] });
    },
    onError: () => {
      toast.error('Falha ao excluir grade.');
    },
  });
}