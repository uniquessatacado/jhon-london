import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { DashboardFilters } from '@/types/dashboard';

export interface FinancialMetrics {
  faturamento: number;
  custo: number;
  lucro: number;
  saldo_caixa: number;
  metodos_pagamento: Record<string, number>;
}

const getDateRange = (filters: DashboardFilters) => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  if (filters.periodo === 'customizado' && filters.data_inicio && filters.data_fim) {
    return { 
        start: new Date(filters.data_inicio).toISOString(), 
        end: new Date(filters.data_fim + 'T23:59:59').toISOString() 
    };
  }

  switch (filters.periodo) {
    case 'hoje':
      start.setHours(0, 0, 0, 0);
      break;
    case 'ontem':
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case '7_dias':
      start.setDate(now.getDate() - 7);
      break;
    case '30_dias':
      start.setDate(now.getDate() - 30);
      break;
    case 'este_mes':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'mes_passado':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }

  return { start: start.toISOString(), end: end.toISOString() };
};

async function fetchFinancialData(filters: DashboardFilters): Promise<FinancialMetrics> {
  const { start, end } = getDateRange(filters);

  // 1. Busca Vendas no período (para Faturamento e Custo)
  const { data: vendas } = await supabase
    .from('vendas')
    .select('valor_total, custo_total')
    .gte('created_at', start)
    .lte('created_at', end);

  // 2. Busca Pagamentos no período (para separação de Pix/Credito/etc)
  const { data: pagamentosPeriodo } = await supabase
    .from('venda_pagamentos')
    .select('forma_pagamento, valor')
    .gte('created_at', start)
    .lte('created_at', end);

  // 3. Busca TODO o dinheiro físico que entrou em vendas (Histórico Total para o Saldo do Caixa)
  const { data: pagamentosDinheiro } = await supabase
    .from('venda_pagamentos')
    .select('valor')
    .eq('forma_pagamento', 'dinheiro');

  // 4. Busca Todas as movimentações avulsas de caixa (Histórico Total)
  const { data: movsCaixa, error: movsError } = await supabase
    .from('caixa_movimentacoes')
    .select('tipo, valor');

  // Cálculos Período
  const faturamento = (vendas || []).reduce((acc, v) => acc + (Number(v.valor_total) || 0), 0);
  const custo = (vendas || []).reduce((acc, v) => acc + (Number(v.custo_total) || (Number(v.valor_total) * 0.6) || 0), 0); // fallback de 60% se não houver custo preenchido
  const lucro = faturamento - custo;

  const metodos_pagamento: Record<string, number> = {};
  (pagamentosPeriodo || []).forEach(p => {
    const metodo = p.forma_pagamento.toLowerCase();
    metodos_pagamento[metodo] = (metodos_pagamento[metodo] || 0) + Number(p.valor);
  });

  // Cálculos Saldo Físico (Caixa)
  const totalDinheiroVendas = (pagamentosDinheiro || []).reduce((acc, p) => acc + Number(p.valor), 0);
  
  let totalReforcos = 0;
  let totalRetiradas = 0;

  // Ignora o erro 42P01 caso a tabela ainda não tenha sido criada pelo usuário
  if (!movsError && movsCaixa) {
    movsCaixa.forEach(m => {
      if (m.tipo === 'entrada') totalReforcos += Number(m.valor);
      if (m.tipo === 'saida') totalRetiradas += Number(m.valor);
    });
  }

  const saldo_caixa = totalDinheiroVendas + totalReforcos - totalRetiradas;

  return {
    faturamento,
    custo,
    lucro,
    saldo_caixa,
    metodos_pagamento,
  };
}

export function useFinancialData(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['financial', filters],
    queryFn: () => fetchFinancialData(filters),
    placeholderData: (prev) => prev,
  });
}

// Mutação para adicionar Reforço/Retirada
export function useAddCashTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: { tipo: 'entrada' | 'saida', categoria: string, valor: number, descricao: string, usuario_id?: number }) => {
      const { error } = await supabase.from('caixa_movimentacoes').insert([transaction]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Movimentação registrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['financial'] });
    },
    onError: (err: any) => {
      toast.error('Erro ao registrar movimentação', { description: err.message });
    }
  });
}