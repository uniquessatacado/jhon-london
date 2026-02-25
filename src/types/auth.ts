export interface UserPermissions {
  dashboard: boolean;
  produtos: boolean;
  clientes: boolean;
  financeiro: boolean;
  cadastros: boolean;
  usuarios: boolean;
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