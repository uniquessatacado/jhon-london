import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Função para registrar histórico
const logSaleHistory = async (venda_id: number, usuario_id: number | undefined, usuario_nome: string | undefined, acao: string, detalhes: object) => {
  await supabase.from('venda_historico').insert([{
    venda_id,
    usuario_id,
    usuario_nome,
    acao,
    detalhes
  }]);
};

// --- Update Sale Status ---
type UpdateStatusPayload = { id: number; status: string; userId?: number; userName?: string; };

async function updateSaleStatus({ id, status, userId, userName }: UpdateStatusPayload) {
  const { data, error } = await supabase
    .from('vendas')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logSaleHistory(id, userId, userName, 'Alteração de Status', { novo_status: status });

  return data;
}

export function useUpdateSaleStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSaleStatus,
    onSuccess: () => {
      toast.success('Status da venda atualizado!');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (err: any) => toast.error('Falha ao atualizar status.', { description: err.message }),
  });
}

// --- Delete Sale ---
type DeletePayload = { id: number; userId?: number; userName?: string; };

async function deleteSale({ id, userId, userName }: DeletePayload) {
  // Primeiro, loga a exclusão.
  await logSaleHistory(id, userId, userName, 'Exclusão de Venda', { venda_id: id });

  const { error } = await supabase.from('vendas').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      toast.success('Venda excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (err: any) => toast.error('Falha ao excluir venda.', { description: err.message }),
  });
}