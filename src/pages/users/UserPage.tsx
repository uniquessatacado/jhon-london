import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Pencil, Trash2, Shield, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { User as UserType, UserPermissions } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

const defaultPermissions: UserPermissions = {
  dashboard: false,
  produtos: false,
  clientes: false,
  financeiro: false,
  cadastros: false,
  usuarios: false,
  
  // Default Dashboard sub-permissions (off by default)
  dash_faturamento: false,
  dash_lucro: false,
  dash_custo: false,
  dash_ticket: false,
  dash_pedidos: false,
  dash_media_items: false,
  dash_visitas: false,
  dash_vendas_recentes: false,
  dash_maiores_pedidos: false,
  dash_novos_clientes: false,
  dash_clientes_elite: false,
  dash_top_produtos: false,
};

export function UserPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form handling
  const { register, handleSubmit, reset, setValue, watch } = useForm<any>();
  const watchRole = watch('role', 'colaborador');
  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/usuarios');
      let usersData = data;
      if (currentUser?.email.toLowerCase() !== 'ussloja@gmail.com') {
        usersData = data.filter((u: UserType) => u.email.toLowerCase() !== 'ussloja@gmail.com');
      }
      setUsers(usersData);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (userToEdit: UserType | null = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      
      // Reset form with existing user data
      reset({
        nome: userToEdit.nome,
        email: userToEdit.email,
        whatsapp: userToEdit.whatsapp || '',
        role: userToEdit.role,
        senha: '' // Password is optional on edit
      });

      // Robust permission merging logic (com fallback para null)
      let currentPerms = userToEdit.permissoes || {};
      
      // Handle potential stringified JSON from API
      if (typeof currentPerms === 'string') {
          try {
              currentPerms = JSON.parse(currentPerms) || {};
          } catch (e) {
              currentPerms = defaultPermissions;
          }
      }

      // Merge ensuring booleans to avoid unchecked boxes due to type mismatch
      const merged: any = { ...defaultPermissions };
      if (currentPerms && typeof currentPerms === 'object') {
          Object.keys(currentPerms).forEach(key => {
               // Force boolean cast (handles 1/0 or "true"/"false")
               merged[key] = Boolean((currentPerms as any)[key]);
          });
      }
      setPermissions(merged);
    } else {
      setEditingUser(null);
      reset({ 
        nome: '',
        email: '',
        whatsapp: '',
        role: 'colaborador',
        senha: ''
      });
      setPermissions(defaultPermissions);
    }
    setIsDialogOpen(true);
  };

  const handlePermissionChange = (key: keyof UserPermissions, checked: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: checked }));
  };

  const toggleAllDashboard = (checked: boolean) => {
      setPermissions(prev => ({
          ...prev,
          dashboard: checked,
          // Se desmarcar dashboard principal, desmarca tudo. Se marcar, mantém sub-opções como estavam ou marca tudo?
          // UX Comum: Se marcar "Dashboard", não necessariamente marca todas as sub-opções, mas aqui vamos ativar todas para facilitar,
          // ou manter o estado anterior seria complexo. Vamos ativar todas as subs para garantir visibilidade inicial.
          dash_faturamento: checked,
          dash_lucro: checked,
          dash_custo: checked,
          dash_ticket: checked,
          dash_pedidos: checked,
          dash_media_items: checked,
          dash_visitas: checked,
          dash_vendas_recentes: checked,
          dash_maiores_pedidos: checked,
          dash_novos_clientes: checked,
          dash_clientes_elite: checked,
          dash_top_produtos: checked,
      }));
  };

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        permissoes: data.role === 'admin' ? defaultPermissions : permissions,
      };

      if (editingUser) {
        if (!data.senha) delete payload.senha;
        await api.put(`/usuarios/${editingUser.id}`, payload);
        toast.success('Usuário atualizado!');
      } else {
        if (!data.senha) return toast.error('Senha é obrigatória para novos usuários');
        await api.post('/usuarios', payload);
        toast.success('Usuário criado!');
      }
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
        console.error(error);
        toast.error('Erro ao salvar usuário', { description: error.response?.data?.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/usuarios/${id}`);
      toast.success('Usuário excluído');
      fetchUsers();
    } catch (error: any) {
      toast.error('Erro ao excluir', { description: error.response?.data?.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie o acesso e permissões da equipe.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={5} className="text-center h-24">Carregando...</TableCell></TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id} className="border-white/5 hover:bg-white/5">
                <TableCell className="font-medium">{u.nome}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.role === 'admin' ? (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30">Admin</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">Colaborador</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {u.role === 'admin' ? (
                    <span className="text-xs text-muted-foreground italic">Acesso Total</span>
                  ) : (
                    <div className="flex gap-1 flex-wrap max-w-md">
                      {['dashboard', 'produtos', 'clientes', 'financeiro', 'cadastros', 'usuarios'].filter(k => (u.permissoes as any)?.[k]).map(k => (
                        <Badge key={k} variant="secondary" className="text-[10px] bg-white/10 text-white capitalize">{k}</Badge>
                      ))}
                      {(u.permissoes?.dashboard && Object.keys(u.permissoes || {}).filter(k => k.startsWith('dash_') && (u.permissoes as any)[k]).length > 0) && (
                         <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500">+ Métricas</Badge>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                   <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenDialog(u)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      {currentUser?.id !== u.id && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                                    <AlertDialogDescription>O usuário {u.nome} perderá o acesso imediatamente.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(u.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      )}
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col bg-zinc-950 border-white/10 p-6">
          <DialogHeader className="shrink-0 pb-2">
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>Defina as credenciais e nível de acesso.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden mt-2">
            <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input id="nome" {...register('nome', { required: true })} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
                      <Input id="whatsapp" {...register('whatsapp')} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="email">E-mail de Acesso</Label>
                      <Input id="email" type="email" {...register('email', { required: true })} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="senha">{editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}</Label>
                      <Input id="senha" type="password" {...register('senha', { required: !editingUser })} />
                  </div>
              </div>

              <div className="space-y-2">
                  <Label>Nível de Acesso</Label>
                  <Select onValueChange={(v) => setValue('role', v)} value={watchRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="colaborador">Colaborador (Acesso Restrito)</SelectItem>
                          <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

              {watchRole === 'colaborador' && (
                  <div className="space-y-3 pt-4 border-t border-white/10">
                      <Label className="flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500" /> Permissões de Acesso</Label>
                      
                      <div className="grid grid-cols-1 gap-2">
                          {/* DASHBOARD COM EXPANSÃO */}
                          <div className="border border-white/10 rounded-lg bg-white/5 overflow-hidden">
                              <div className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                                  <div className="flex items-center space-x-2">
                                      <Checkbox id="perm_dash" checked={!!permissions.dashboard} onCheckedChange={(c) => toggleAllDashboard(c as boolean)} />
                                      <label htmlFor="perm_dash" className="text-sm font-bold cursor-pointer">Dashboard (Visualizar Tela)</label>
                                  </div>
                              </div>
                              
                              {permissions.dashboard && (
                                  <div className="bg-black/20 p-3 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-3 animate-in slide-in-from-top-2">
                                      <p className="col-span-full text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Métricas Visíveis:</p>
                                      
                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_fat" checked={!!permissions.dash_faturamento} onCheckedChange={(c) => handlePermissionChange('dash_faturamento', c as boolean)} />
                                          <label htmlFor="d_fat" className="text-xs cursor-pointer">Faturamento</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_luc" checked={!!permissions.dash_lucro} onCheckedChange={(c) => handlePermissionChange('dash_lucro', c as boolean)} />
                                          <label htmlFor="d_luc" className="text-xs cursor-pointer">Lucro Bruto</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_cus" checked={!!permissions.dash_custo} onCheckedChange={(c) => handlePermissionChange('dash_custo', c as boolean)} />
                                          <label htmlFor="d_cus" className="text-xs cursor-pointer">Custo Total</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_tkt" checked={!!permissions.dash_ticket} onCheckedChange={(c) => handlePermissionChange('dash_ticket', c as boolean)} />
                                          <label htmlFor="d_tkt" className="text-xs cursor-pointer">Ticket Médio</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_ped" checked={!!permissions.dash_pedidos} onCheckedChange={(c) => handlePermissionChange('dash_pedidos', c as boolean)} />
                                          <label htmlFor="d_ped" className="text-xs cursor-pointer">Total Pedidos</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_med" checked={!!permissions.dash_media_items} onCheckedChange={(c) => handlePermissionChange('dash_media_items', c as boolean)} />
                                          <label htmlFor="d_med" className="text-xs cursor-pointer">Média Prod/Ped</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_vis" checked={!!permissions.dash_visitas} onCheckedChange={(c) => handlePermissionChange('dash_visitas', c as boolean)} />
                                          <label htmlFor="d_vis" className="text-xs cursor-pointer">Visitas</label>
                                      </div>
                                      
                                      <p className="col-span-full text-xs text-muted-foreground mt-2 mb-1 uppercase tracking-wider font-semibold">Listagens:</p>

                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_ven" checked={!!permissions.dash_vendas_recentes} onCheckedChange={(c) => handlePermissionChange('dash_vendas_recentes', c as boolean)} />
                                          <label htmlFor="d_ven" className="text-xs cursor-pointer">Últimas Vendas</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_mai" checked={!!permissions.dash_maiores_pedidos} onCheckedChange={(c) => handlePermissionChange('dash_maiores_pedidos', c as boolean)} />
                                          <label htmlFor="d_mai" className="text-xs cursor-pointer">Maiores Pedidos</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_nov" checked={!!permissions.dash_novos_clientes} onCheckedChange={(c) => handlePermissionChange('dash_novos_clientes', c as boolean)} />
                                          <label htmlFor="d_nov" className="text-xs cursor-pointer">Novos Clientes</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_eli" checked={!!permissions.dash_clientes_elite} onCheckedChange={(c) => handlePermissionChange('dash_clientes_elite', c as boolean)} />
                                          <label htmlFor="d_eli" className="text-xs cursor-pointer">Clientes Elite</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                          <Checkbox id="d_top" checked={!!permissions.dash_top_produtos} onCheckedChange={(c) => handlePermissionChange('dash_top_produtos', c as boolean)} />
                                          <label htmlFor="d_top" className="text-xs cursor-pointer">Top Produtos</label>
                                      </div>
                                  </div>
                              )}
                          </div>

                          {/* OUTRAS PERMISSÕES */}
                          <div className="grid grid-cols-2 gap-4 mt-2">
                              <div className="flex items-center space-x-2 border border-white/10 p-3 rounded-lg bg-white/5">
                                  <Checkbox id="perm_prod" checked={!!permissions.produtos} onCheckedChange={(c) => handlePermissionChange('produtos', c as boolean)} />
                                  <label htmlFor="perm_prod" className="text-sm font-medium leading-none cursor-pointer">Produtos & Estoque</label>
                              </div>
                              <div className="flex items-center space-x-2 border border-white/10 p-3 rounded-lg bg-white/5">
                                  <Checkbox id="perm_cli" checked={!!permissions.clientes} onCheckedChange={(c) => handlePermissionChange('clientes', c as boolean)} />
                                  <label htmlFor="perm_cli" className="text-sm font-medium leading-none cursor-pointer">Clientes</label>
                              </div>
                              <div className="flex items-center space-x-2 border border-white/10 p-3 rounded-lg bg-white/5">
                                  <Checkbox id="perm_fin" checked={!!permissions.financeiro} onCheckedChange={(c) => handlePermissionChange('financeiro', c as boolean)} />
                                  <label htmlFor="perm_fin" className="text-sm font-medium leading-none cursor-pointer">Vendas / PDV</label>
                              </div>
                              <div className="flex items-center space-x-2 border border-white/10 p-3 rounded-lg bg-white/5">
                                  <Checkbox id="perm_cad" checked={!!permissions.cadastros} onCheckedChange={(c) => handlePermissionChange('cadastros', c as boolean)} />
                                  <label htmlFor="perm_cad" className="text-sm font-medium leading-none cursor-pointer">Cadastros (Cats/Marcas)</label>
                              </div>
                              <div className="flex items-center space-x-2 border border-white/10 p-3 rounded-lg bg-white/5">
                                  <Checkbox id="perm_user" checked={!!permissions.usuarios} onCheckedChange={(c) => handlePermissionChange('usuarios', c as boolean)} />
                                  <label htmlFor="perm_user" className="text-sm font-medium leading-none cursor-pointer">Gestão de Usuários</label>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
            </div>

            <DialogFooter className="shrink-0 pt-4 mt-4 border-t border-white/10">
                <Button type="button" variant="outline" className="bg-transparent border-white/10 hover:bg-white/5" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white" disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : 'Salvar Usuário'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}