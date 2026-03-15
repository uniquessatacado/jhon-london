import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Customer } from '@/types';
import { toast } from 'sonner';

// --- Fetch Customers ---
async function fetchCustomers(searchTerm: string): Promise<Customer[]> {
  let query = supabase.from('clientes').select('*').order('nome');

  if (searchTerm) {
    query = query.or(`nome.ilike.%${searchTerm}%,whatsapp.ilike.%${searchTerm}%,cpf_cnpj.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar clientes no Supabase:', error);
    throw new Error(error.message);
  }

  return data as Customer[];
}

export function useCustomers(searchTerm: string) {
  return useQuery({
    queryKey: ['customers', searchTerm],
    queryFn: () => fetchCustomers(searchTerm),
    placeholderData: (previousData) => previousData,
  });
}

// --- Mutations ---
type CustomerDTO = Omit<Customer, 'id' | 'created_at' | 'criado_em' | 'atualizado_em'>;

async function createCustomer(newCustomer: CustomerDTO): Promise<Customer> {
  const { data, error } = await supabase
    .from('clientes')
    .insert([newCustomer])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Customer;
}

async function updateCustomer({ id, ...customerData }: Partial<Customer>): Promise<Customer> {
  // Remove campos de controle que não devem ser atualizados
  const { created_at, criado_em, atualizado_em, ...cleanData } = customerData as any;

  const { data, error } = await supabase
    .from('clientes')
    .update(cleanData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Customer;
}

async function deleteCustomer(id: number): Promise<void> {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      toast.success('Cliente criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      toast.error('Falha ao criar cliente', {
        description: error.message || 'Verifique os dados e tente novamente.',
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => {
      toast.success('Cliente atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      toast.error('Falha ao atualizar cliente', {
        description: error.message || 'Verifique os dados e tente novamente.',
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      toast.success('Cliente excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      toast.error('Falha ao excluir cliente', { description: error.message });
    },
  });
}
