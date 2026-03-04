import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Grid, GridSize } from '@/types';
import { toast } from 'sonner';

type CreateGridDTO = {
  nome: string;
  tamanhos: Omit<GridSize, 'id'>[];
};

type UpdateGridDTO = CreateGridDTO & { id: number };

// Função blindada para garantir que vírgulas virem pontos e nunca envie NaN (Not a Number) para o back-end
const parseToNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // Troca vírgula por ponto caso o usuário ou o navegador use formatação pt-BR
  const parsed = parseFloat(String(value).replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
};

// --- Create ---
async function createGrid(newGrid: CreateGridDTO): Promise<Grid> {
  const payload = {
    nome: newGrid.nome,
    tamanhos: newGrid.tamanhos.map(t => ({
      tamanho: t.tamanho,
      peso_kg: parseToNumber(t.peso_kg),
      altura_cm: parseToNumber(t.altura_cm),
      largura_cm: parseToNumber(t.largura_cm),
      comprimento_cm: parseToNumber(t.comprimento_cm),
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
      toast.success('Grade criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['grids'] });
    },
    onError: (error: any) => {
      console.error("Erro completo ao criar grade:", error.response?.data);
      toast.error('Falha ao criar grade.', {
        description: error.response?.data?.message || 'Verifique os dados e tente novamente.'
      });
    },
  });
}

// --- Update ---
async function updateGrid(updatedGrid: UpdateGridDTO): Promise<Grid> {
  const payload = {
    nome: updatedGrid.nome,
    // Mapeamos estritamente os campos necessários, descartando IDs temporários do React Hook Form
    tamanhos: updatedGrid.tamanhos.map(t => ({
      tamanho: t.tamanho,
      peso_kg: parseToNumber(t.peso_kg),
      altura_cm: parseToNumber(t.altura_cm),
      largura_cm: parseToNumber(t.largura_cm),
      comprimento_cm: parseToNumber(t.comprimento_cm),
    }))
  };
  
  const { data } = await api.put(`/grades/${updatedGrid.id}`, payload);
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
    onError: (error: any) => {
      console.error('Erro completo ao atualizar grade:', error.response?.data);
      toast.error('Falha ao atualizar grade.', {
        description: error.response?.data?.message || 'A API recusou o formato dos dados.'
      });
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
    onError: (error: any) => {
      console.error('Falha ao excluir grade:', error.response?.data);
      toast.error('Falha ao excluir grade.', {
        description: error.response?.data?.message || 'Erro desconhecido.'
      });
    },
  });
}