import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function FinancialSection({ globalAtacadoMin }: { globalAtacadoMin: string }) {
  const { register, control, watch } = useFormContext<any>();
  
  const { fields: atacadoGradeFields } = useFieldArray({ 
      control, 
      name: "atacado_grade" 
  });

  const tipoAtacado = watch('tipo_atacado');
  const hasGridSelected = watch('grade_id');

  return (
    <Card className="bg-black/20 border-white/10 shadow-lg">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-base flex items-center gap-2 text-white">
          <DollarSign className="h-4 w-4 text-emerald-500" /> 3. Financeiro e Atacado
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">
        {/* PREÇOS BASE */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <div className="grid gap-2">
            <Label>Custo (R$)</Label>
            <Input type="number" step="0.01" {...register('preco_custo')} className="bg-black/40 border-white/10 h-14 text-base" />
          </div>
          <div className="grid gap-2">
            <Label>Varejo (R$)</Label>
            <Input type="number" step="0.01" {...register('preco_varejo')} className="bg-black/40 border-emerald-500/30 text-emerald-400 font-bold h-14 text-base" />
          </div>
        </div>
        
        <Separator className="bg-white/10" />
        
        {/* TIPO DE ATACADO (RADIO) */}
        <div className="space-y-6">
          <div>
              <Label className="text-lg font-bold mb-4 block text-white">Regras de Atacado</Label>
              <Controller
                name="tipo_atacado"
                control={control}
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start space-x-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <RadioGroupItem value="nenhum" id="nenhum" className="mt-1" />
                      <div>
                          <Label htmlFor="nenhum" className="text-base font-bold cursor-pointer">Vender apenas Varejo</Label>
                          <p className="text-xs text-muted-foreground mt-1">Este produto não terá preço de atacado.</p>
                      </div>
                    </div>
                    <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-colors cursor-pointer ${field.value === 'geral' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      <RadioGroupItem value="geral" id="geral" className="mt-1 text-emerald-500" />
                      <div>
                          <Label htmlFor="geral" className="text-base font-bold text-emerald-400 cursor-pointer">Atacado Geral (Mesclado)</Label>
                          <p className="text-xs text-muted-foreground mt-1">Preço único se o cliente atingir a quantidade mínima no carrinho.</p>
                      </div>
                    </div>
                    <div className={`flex items-start space-x-3 p-4 rounded-xl border transition-colors cursor-pointer ${field.value === 'grade' ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      <RadioGroupItem value="grade" id="grade" className="mt-1 text-purple-500" />
                      <div>
                          <Label htmlFor="grade" className="text-base font-bold text-purple-400 cursor-pointer">Atacado Grade (Fechado)</Label>
                          <p className="text-xs text-muted-foreground mt-1">Preços específicos para cada tamanho dentro de um pacote fechado.</p>
                      </div>
                    </div>
                  </RadioGroup>
                )}
              />
          </div>

          {/* RENDERIZAÇÃO CONDICIONAL BASEADA NO RADIO */}
          <div className="animate-in fade-in slide-in-from-top-4">
              
              {tipoAtacado === 'geral' && (
                  <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 max-w-2xl space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                              <Label>Preço Atacado (R$)</Label>
                              <Input type="number" step="0.01" {...register('preco_atacado')} className="bg-black/40 border-white/10 h-12 text-lg font-bold text-emerald-400" placeholder="R$ 0,00" />
                          </div>
                          <div className="grid gap-2">
                              <Label>Qtd. Mínima no Carrinho</Label>
                              <Input type="number" {...register('quantidade_minima_atacado')} className="bg-black/40 border-white/10 h-12" placeholder={globalAtacadoMin} />
                              <p className="text-[10px] text-muted-foreground">Padrão global: {globalAtacadoMin} pçs</p>
                          </div>
                      </div>
                  </div>
              )}

              {tipoAtacado === 'grade' && (
                  <div className="p-6 rounded-xl border border-purple-500/30 bg-purple-500/5 max-w-2xl space-y-4">
                      {!hasGridSelected ? (
                          <Alert className="bg-black/40 border-white/10">
                              <AlertCircle className="h-4 w-4 text-purple-400" />
                              <AlertDescription className="text-muted-foreground">Você precisa selecionar a <b>Grade do Produto</b> (Passo 1) para definir os preços por tamanho.</AlertDescription>
                          </Alert>
                      ) : (
                          <div className="space-y-4">
                              <p className="text-sm text-purple-200">Defina o preço específico de atacado para cada tamanho desta grade:</p>
                              <div className="border border-white/10 rounded-lg overflow-hidden">
                                  <Table>
                                      <TableHeader className="bg-black/40">
                                          <TableRow className="border-white/10 hover:bg-transparent">
                                              <TableHead className="text-purple-300 font-bold w-[120px]">Tamanho</TableHead>
                                              <TableHead className="text-purple-300 font-bold">Preço de Atacado (R$)</TableHead>
                                          </TableRow>
                                      </TableHeader>
                                      <TableBody className="bg-black/20">
                                          {atacadoGradeFields.map((field: any, idx) => (
                                              <TableRow key={field.id} className="border-white/5 hover:bg-white/5">
                                                  <TableCell className="font-bold text-lg">
                                                      {field.tamanho}
                                                      <input type="hidden" {...register(`atacado_grade.${idx}.tamanho`)} />
                                                  </TableCell>
                                                  <TableCell>
                                                      <Input 
                                                          type="number" 
                                                          step="0.01" 
                                                          {...register(`atacado_grade.${idx}.preco_atacado`)} 
                                                          className="bg-black/40 border-white/10 h-12 text-lg font-mono text-purple-400 max-w-[200px]" 
                                                          placeholder="0.00" 
                                                      />
                                                  </TableCell>
                                              </TableRow>
                                          ))}
                                      </TableBody>
                                  </Table>
                              </div>
                          </div>
                      )}
                  </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}