import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface SaleStatus {
  id: string;
  label: string;
  color: string; // ex: 'emerald', 'blue', 'amber', 'red', 'purple', 'zinc'
}

const DEFAULT_STATUSES: SaleStatus[] = [
  { id: '1', label: 'Pendente', color: 'zinc' },
  { id: '2', label: 'Aguardando Pagamento', color: 'amber' },
  { id: '3', label: 'Em Separação', color: 'blue' },
  { id: '4', label: 'Concluído', color: 'emerald' },
  { id: '5', label: 'Cancelado', color: 'red' },
];

async function fetchStatuses(): Promise<SaleStatus[]> {
  const { data, error } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'venda_status_list')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
    console.error("Erro ao buscar status:", error);
    return DEFAULT_STATUSES;
  }

  if (data && data.valor) {
    try {
      return JSON.parse(data.valor);
    } catch (e) {
      return DEFAULT_STATUSES;
    }
  }

  return DEFAULT_STATUSES;
}

export function useSaleStatuses() {
  return useQuery({
    queryKey: ['sale-statuses'],
    queryFn: fetchStatuses,
  });
}

async function saveStatuses(statuses: SaleStatus[]) {
  const { error } = await supabase.from('configuracoes').upsert(
    { chave: 'venda_status_list', valor: JSON.stringify(statuses), descricao: 'Lista de status de vendas dinâmicos' },
    { onConflict: 'chave' }
  );

  if (error) throw new Error(error.message);
  return statuses;
}

export function useSaveSaleStatuses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveStatuses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-statuses'] });
      toast.success('Status atualizados com sucesso!');
    },
    onError: (err: any) => {
      toast.error('Erro ao salvar status.', { description: err.message });
    },
  });
}