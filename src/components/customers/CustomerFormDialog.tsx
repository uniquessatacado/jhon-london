import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { IMaskInput } from 'react-imask';
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
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 letras'),
  tipo_pessoa: z.enum(['F', 'J']),
  cpf_cnpj: z.string().optional().or(z.literal('')),
  whatsapp: z.string().min(14, 'WhatsApp é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  rg_ie: z.string().optional().or(z.literal('')),
  data_nascimento: z.string().optional().or(z.literal('')),
  cep: z.string().optional().or(z.literal('')),
  logradouro: z.string().optional().or(z.literal('')),
  numero: z.string().optional().or(z.literal('')),
  complemento: z.string().optional().or(z.literal('')),
  bairro: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().optional().or(z.literal('')),
  tipo_cliente: z.enum(['varejo', 'atacado', 'ambos']),
  observacoes: z.string().optional().or(z.literal('')),
  ativo: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.tipo_pessoa === 'J') {
    if (!data.cpf_cnpj || !validateCNPJ(data.cpf_cnpj.replace(/\D/g, ''))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CNPJ inválido ou vazio.",
        path: ["cpf_cnpj"],
      });
    }
  } else { // tipo_pessoa === 'F'
    if (data.cpf_cnpj && data.cpf_cnpj.replace(/\D/g, '').length > 0 && !validateCPF(data.cpf_cnpj.replace(/\D/g, ''))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF inválido.",
        path: ["cpf_cnpj"],
      });
    }
  }
});

// Converte YYYY-MM-DD para DD/MM/YYYY
const parseDateFromBackend = (dateString?: string | null) => {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('T')[0].split('-');
    if (year && month && day) return `${day}/${month}/${year}`;
    return '';
  } catch (e) {
    return '';
  }
};

