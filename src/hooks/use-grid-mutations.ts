import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Grid, GridSize } from '@/types';
import { toast } from 'sonner';

type CreateGridDTO = {
  nome: string;
  tamanhos: Omit<GridSize, 'id'>[];
};

// --- Create ---
async function createGrid(newGrid: CreateGridDTO): Promise<Grid> {
  // Garantir que números sejam números
  const payload = {
    ...newGrid,
    tamanhos: newGrid.tamanhos.map(t => ({
      ...t,
      peso_kg: Number(t.peso_kg),
      altura_cm: Number(t.altura_cm),
      largura_cm: Number(t.largura_cm),
      comprimento_cm: Number(t.comprimento_cm),
    }))
  };
  const { data } = await api.post('/grades', payload);
  return data;
}

export function useCreateGrid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGrid,
    onSuccess: () => {
      toast.success('Grade e tamanhos criados com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['grids'] });
    },
    onError: (err) => {
        console.error(err);
      toast.error('Falha ao criar grade.');
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