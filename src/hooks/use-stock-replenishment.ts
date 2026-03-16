import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type ReplenishmentItem = {
  tamanho: string;
  quantidade: number;
};

type ReplenishPayload = {
  id: number;
  adicoes: ReplenishmentItem[];
};

async function replenishStock({ id, adicoes }: ReplenishPayload): Promise<void> {
  // Busca as variações atuais para poder somar o estoque
  const { data: variations, error: fetchErr } = await supabase
    .from('produto_variacoes')
    .select('*')
    .eq('produto_id', id);

  if (fetchErr) throw new Error(fetchErr.message);
  if (!variations) return;

  // Atualiza variação por variação (ou faria um RPC)
  for (const adicao of adicoes) {
    const v = variations.find(v => v.tamanho === adicao.tamanho);
    if (v) {
      const novoEstoque = Number(v.estoque) + Number(adicao.quantidade);
      const { error: updateErr } = await supabase
        .from('produto_variacoes')
        .update({ estoque: novoEstoque })
        .eq('id', v.id);
        
      if (updateErr) throw new Error(`Erro ao atualizar tamanho ${adicao.tamanho}`);
    }
  }
}

export function useReplenishStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replenishStock,
    onSuccess: () => {
      toast.success('Estoque reposto com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error('Falha ao repor estoque.', { description: error.message });
    },
  });
}