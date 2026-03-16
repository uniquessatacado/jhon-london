import { useQuery } from '@tanstack/react-query';
import { supabase, getProductImageUrl } from '@/lib/supabase';
import { DashboardMetrics, Sale, Customer, ProductMetric, DashboardFilters } from '@/types/dashboard';

// Função auxiliar para converter o filtro de período em datas ISO para o banco de dados
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
      start.setDate(now.getDate() - 30); // Padrão: 30 dias
  }

  return { start: start.toISOString(), end: end.toISOString() };
};

// Carregamento paralelo com Promise.all buscando DIRETO NO SUPABASE
async function fetchAllDashboardData(filters: DashboardFilters) {
  const { start, end } = getDateRange(filters);

  // Consulta diretamente nas tabelas (substituindo a API que está dando erro SSL)
  // Utilizamos o Promise.all para otimizar e buscar tudo paralelamente
  const [
    { data: vendasData },
    { data: clientesData },
    { data: vendasItensData }
  ] = await Promise.all([
    supabase.from('vendas').select('*').gte('created_at', start).lte('created_at', end),
    supabase.from('clientes').select('*'),
    // Usamos um catch interno (convertendo para Promise padrão) na query de itens caso a tabela de itens ainda não exista
    Promise.resolve(supabase.from('vendas_itens').select('*, produtos(nome, imagem_principal, estoque)')).catch(() => ({ data: [] }))
  ]);

  const vendas = vendasData || [];
  const clientes = clientesData || [];

  // Mapa rápido para buscar dados de clientes
  const clientMap = new Map();
  clientes.forEach(c => clientMap.set(c.id, c));

  // 1. Cálculo de Métricas (Faturamento, Ticket, Lucro, Custo)
  const faturamento = vendas.reduce((sum, v) => sum + (Number(v.valor_total) || 0), 0);
  const total_pedidos = vendas.length;
  const ticket_medio = total_pedidos > 0 ? faturamento / total_pedidos : 0;
  
  // Fallback seguro: se a tabela vendas não tiver custo_total salvo, estimamos provisoriamente
  const custo = vendas.reduce((sum, v) => sum + (Number(v.custo_total) || (Number(v.valor_total) * 0.6) || 0), 0);
  const lucro_bruto = faturamento - custo;

  const metrics: DashboardMetrics = {
    faturamento,
    lucro_bruto,
    custo,
    ticket_medio,
    total_pedidos,
    media_produtos_pedido: (vendasItensData && total_pedidos > 0) ? Math.round(vendasItensData.length / total_pedidos) : 0,
    visitas_site: Math.floor(Math.random() * 500) + 150 // Placeholder visual para visitas
  };

  // 2. Mapeamento de Vendas (Recentes e Maiores)
  const mappedSales: Sale[] = vendas.map(v => {
    const cliente = clientMap.get(v.cliente_id);
    return {
      id: v.id,
      cliente_nome: cliente?.nome || v.cliente_nome || 'Cliente não identificado',
      valor_total: Number(v.valor_total) || 0,
      data: v.created_at || v.data, // Fallback para nomes de colunas diferentes
      status: v.status || 'Concluído',
      itens_count: v.itens_count || 1
    };
  });

  const recentSales = [...mappedSales].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);
  const biggestOrders = [...mappedSales].sort((a, b) => b.valor_total - a.valor_total).slice(0, 5);

  // 3. Clientes Elite (Top Spenders) - Agregados por Cliente
  const customerSpends: Record<string, any> = {};
  vendas.forEach(v => {
    const cId = v.cliente_id;
    if (cId) {
      if (!customerSpends[cId]) {
        const cliente = clientMap.get(cId);
        customerSpends[cId] = {
          id: cId,
          nome: cliente?.nome || v.cliente_nome || 'Desconhecido',
          email: cliente?.email || '',
          cidade: cliente?.cidade || '',
          estado: cliente?.estado || '',
          total_gasto: 0
        };
      }
      customerSpends[cId].total_gasto += Number(v.valor_total) || 0;
    }
  });

  const eliteCustomers: Customer[] = Object.values(customerSpends)
    .sort((a: any, b: any) => b.total_gasto - a.total_gasto)
    .slice(0, 5);

  // 4. Novos Clientes
  const newCustomers: Customer[] = [...clientes]
    .filter(c => {
       const d = new Date(c.created_at || c.criado_em || 0);
       return d.getTime() > 0 && d >= new Date(start) && d <= new Date(end);
    })
    .sort((a, b) => new Date(b.created_at || b.criado_em).getTime() - new Date(a.created_at || a.criado_em).getTime())
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      nome: c.nome,
      email: c.email,
      data_cadastro: c.created_at || c.criado_em,
      cidade: c.cidade,
      estado: c.estado
    }));

  // 5. Produtos Mais Vendidos
  let topProducts: ProductMetric[] = [];
  try {
    if (vendasItensData && vendasItensData.length > 0) {
        const productAgg: Record<string, any> = {};
        vendasItensData.forEach((item: any) => {
            const pId = item.produto_id;
            if (pId && item.produtos) {
                if (!productAgg[pId]) {
                    productAgg[pId] = {
                        id: pId,
                        nome: item.produtos.nome || `Produto ${pId}`,
                        imagem: getProductImageUrl(item.produtos.imagem_principal),
                        quantidade_vendida: 0,
                        valor_total_vendido: 0,
                        estoque_atual: item.produtos.estoque || 0
                    };
                }
                productAgg[pId].quantidade_vendida += Number(item.quantidade) || 0;
                productAgg[pId].valor_total_vendido += (Number(item.quantidade) || 0) * (Number(item.valor_unitario) || 0);
            }
        });
        topProducts = Object.values(productAgg).sort((a: any, b: any) => b.quantidade_vendida - a.quantidade_vendida).slice(0, 5);
    }
  } catch(e) {
     console.warn("Could not aggregate top products", e);
  }

  return {
    metrics,
    recentSales,
    biggestOrders,
    newCustomers,
    eliteCustomers,
    topProducts,
  };
}

export function useDashboardData(filters: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard-all', filters],
    queryFn: () => fetchAllDashboardData(filters),
    staleTime: 2 * 60 * 1000, 
    gcTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}