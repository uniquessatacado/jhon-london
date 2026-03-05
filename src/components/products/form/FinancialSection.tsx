import { useMemo, useEffect, useRef } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { DollarSign } from 'lucide-react';
import { Grid } from '@/types';

interface FinancialSectionProps {
  grids?: Grid[];
  globalAtacadoMin: string;
  isEditMode: boolean;
  isDuplicateMode: boolean;
}

export function FinancialSection({ grids, globalAtacadoMin, isEditMode, isDuplicateMode }: FinancialSectionProps) {
  const { register, control, watch, setValue } = useFormContext<any>();
  const { fields: composicaoFields, replace } = useFieldArray({ control, name: "composicao_atacado" });

  const habilitaAtacadoGeral = watch('habilita_atacado_geral');
  const habilitaAtacadoGrade = watch('habilita_atacado_grade');
  const selectedGradeAtacadoId = watch('grade_atacado_id');
  const precoAtacadoGrade = watch('preco_atacado_grade') || 0;
  const composicaoAtacadoValues = watch('composicao_atacado') || [];

  const gradeAtacadoObj = useMemo(() => grids?.find(g => String(g.id) === String(selectedGradeAtacadoId)), [grids, selectedGradeAtacadoId]);
  const initialGradeAtacadoIdRef = useRef<string | null>(null);

  useEffect(() => {
    if ((isEditMode || isDuplicateMode) && selectedGradeAtacadoId && !initialGradeAtacadoIdRef.current) {
        initialGradeAtacadoIdRef.current = String(selectedGradeAtacadoId);
    }
  }, [selectedGradeAtacadoId, isEditMode, isDuplicateMode]);

  useEffect(() => {
    if (!gradeAtacadoObj) return;

    const currentSizes = composicaoFields.map((v:any) => v.tamanho);
    const newSizes = gradeAtacadoObj.tamanhos.map(t => t.tamanho);

    if ((isEditMode || isDuplicateMode) && String(gradeAtacadoObj.id) === initialGradeAtacadoIdRef.current) {
        if (currentSizes.length === 0) {
            replace(gradeAtacadoObj.tamanhos.map(t => ({ tamanho: t.tamanho, quantidade: 0 })));
        }
        return; 
    }
    
    if (JSON.stringify(currentSizes) !== JSON.stringify(newSizes)) {
        replace(gradeAtacadoObj.tamanhos.map(t => ({ tamanho: t.tamanho, quantidade: 1 })));
    }
  }, [gradeAtacadoObj, isEditMode, isDuplicateMode, replace, composicaoFields]);

  const totalPecasPacote = composicaoAtacadoValues?.reduce((acc: number, curr: any) => acc + (Number(curr?.quantidade) || 0), 0) || 0;
  const valorTotalPacote = Number(precoAtacadoGrade) * totalPecasPacote;

  return (
    <Card className="bg-black/20 border-white/10 shadow-lg">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-base flex items-center gap-2 text-white">
          <DollarSign className="h-4 w-4 text-emerald-500" /> 3. Financeiro e Atacado
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          <div className="grid gap-2">
            <Label>Custo Obrigatório (R$)</Label>
            <Input type="number" step="0.01" {...register('preco_custo', { required: true })} className="bg-black/40 border-white/10 h-14 text-base" />
          </div>
          <div className="grid gap-2">
            <Label>Varejo Obrigatório (R$)</Label>
            <Input type="number" step="0.01" {...register('preco_varejo', { required: true })} className="bg-black/40 border-emerald-500/30 text-emerald-400 font-bold h-14 text-base" />
          </div>
        </div>
        
        <Separator className="bg-white/10" />
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-5 rounded-xl border transition-all ${habilitaAtacadoGeral ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Label className="text-lg font-bold text-emerald-400">Atacado Geral (Mesclado)</Label>
                  <p className="text-xs text-muted-foreground mt-1">Vendas avulsas / misturadas</p>
                </div>
                <Switch checked={habilitaAtacadoGeral} onCheckedChange={(c) => setValue('habilita_atacado_geral', c)} />
              </div>
              {habilitaAtacadoGeral && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="grid gap-2">
                    <Label>Preço Unitário Exclusivo (Geral)</Label>
                    <Input type="number" step="0.01" {...register('preco_atacado_geral')} className="bg-black/40 border-white/10 h-12 text-lg font-bold text-emerald-400" placeholder="R$ 0,00" />
                  </div>
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                    <p className="text-xs text-muted-foreground"><span className="font-semibold text-white">Qtd Mínima:</span> {globalAtacadoMin} pçs</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Definida nas configurações globais do sistema.</p>
                  </div>
                </div>
              )}
            </div>

            <div className={`p-5 rounded-xl border transition-all ${habilitaAtacadoGrade ? 'bg-purple-500/5 border-purple-500/30' : 'bg-white/5 border-white/10'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Label className="text-lg font-bold text-purple-400">Atacado Grade (Fechado)</Label>
                  <p className="text-xs text-muted-foreground mt-1">Kit fechado com grade definida</p>
                </div>
                <Switch checked={habilitaAtacadoGrade} onCheckedChange={(c) => setValue('habilita_atacado_grade', c)} />
              </div>
              {habilitaAtacadoGrade && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  
                  <div className="grid gap-2">
                    <Label>Selecione a Grade do Pacote</Label>
                    <Select 
                      onValueChange={(val) => setValue('grade_atacado_id', val, { shouldValidate: true })}
                      value={selectedGradeAtacadoId && String(selectedGradeAtacadoId) !== 'null' ? String(selectedGradeAtacadoId) : undefined}
                    >
                      <SelectTrigger className="bg-black/40 border-white/10 h-12">
                        <SelectValue placeholder="Selecione a grade..." />
                      </SelectTrigger>
                      <SelectContent>
                        {grids?.map(g => (
                          <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Preço Unitário Exclusivo (Grade)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...register('preco_atacado_grade')} 
                      className="bg-black/40 border-purple-500/30 h-12 text-lg font-bold text-purple-400" 
                      placeholder="R$ 0,00" 
                    />
                  </div>

                  {composicaoFields.length > 0 && (
                    <div className="border border-white/10 rounded-lg overflow-hidden mt-2">
                      <Table>
                        <TableHeader className="bg-purple-500/10">
                          <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="h-8 text-xs text-purple-300">Tamanho</TableHead>
                            <TableHead className="h-8 text-xs text-right text-purple-300">Qtd p/ Pacote</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-black/20">
                          {composicaoFields.map((field: any, idx) => (
                            <TableRow key={field.id} className="border-white/5 hover:bg-transparent">
                              <TableCell className="py-2 font-medium">
                                {field.tamanho}
                                <input type="hidden" {...register(`composicao_atacado.${idx}.tamanho`)} />
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                <Input type="number" min="0" className="h-8 w-20 ml-auto bg-black/40 border-white/10 text-right" {...register(`composicao_atacado.${idx}.quantidade`, { valueAsNumber: true })} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {gradeAtacadoObj && (
                    <div className="bg-black/40 rounded-xl border border-white/10 p-4 text-sm space-y-2 mt-4 shadow-inner">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Peças (1 pacote):</span>
                        <span className="font-bold text-lg">{totalPecasPacote} un</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold">
                        <span>Valor Total do Pacote:</span>
                        <span className="text-purple-400 text-xl">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalPacote)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right mt-1 opacity-70">
                        Calculado como: Preço Unitário × Total de Peças
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}