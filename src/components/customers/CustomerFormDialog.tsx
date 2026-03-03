import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import InputMask from 'react-input-mask';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, User, MapPin, Settings2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Customer } from '@/types';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/use-customers';
import { validateCPF, validateCNPJ } from '@/lib/validators';

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

const formSchema = z.object({
  nome: z.string().min(3, 'Nome é obrigatório'),
  tipo_pessoa: z.enum(['F', 'J']),
  cpf_cnpj: z.string().refine((doc) => {
    const cleanDoc = doc.replace(/\D/g, '');
    if (cleanDoc.length === 11) return validateCPF(cleanDoc);
    if (cleanDoc.length === 14) return validateCNPJ(cleanDoc);
    return false;
  }, 'CPF/CNPJ inválido'),
  whatsapp: z.string().min(14, 'WhatsApp é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  rg_ie: z.string().optional(),
  data_nascimento: z.date().optional().nullable(),
  cep: z.string().min(9, 'CEP é obrigatório'),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(2, 'Estado é obrigatório'),
  tipo_cliente: z.enum(['varejo', 'atacado', 'ambos']),
  observacoes: z.string().optional(),
  ativo: z.boolean(),
});

export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();

  const [isCepLoading, setIsCepLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      tipo_pessoa: 'F',
      cpf_cnpj: '',
      whatsapp: '',
      email: '',
      rg_ie: '',
      data_nascimento: null,
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      tipo_cliente: 'varejo',
      observacoes: '',
      ativo: true,
    },
  });

  const tipoPessoa = form.watch('tipo_pessoa');

  useEffect(() => {
    if (customer) {
      form.reset({
        ...customer,
        data_nascimento: customer.data_nascimento ? new Date(customer.data_nascimento) : null,
      });
    } else {
      form.reset();
    }
  }, [customer, open, form]);

  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsCepLoading(true);
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!data.erro) {
        form.setValue('logradouro', data.logradouro, { shouldValidate: true });
        form.setValue('bairro', data.bairro, { shouldValidate: true });
        form.setValue('cidade', data.localidade, { shouldValidate: true });
        form.setValue('estado', data.uf, { shouldValidate: true });
        document.getElementById('numero')?.focus();
      } else {
        toast.error('CEP não encontrado.');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP.');
    } finally {
      setIsCepLoading(false);
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const payload = {
      ...data,
      data_nascimento: data.data_nascimento ? format(data.data_nascimento, 'yyyy-MM-dd') : null,
    };

    if (customer) {
      updateCustomer({ id: customer.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createCustomer(payload as any, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{customer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>Preencha os dados para gerenciar o cliente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden">
          <Tabs defaultValue="personal" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal"><User className="mr-2 h-4 w-4" /> Dados Pessoais</TabsTrigger>
              <TabsTrigger value="address"><MapPin className="mr-2 h-4 w-4" /> Endereço</TabsTrigger>
              <TabsTrigger value="other"><Settings2 className="mr-2 h-4 w-4" /> Outros</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <TabsContent value="personal" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input id="nome" {...form.register('nome')} />
                  {form.formState.errors.nome && <p className="text-red-500 text-xs">{form.formState.errors.nome.message}</p>}
                </div>
                <Controller
                  control={form.control}
                  name="tipo_pessoa"
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                      <div className="flex items-center space-x-2"><RadioGroupItem value="F" id="pf" /><Label htmlFor="pf">Pessoa Física</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="J" id="pj" /><Label htmlFor="pj">Pessoa Jurídica</Label></div>
                    </RadioGroup>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cpf_cnpj">{tipoPessoa === 'F' ? 'CPF *' : 'CNPJ *'}</Label>
                    <Controller
                      name="cpf_cnpj"
                      control={form.control}
                      render={({ field }) => (
                        <InputMask
                          mask={tipoPessoa === 'F' ? '999.999.999-99' : '99.999.999/9999-99'}
                          value={field.value}
                          onChange={field.onChange}
                        >
                          {(inputProps: any) => <Input {...inputProps} id="cpf_cnpj" />}
                        </InputMask>
                      )}
                    />
                    {form.formState.errors.cpf_cnpj && <p className="text-red-500 text-xs">{form.formState.errors.cpf_cnpj.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="rg_ie">{tipoPessoa === 'F' ? 'RG' : 'Inscrição Estadual'}</Label>
                    <Input id="rg_ie" {...form.register('rg_ie')} />
                  </div>
                </div>
                {tipoPessoa === 'F' && (
                  <div className="grid gap-2">
                    <Label>Data de Nascimento</Label>
                    <Controller
                      name="data_nascimento"
                      control={form.control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <Controller
                      name="whatsapp"
                      control={form.control}
                      render={({ field }) => (
                        <InputMask mask="(99) 99999-9999" value={field.value} onChange={field.onChange}>
                          {(inputProps: any) => <Input {...inputProps} id="whatsapp" />}
                        </InputMask>
                      )}
                    />
                    {form.formState.errors.whatsapp && <p className="text-red-500 text-xs">{form.formState.errors.whatsapp.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...form.register('email')} />
                    {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="address" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2 md:col-span-1">
                    <Label htmlFor="cep">CEP *</Label>
                    <div className="relative">
                      <Controller
                        name="cep"
                        control={form.control}
                        render={({ field }) => (
                          <InputMask mask="99999-999" value={field.value} onChange={field.onChange} onBlur={(e) => handleCepBlur(e.target.value)}>
                            {(inputProps: any) => <Input {...inputProps} id="cep" />}
                          </InputMask>
                        )}
                      />
                      {isCepLoading && <Loader2 className="absolute right-2 top-2 h-5 w-5 animate-spin text-muted-foreground" />}
                    </div>
                    {form.formState.errors.cep && <p className="text-red-500 text-xs">{form.formState.errors.cep.message}</p>}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logradouro">Logradouro *</Label>
                  <Input id="logradouro" {...form.register('logradouro')} />
                  {form.formState.errors.logradouro && <p className="text-red-500 text-xs">{form.formState.errors.logradouro.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="numero">Número *</Label>
                    <Input id="numero" {...form.register('numero')} />
                    {form.formState.errors.numero && <p className="text-red-500 text-xs">{form.formState.errors.numero.message}</p>}
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input id="complemento" {...form.register('complemento')} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input id="bairro" {...form.register('bairro')} />
                    {form.formState.errors.bairro && <p className="text-red-500 text-xs">{form.formState.errors.bairro.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input id="cidade" {...form.register('cidade')} />
                    {form.formState.errors.cidade && <p className="text-red-500 text-xs">{form.formState.errors.cidade.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Input id="estado" {...form.register('estado')} />
                    {form.formState.errors.estado && <p className="text-red-500 text-xs">{form.formState.errors.estado.message}</p>}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="other" className="space-y-4">
                <div className="grid gap-2">
                  <Label>Tipo de Cliente</Label>
                  <Controller
                    name="tipo_cliente"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="varejo">Varejo</SelectItem>
                          <SelectItem value="atacado">Atacado</SelectItem>
                          <SelectItem value="ambos">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" {...form.register('observacoes')} />
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="ativo"
                    control={form.control}
                    render={({ field }) => <Switch id="ativo" checked={field.value} onCheckedChange={field.onChange} />}
                  />
                  <Label htmlFor="ativo">Cliente Ativo</Label>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}