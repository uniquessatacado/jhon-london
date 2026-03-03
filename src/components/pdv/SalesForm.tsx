"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Building, User, Truck, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Address {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export function SalesForm() {
  const { register, control, watch, setValue, getValues } = useForm({
    defaultValues: {
      cep: '',
      customerType: 'PF',
      isRetirada: false,
      cfop: '5102'
    }
  });

  const [address, setAddress] = useState<Address | null>(null);
  const [isCepLoading, setIsCepLoading] = useState(false);

  const cep = watch('cep');
  const customerType = watch('customerType');
  const isRetirada = watch('isRetirada');

  const isSP = address?.uf === 'SP';

  const fetchAddress = useCallback(async (cepValue: string) => {
    if (cepValue.length !== 8) {
      setAddress(null);
      return;
    }
    setIsCepLoading(true);
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cepValue}/json/`);
      if (data.erro) {
        toast.error('CEP não encontrado.');
        setAddress(null);
      } else {
        setAddress({
          logradouro: data.logradouro,
          bairro: data.bairro,
          localidade: data.localidade,
          uf: data.uf,
        });
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP.');
      setAddress(null);
    } finally {
      setIsCepLoading(false);
    }
  }, []);

  useEffect(() => {
    const cepValue = cep.replace(/\D/g, '');
    const timeoutId = setTimeout(() => {
      fetchAddress(cepValue);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [cep, fetchAddress]);

  useEffect(() => {
    if (!address) {
      setValue('cfop', '5102'); // Default
      return;
    }

    if (isSP) {
      setValue('cfop', '5102');
      setValue('isRetirada', false); // Reseta retirada se for SP
    } else {
      // Fora de SP
      if (customerType === 'PJ') {
        setValue('cfop', '6108');
      } else { // PF
        setValue('cfop', isRetirada ? '5102' : '6108');
      }
    }
  }, [address, customerType, isRetirada, isSP, setValue]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Cliente e Endereço */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-emerald-500" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Cliente</Label>
                <Controller
                  name="customerType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PF"><div className="flex items-center gap-2"><User className="h-4 w-4" /> Pessoa Física</div></SelectItem>
                        <SelectItem value="PJ"><div className="flex items-center gap-2"><Building className="h-4 w-4" /> Pessoa Jurídica</div></SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-emerald-500" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" placeholder="00000-000" {...register('cep')} className="h-12" />
                {isCepLoading && <Loader2 className="absolute right-3 top-8 h-5 w-5 animate-spin text-muted-foreground" />}
              </div>
              {address && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-white/5 border border-white/10 animate-in fade-in">
                  <div className="md:col-span-2">
                    <Label className="text-xs">Logradouro</Label>
                    <p>{address.logradouro || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Bairro</Label>
                    <p>{address.bairro || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Cidade</Label>
                    <p>{address.localidade || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Estado</Label>
                    <p className="font-bold text-emerald-400">{address.uf || 'N/A'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Fiscal */}
        <div className="space-y-6">
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-emerald-500" />
                Configuração Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isSP && address && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-white/5 border border-white/10 animate-in fade-in">
                  <Controller
                    name="isRetirada"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="retirada"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="retirada" className="cursor-pointer flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Cliente vai retirar na loja
                  </Label>
                </div>
              )}
              <div className="space-y-2">
                <Label>CFOP (Automático)</Label>
                <Input {...register('cfop')} className="h-12 font-mono font-bold text-lg text-emerald-400 bg-black/40 border-emerald-500/30" />
              </div>
            </CardContent>
          </Card>
          
          {getValues('cfop') === '6108' && (
            <Alert variant="default" className="bg-amber-500/10 border-amber-500/20 text-amber-200">
              <AlertTriangle className="h-4 w-4 !text-amber-400" />
              <AlertTitle>Atenção: Venda Interestadual</AlertTitle>
              <AlertDescription>
                O CFOP 6108 foi selecionado. Verifique com sua contabilidade a necessidade de cálculo e recolhimento do DIFAL, especialmente para clientes PJ.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}