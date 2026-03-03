"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, ShoppingBag, Truck, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Address {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

const cfopDescriptions: { [key: string]: string } = {
  '5102': 'Venda de mercadoria (Operação Estadual / Retirada)',
  '6108': 'Venda de mercadoria (Operação Interestadual)',
};

export function SalesForm() {
  const { register, control, watch, setValue, getValues } = useForm({
    defaultValues: {
      deliveryType: 'retirada',
      cep: '',
      cfop: '5102',
    }
  });

  const [address, setAddress] = useState<Address | null>(null);
  const [isCepLoading, setIsCepLoading] = useState(false);

  const deliveryType = watch('deliveryType');
  const cep = watch('cep');
  const cfop = watch('cfop');

  const fetchAddress = useCallback(async (cepValue: string) => {
    if (cepValue.length !== 8) {
      setAddress(null);
      setValue('cfop', '5102'); // Default if CEP is invalid
      return;
    }
    setIsCepLoading(true);
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cepValue}/json/`);
      if (data.erro) {
        toast.error('CEP não encontrado.');
        setAddress(null);
        setValue('cfop', '5102'); // Default on error
      } else {
        setAddress({
          logradouro: data.logradouro,
          bairro: data.bairro,
          localidade: data.localidade,
          uf: data.uf,
        });
        // Lógica do CFOP baseada no estado
        if (data.uf === 'SP') {
          setValue('cfop', '5102');
        } else {
          setValue('cfop', '6108');
        }
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP.');
      setAddress(null);
      setValue('cfop', '5102');
    } finally {
      setIsCepLoading(false);
    }
  }, [setValue]);

  // Efeito para lidar com a mudança do TIPO DE ENTREGA
  useEffect(() => {
    if (deliveryType === 'retirada') {
      setValue('cfop', '5102');
      setAddress(null); // Limpa o endereço, pois não é relevante para o CFOP
    } else {
      // Se mudar para 'entrega', re-avalia o CEP que já está no campo
      const currentCep = getValues('cep').replace(/\D/g, '');
      if (currentCep.length === 8) {
        fetchAddress(currentCep);
      } else {
        setValue('cfop', '5102'); // Default se não houver CEP válido
      }
    }
  }, [deliveryType, setValue, getValues, fetchAddress]);

  // Efeito para buscar o CEP quando ele é digitado (apenas no modo 'entrega')
  useEffect(() => {
    if (deliveryType === 'entrega') {
      const cepValue = cep.replace(/\D/g, '');
      const timeoutId = setTimeout(() => {
        fetchAddress(cepValue);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [cep, deliveryType, fetchAddress]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingBag className="h-5 w-5 text-emerald-500" />
                Tipo de Venda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="deliveryType"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <Label htmlFor="retirada" className={`flex flex-col items-start gap-2 rounded-xl border p-4 cursor-pointer transition-all ${field.value === 'retirada' ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 hover:bg-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="retirada" id="retirada" />
                        <div className="font-bold text-base">Retirada na loja</div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">Venda presencial ou o cliente busca o produto.</p>
                    </Label>
                    <Label htmlFor="entrega" className={`flex flex-col items-start gap-2 rounded-xl border p-4 cursor-pointer transition-all ${field.value === 'entrega' ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/10 hover:bg-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="entrega" id="entrega" />
                        <div className="font-bold text-base">Entrega / Envio</div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">O produto será enviado para o endereço do cliente.</p>
                    </Label>
                  </RadioGroup>
                )}
              />
            </CardContent>
          </Card>

          <Card className={`bg-black/20 border-white/10 transition-opacity duration-500 ${deliveryType === 'retirada' ? 'opacity-60' : 'opacity-100'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-emerald-500" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Label htmlFor="cep">
                  CEP {deliveryType === 'entrega' && <span className="text-red-400">*</span>}
                </Label>
                <Input
                  id="cep"
                  placeholder="00000-000"
                  {...register('cep')}
                  className="h-12"
                  disabled={deliveryType === 'retirada'}
                />
                {isCepLoading && <Loader2 className="absolute right-3 top-8 h-5 w-5 animate-spin text-muted-foreground" />}
              </div>
              {address && deliveryType === 'entrega' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-white/5 border border-white/10 animate-in fade-in">
                  <div>
                    <Label className="text-xs">Endereço</Label>
                    <p>{address.logradouro || 'N/A'}, {address.bairro || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Cidade / Estado</Label>
                    <p>{address.localidade || 'N/A'} - <span className="font-bold text-emerald-400">{address.uf || 'N/A'}</span></p>
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
            <CardContent className="space-y-2">
              <Label>CFOP (Automático)</Label>
              <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/30">
                <p className="font-mono font-bold text-2xl text-emerald-400">{cfop}</p>
                <p className="text-xs text-muted-foreground">{cfopDescriptions[cfop] || 'Não definido'}</p>
              </div>
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                Definido automaticamente pelo tipo de entrega e localização.
              </p>
            </CardContent>
          </Card>
          
          {cfop === '6108' && (
            <Alert variant="default" className="bg-amber-500/10 border-amber-500/20 text-amber-200">
              <AlertTriangle className="h-4 w-4 !text-amber-400" />
              <AlertTitle>Atenção: Venda Interestadual</AlertTitle>
              <AlertDescription>
                O CFOP 6108 foi selecionado. Verifique a necessidade de cálculo do DIFAL com sua contabilidade.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}