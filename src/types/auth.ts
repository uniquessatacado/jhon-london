export interface UserPermissions {
  // Acesso Geral às Páginas
  dashboard: boolean;
  produtos: boolean;
  clientes: boolean;
  financeiro: boolean;
  cadastros: boolean;
  usuarios: boolean;

  // Permissões Granulares do Dashboard
  dash_faturamento?: boolean;
  dash_lucro?: boolean;
  dash_custo?: boolean;
  dash_ticket?: boolean;
  dash_pedidos?: boolean;
  dash_media_items?: boolean;
  dash_visitas?: boolean;
  dash_vendas_recentes?: boolean;
  dash_maiores_pedidos?: boolean;
  dash_novos_clientes?: boolean;
  dash_clientes_elite?: boolean;
  dash_top_produtos?: boolean;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  whatsapp?: string;
  role: 'admin' | 'colaborador';
  permissoes: UserPermissions;
}

export interface LoginResponse {
  token: string;
  user: User;
}