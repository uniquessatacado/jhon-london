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
  // 1. Busca APENAS a venda primeiro (Garante que a venda existe)
  const { data: venda, error: vendaError } = await supabase
    .from('vendas')
    .select('*')
    .eq('id', saleId)
    .single();

  if (vendaError || !venda) {
    console.error("Erro ao buscar a venda principal:", vendaError);
    throw new Error('Venda não encontrada');
  }

  // 2. Busca o Cliente
  let clienteData = null;
  if (venda.cliente_id) {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', venda.cliente_id)
      .single();
    clienteData = data;
  }

  // 3. Busca os Itens e junta com o Produto
  const { data: itensData } = await supabase
    .from('venda_itens')
    .select('*, produtos(nome, imagem_principal, sku)')
    .eq('venda_id', saleId);

  // 4. Busca os Pagamentos (Try/Catch silencioso caso a tabela não exista)
  const { data: pagamentosData, error: pagamentosError } = await supabase
    .from('venda_pagamentos')
    .select('*')
    .eq('venda_id', saleId);
    
  if (pagamentosError) console.warn("Tabela venda_pagamentos pode não existir.");

  // 5. Busca o Histórico (Try/Catch silencioso caso a tabela não exista)
  const { data: historicoData, error: historicoError } = await supabase
    .from('venda_historico')
    .select('*')
    .eq('venda_id', saleId)
    .order('created_at', { ascending: false });

  if (historicoError) console.warn("Tabela venda_historico pode não existir.");

  // 6. Monta o objeto final exatamente como a tela espera
  return {
    ...venda,
    clientes: clienteData,
    venda_itens: itensData || [],
    venda_pagamentos: pagamentosData || [],
    venda_historico: historicoData || []
  } as SaleFullDetails;
}

export function useSaleFullDetails(saleId: string | undefined) {
  return useQuery({
    queryKey: ['sale-full-details', saleId],
    queryFn: () => fetchSaleFullDetails(saleId!),
    enabled: !!saleId,
  });
}