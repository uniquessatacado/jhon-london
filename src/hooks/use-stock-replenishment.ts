import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
  await api.post(`/produtos/${id}/repor-estoque`, { adicoes });
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
      console.error('Erro ao repor estoque:', error);
      toast.error('Falha ao repor estoque.', {
        description: error.response?.data?.message || 'Erro desconhecido.'
      });
    },
  });
}