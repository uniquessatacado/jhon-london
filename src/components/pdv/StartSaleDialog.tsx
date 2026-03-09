import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, UserPlus, Building, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useCustomers } from '@/hooks/use-customers';
import { Customer } from '@/types';
import { CustomerFormDialog } from '@/components/customers/CustomerFormDialog';
import { usePdv, SaleType } from '@/contexts/PdvContext';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';

interface StartSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartSaleDialog({ open, onOpenChange }: StartSaleDialogProps) {
  const { startSale } = usePdv();
  const [step, setStep] = useState(1); // 1: Cliente, 2: Tipo de Venda
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { data: customers, isLoading } = useCustomers(debouncedSearchTerm);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStep(2);
  };

  const handleSelectSaleType = (saleType: SaleType) => {
    if (selectedCustomer) {
      startSale(selectedCustomer, saleType);
      onOpenChange(false);
      reset();
    }
  };

  const reset = () => {
    setStep(1);
    setSearchTerm('');
    setSelectedCustomer(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl p-0">
          {step === 1 && (
            <div>
              <DialogHeader className="p-6">
                <DialogTitle className="text-2xl">Iniciar Nova Venda</DialogTitle>
                <DialogDescription>Selecione um cliente ou cadastre um novo para começar.</DialogDescription>
              </DialogHeader>
              <div className="px-6 pb-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, CPF/CNPJ ou WhatsApp..."
                    className="pl-9 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-64 border rounded-md">
                  {isLoading && <div className="p-4 text-center text-muted-foreground">Buscando...</div>}
                  {!isLoading && customers?.map(customer => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full text-left p-4 hover:bg-white/5 flex items-center justify-between border-b last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{customer.nome}</p>
                        <p className="text-sm text-muted-foreground">{customer.cpf_cnpj || customer.whatsapp}</p>
                      </div>
                      <Badge variant={customer.tipo_cliente === 'atacado' ? 'default' : 'secondary'}>
                        {customer.tipo_cliente}
                      </Badge>
                    </button>
                  ))}
                </ScrollArea>
                <Button onClick={() => setIsNewCustomerOpen(true)} variant="outline" className="w-full h-12">
                  <UserPlus className="mr-2 h-4 w-4" /> Cadastrar Novo Cliente
                </Button>
              </div>
            </div>
          )}

          {step === 2 && selectedCustomer && (
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">Tipo de Venda</DialogTitle>
                <DialogDescription>
                  Selecione o tipo de preço para o cliente: <span className="font-bold text-emerald-400">{selectedCustomer.nome}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Button onClick={() => handleSelectSaleType('varejo')} className="h-24 flex-col gap-2 text-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20">
                  <UserIcon /> Varejo
                </Button>
                <Button onClick={() => handleSelectSaleType('atacado_geral')} className="h-24 flex-col gap-2 text-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20">
                  <ShoppingBag /> Atacado Geral
                </Button>
                <Button onClick={() => handleSelectSaleType('atacado_grade')} className="h-24 flex-col gap-2 text-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20">
                  <Building /> Atacado Grade
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CustomerFormDialog
        open={isNewCustomerOpen}
        onOpenChange={setIsNewCustomerOpen}
        context="pdv"
      />
    </>
  );
}