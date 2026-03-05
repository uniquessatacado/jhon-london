import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, MoreHorizontal, Pencil, Trash2, UserX, UserCheck } from 'lucide-react';
import { useCustomers, useUpdateCustomer, useDeleteCustomer } from '@/hooks/use-customers';
import { Customer } from '@/types';
import { CustomerFormDialog } from '@/components/customers/CustomerFormDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function CustomerListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: customers, isLoading } = useCustomers(searchTerm);
  const { mutate: updateCustomer } = useUpdateCustomer();
  const { mutate: deleteCustomer } = useDeleteCustomer();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const handleNew = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleToggleActive = (customer: Customer) => {
    updateCustomer({ id: customer.id, ativo: !customer.ativo });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes.</p>
        </div>
        <Button onClick={handleNew} className="bg-emerald-500 hover:bg-emerald-600 text-white w-full md:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF/CNPJ ou WhatsApp..."
              className="pl-9 bg-black/40 border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>Nome</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : customers?.map((customer) => (
              <TableRow key={customer.id} className="border-white/5 hover:bg-white/5">
                <TableCell className="font-medium">{customer.nome || '-'}</TableCell>
                <TableCell>{customer.cpf_cnpj || '-'}</TableCell>
                <TableCell>{customer.whatsapp || '-'}</TableCell>
                <TableCell>{customer.cidade || '-'}/{customer.estado || '-'}</TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{customer.tipo_cliente}</Badge></TableCell>
                <TableCell>
                  <Badge variant={customer.ativo ? 'default' : 'destructive'} className={customer.ativo ? 'bg-emerald-500/20 text-emerald-300' : ''}>
                    {customer.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(customer)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(customer)}>
                        {customer.ativo ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                        {customer.ativo ? 'Desativar' : 'Ativar'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCustomerToDelete(customer)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
      </div>

      <CustomerFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={selectedCustomer}
      />

      <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação marcará o cliente "{customerToDelete?.nome}" como excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => customerToDelete && deleteCustomer(customerToDelete.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}