// Converte DD/MM/YYYY para YYYY-MM-DD
const formatDateForBackend = (dateString?: string) => {
  if (!dateString || dateString.length !== 10) return null;
  try {
    const [day, month, year] = dateString.split('/');
    if (year && month && day) return `${year}-${month}-${day}`;
    return null;
  } catch (e) {
    return null;
  }
};

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
      data_nascimento: '',
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
      // Forçamos a conversão de 1/0 para true/false
      const isAtivo = customer.ativo !== undefined ? Boolean(Number(customer.ativo)) : true;

      form.reset({
        nome: customer.nome || '',
        tipo_pessoa: customer.tipo_pessoa || 'F',
        cpf_cnpj: customer.cpf_cnpj || '',
        whatsapp: customer.whatsapp || '',
        email: customer.email || '',
        rg_ie: customer.rg_ie || '',
        data_nascimento: parseDateFromBackend(customer.data_nascimento),
        cep: customer.cep || '',
        logradouro: customer.logradouro || '',
        numero: customer.numero || '',
        complemento: customer.complemento || '',
        bairro: customer.bairro || '',
        cidade: customer.cidade || '',
        estado: customer.estado || '',
        tipo_cliente: customer.tipo_cliente || 'varejo',
        observacoes: customer.observacoes || '',
        ativo: isAtivo,
      });
    } else {
      form.reset({
        nome: '',
        tipo_pessoa: 'F',
        cpf_cnpj: '',
        whatsapp: '',
        email: '',
        rg_ie: '',
        data_nascimento: '',
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
      });
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
      data_nascimento: formatDateForBackend(data.data_nascimento),
    };

    if (customer) {
      updateCustomer({ id: customer.id, ...payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createCustomer(payload as any, { onSuccess: () => onOpenChange(false) });
    }
  };

  const onInvalid = (errors: any) => {
    console.error('Erros de validação:', errors);
    const errorMessages = Object.keys(errors)
      .map(key => errors[key].message)
      .filter(Boolean)
      .join(' | ');

    toast.error('Não foi possível salvar', {
      description: errorMessages || 'Verifique se todos os campos obrigatórios estão preenchidos.',
    });
  };

  const inputClasses = "bg-black/40 border-white/10 focus-visible:ring-emerald-500/50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col bg-zinc-950 border-white/10 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>{customer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>Preencha os dados para gerenciar o cliente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="flex flex-col flex-1 overflow-hidden">
          <Tabs defaultValue="personal" className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
                <TabsTrigger value="personal" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400"><User className="mr-2 h-4 w-4" /> Pessoais</TabsTrigger>
                <TabsTrigger value="address" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400"><MapPin className="mr-2 h-4 w-4" /> Endereço</TabsTrigger>
                <TabsTrigger value="other" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400"><Settings2 className="mr-2 h-4 w-4" /> Outros</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              <TabsContent value="personal" className="m-0 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input id="nome" className={inputClasses} {...form.register('nome')} />
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
                    <Label htmlFor="cpf_cnpj">{tipoPessoa === 'F' ? 'CPF' : 'CNPJ *'}</Label>
                    <Controller
                      name="cpf_cnpj"
                      control={form.control}
                      render={({ field }) => (
                        <IMaskInput
                          mask={tipoPessoa === 'F' ? '000.000.000-00' : '00.000.000/0000-00'}
                          value={field.value || ''}
                          onAccept={(value) => field.onChange(value)}
                          as={Input as any}
                          id="cpf_cnpj"
                          className={inputClasses}
                        />
                      )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="rg_ie">{tipoPessoa === 'F' ? 'RG' : 'Inscrição Estadual'}</Label>
                    <Input id="rg_ie" className={inputClasses} {...form.register('rg_ie')} />
                  </div>
                </div>
                {tipoPessoa === 'F' && (
                  <div className="grid gap-2">
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Controller
                      name="data_nascimento"
                      control={form.control}
                      render={({ field }) => (
                        <IMaskInput
                          mask="00/00/0000"
                          value={field.value || ''}
                          onAccept={(value) => field.onChange(value)}
                          as={Input as any}
                          id="data_nascimento"
                          placeholder="DD/MM/AAAA"
                          className={inputClasses}
                        />
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
                        <IMaskInput
                          mask="(00) 00000-0000"
                          value={field.value || ''}
                          onAccept={(value) => field.onChange(value)}
                          as={Input as any}
                          id="whatsapp"
                          className={inputClasses}
                        />
                      )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" className={inputClasses} {...form.register('email')} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="address" className="m-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2 md:col-span-1">
                    <Label htmlFor="cep">CEP</Label>
                    <div className="relative">
                      <Controller
                        name="cep"
                        control={form.control}
                        render={({ field }) => (
                          <IMaskInput
                            mask="00000-000"
                            value={field.value || ''}
                            onAccept={(value) => field.onChange(value)}
                            onBlur={(e) => handleCepBlur(e.currentTarget.value)}
                            as={Input as any}
                            id="cep"
                            className={inputClasses}
                          />
                        )}
                      />
                      {isCepLoading && <Loader2 className="absolute right-2 top-2 h-5 w-5 animate-spin text-muted-foreground" />}
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input id="logradouro" className={inputClasses} {...form.register('logradouro')} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input id="numero" className={inputClasses} {...form.register('numero')} />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input id="complemento" className={inputClasses} {...form.register('complemento')} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" className={inputClasses} {...form.register('bairro')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" className={inputClasses} {...form.register('cidade')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input id="estado" className={inputClasses} {...form.register('estado')} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="other" className="m-0 space-y-4">
                <div className="grid gap-2">
                  <Label>Tipo de Cliente</Label>
                  <Controller
                    name="tipo_cliente"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={inputClasses}><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10">
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
                  <Textarea id="observacoes" className={`resize-none h-24 ${inputClasses}`} {...form.register('observacoes')} />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Controller
                    name="ativo"
                    control={form.control}
                    render={({ field }) => <Switch id="ativo" checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-500" />}
                  />
                  <Label htmlFor="ativo" className="font-medium cursor-pointer">Cliente Ativo no Sistema</Label>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="px-6 py-4 border-t border-white/10 bg-black/20 shrink-0">
            <Button type="button" variant="outline" className="bg-transparent border-white/10 hover:bg-white/5" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isCreating || isUpdating} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {isCreating || isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}