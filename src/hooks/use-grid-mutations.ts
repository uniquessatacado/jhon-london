import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Grid, GridSize } from '@/types';
import { toast } from 'sonner';

type GridSizeInput = { id?: number; tamanho: string; peso_kg: number | string; altura_cm: number | string; largura_cm: number | string; comprimento_cm: number | string; };
type CreateGridDTO = { nome: string; tamanhos: GridSizeInput[]; };
type UpdateGridDTO = CreateGridDTO & { id: number };

const parseToNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = parseFloat(String(value).replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
};

async function createGrid(newGrid: CreateGridDTO): Promise<Grid> {
  // 1. Cria a grade mestre
  const { data: grade, error: err1 } = await supabase.from('grades').insert([{ nome: newGrid.nome }]).select().single();
  if (err1) throw new Error(err1.message);

  // 2. Insere os tamanhos vinculados
  const tamanhos = newGrid.tamanhos.map(t => ({
    grade_id: grade.id,
    tamanho: t.tamanho,
    peso_kg: parseToNumber(t.peso_kg),
    altura_cm: parseToNumber(t.altura_cm),
    largura_cm: parseToNumber(t.largura_cm),
    comprimento_cm: parseToNumber(t.comprimento_cm),
  }));
  
  const { error: err2 } = await supabase.from('grade_tamanhos').insert(tamanhos);
  if (err2) throw new Error(err2.message);
  
  return grade;
}

export function useCreateGrid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGrid,
    onSuccess: () => {
      toast.success('Grade criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['grids'] });
    },
    onError: (err) => toast.error('Falha ao criar grade.', { description: err.message }),
  });
}

async function updateGrid(updatedGrid: UpdateGridDTO): Promise<Grid> {
  const { data: grade, error: err1 } = await supabase.from('grades').update({ nome: updatedGrid.nome }).eq('id', updatedGrid.id).select().single();
  if (err1) throw new Error(err1.message);

  // Para evitar problemas de IDs de grade, removemos os tamanhos antigos e inserimos os novos
  await supabase.from('grade_tamanhos').delete().eq('grade_id', updatedGrid.id);

  const tamanhos = updatedGrid.tamanhos.map(t => ({
    grade_id: updatedGrid.id,
    tamanho: t.tamanho,
    peso_kg: parseToNumber(t.peso_kg),
    altura_cm: parseToNumber(t.altura_cm),
    largura_cm: parseToNumber(t.largura_cm),
    comprimento_cm: parseToNumber(t.comprimento_cm),
  }));
  
  const { error: err2 } = await supabase.from('grade_tamanhos').insert(tamanhos);
  if (err2) throw new Error(err2.message);

  return grade;
}

export function useUpdateGrid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGrid,
    onSuccess: () => {
      toast.success('Grade atualizada!');
      queryClient.invalidateQueries({ queryKey: ['grids'] });
    },
    onError: (err) => toast.error('Falha ao atualizar grade.', { description: err.message }),
  });
}

async function deleteGrid(id: number): Promise<void> {
  const { error } = await supabase.from('grades').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function useDeleteGrid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGrid,
    onSuccess: () => {
      toast.success('Grade excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['grids'] });
    },
    onError: (err) => toast.error('Falha ao excluir grade.', { description: err.message }),
  });
}