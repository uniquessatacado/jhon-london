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
  // 1. Deletar os itens da venda (Resolve o erro venda_itens_venda_id_fkey)
  const { error: itemsError } = await supabase.from('venda_itens').delete().eq('venda_id', id);
  if (itemsError) throw new Error(`Erro ao excluir itens: ${itemsError.message}`);

  // 2. Deletar os pagamentos da venda
  const { error: paymentsError } = await supabase.from('venda_pagamentos').delete().eq('venda_id', id);
  if (paymentsError) throw new Error(`Erro ao excluir pagamentos: ${paymentsError.message}`);

  // 3. Deletar o histórico atrelado à venda
  const { error: historyError } = await supabase.from('venda_historico').delete().eq('venda_id', id);
  if (historyError) console.warn("Aviso ao deletar histórico (pode não existir):", historyError.message);

  // 4. Finalmente, deletar a venda
  const { error } = await supabase.from('vendas').delete().eq('id', id);
  if (error) throw new Error(`Erro ao excluir venda principal: ${error.message}`);
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