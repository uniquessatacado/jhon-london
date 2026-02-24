export interface DashboardMetrics {
  faturamento: number;
  lucro_bruto: number;
  custo: number;
  ticket_medio: number;
  total_pedidos: number;
  media_produtos_pedido: number;
  visitas_site: number;
}

export interface Sale {
  id: number;
  cliente_nome: string;
  valor_total: number;
  data: string;
  status: string;
  itens_count: number;
}

export interface Customer {
  id: number;
  nome: string;
  email: string;
  total_gasto?: number; // For elite customers
  data_cadastro?: string; // For new customers
  cidade?: string;
  estado?: string;
}

export interface ProductMetric {
  id: number;
  nome: string;
  imagem: string;
  quantidade_vendida: number;
  valor_total_vendido: number;
  estoque_atual: number;
}

export type PeriodOption = 'hoje' | 'ontem' | '7_dias' | '30_dias' | 'este_mes' | 'mes_passado' | 'customizado';
export type TypeOption = 'varejo' | 'atacado' | 'tudo';

export interface DashboardFilters {
  periodo: PeriodOption;
  data_inicio?: string;
  data_fim?: string;
  tipo: TypeOption;
}