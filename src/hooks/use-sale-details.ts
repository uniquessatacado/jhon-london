import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SaleFullDetails {
  id: number;
  created_at: string;
  cliente_id: number;
  valor_total: number;
  status: string;
  tipo_venda: string;
  origem: string;
  itens_count: number;
  clientes: {
    id: number;
    nome: string;
    whatsapp: string;
    email: string;
    cpf_cnpj: string;
    cidade: string;
    estado: string;
  } | null;
  venda_itens: {
    id: number;
    produto_id: number;
    tamanho: string;
    quantidade: number;
    preco_unitario: number;
    produtos: {
      nome: string;
      imagem_principal: string;
      sku: string;
    } | null;
  }[];
  venda_pagamentos: {
    id: number;
    forma_pagamento: string;
    valor: number;
    created_at: string;
  }[];
  venda_historico: {
    id: number;
    created_at: string;
    usuario_nome: string;
    acao: string;
    detalhes: any;
  }[];
}

async function fetchSaleFullDetails(saleId: string): Promise<SaleFullDetails> {
  // 1. Busca os dados principais (Venda, Cliente, Itens e Pagamentos)
  const { data, error } = await supabase
    .from('vendas')
    .select(`
      *,
      clientes (*),
      venda_itens (*, produtos (nome, imagem_principal, sku)),
      venda_pagamentos (*)
    `)
    .eq('id', saleId)
    .single();

  if (error) {
    console.error("Error fetching full sale details:", error);
    throw new Error(error.message);
  }

  // 2. Busca o histórico SEPARADAMENTE. Se a tabela não existir, não quebra a página.
  const { data: historyData, error: historyError } = await supabase
    .from('venda_historico')
    .select('*')
    .eq('venda_id', saleId)
    .order('created_at', { ascending: false });

  if (historyError) {
    console.warn("Aviso: Tabela venda_historico pode não existir ainda no banco de dados.", historyError.message);
  }

  data.venda_historico = historyData || [];

  return data as SaleFullDetails;
}

export function useSaleFullDetails(saleId: string | undefined) {
  return useQuery({
    queryKey: ['sale-full-details', saleId],
    queryFn: () => fetchSaleFullDetails(saleId!),
    enabled: !!saleId,
  });
}