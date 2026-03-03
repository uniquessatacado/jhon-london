import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Customer } from '@/types';
import { toast } from 'sonner';

// --- Fetch Customers ---
async function fetchCustomers(searchTerm: string): Promise<Customer[]> {
  const { data } = await api.get('/clientes', {
    params: { busca: searchTerm }
  });
  return data;
}

export function useCustomers(searchTerm: string) {
  return useQuery({
    queryKey: ['customers', searchTerm],
    queryFn: () => fetchCustomers(searchTerm),
    placeholderData: (previousData) => previousData,
  });
}

// --- Mutations ---
type CustomerDTO = Omit<Customer, 'id' | 'criado_em' | 'atualizado_em'>;

async function createCustomer(newCustomer: CustomerDTO): Promise<Customer> {
  const { data } = await api.post('/clientes', newCustomer);
  return data;
}

async function updateCustomer({ id, ...customerData }: Partial<Customer>): Promise<Customer> {
  const { data } = await api.put(`/clientes/${id}`, customerData);
  return data;
}

async function deleteCustomer(id: number): Promise<void> {
  await api.delete(`/clientes/${id}`);
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
        description: error.response?.data?.message || 'Verifique os dados e tente novamente.',
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
        description: error.response?.data?.message || 'Verifique os dados e tente novamente.',
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
    onError: () => {
      toast.error('Falha ao excluir cliente.');
    },
  });
}