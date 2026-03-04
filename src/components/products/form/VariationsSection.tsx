import { useState, useEffect, useRef, useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Grid as GridIcon, Ruler } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Grid } from '@/types';
import { api } from '@/lib/api';

interface VariationsSectionProps {
  isEditMode: boolean;
  isDuplicateMode: boolean;
  grids?: Grid[];
}

const MobileVariationCard = ({ field, currentVariation, index, register, skuErrors, validarSku, onEditDimensions, isEditMode }: any) => {
  const currentEan = currentVariation?.codigo_barras;
  const currentSku = currentVariation?.sku;
  const isMissingBoth = !currentEan && !currentSku;
  const skuErrorMsg = skuErrors[index];

  const skuBorder = isMissingBoth ? "border-red-500/50 bg-red-500/5" : skuErrorMsg ? "border-red-500 text-red-200" : "bg-black/40 border-white/10";
  const eanBorder = isMissingBoth ? "border-red-500/50 bg-red-500/5" : "bg-black/40 border-white/10";

  const hasDimensions = currentVariation?.peso_kg > 0 || currentVariation?.altura_cm > 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-lg">{field.tamanho}</Badge>
        <div className="w-32">
          <Label className="text-xs text-muted-foreground">Estoque</Label>
          <Input type="number" {...register(`variacoes.${index}.estoque`)} disabled={isEditMode} className="bg-black/40 border-white/10 h-12 text-center text-lg disabled:opacity-70" placeholder="0" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">SKU</Label>
        <Input 
          {...register(`variacoes.${index}.sku`)} 
          onBlur={(e) => validarSku(e.target.value, index, currentVariation?.id)}
          className={`${skuBorder} uppercase h-12`} 
          placeholder={currentEan ? "Opcional" : "Obrigatório"} 
        />
        {skuErrorMsg && <p className="text-xs text-red-400">{skuErrorMsg}</p>}
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Cód. Barras</Label>
        <Input {...register(`variacoes.${index}.codigo_barras`)} className={`${eanBorder} h-12`} placeholder="EAN-13" />
      </div>
      <Button type="button" variant="outline" className={`w-full h-12 ${hasDimensions ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-white/10'}`} onClick={() => onEditDimensions(index)}>
        <Ruler className="mr-2 h-4 w-4" /> {hasDimensions ? 'Editar Dimensões' : 'Adicionar Dimensões'}
      </Button>
    </div>
  );
};

export function VariationsSection({ isEditMode, isDuplicateMode, grids }: VariationsSectionProps) {
  const { register, control, watch, setValue } = useFormContext<any>();
  const { fields: variacaoFields, replace } = useFieldArray({ control, name: "variacoes" });
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [bulkStockQty, setBulkStockQty] = useState('');
  const [editingDimensionsIndex, setEditingDimensionsIndex] = useState<number | null>(null);
  
  // Estado para armazenar os erros de SKU vindos da API
  const [skuErrors, setSkuErrors] = useState<Record<number, string>>({});

  const variacoesValues = watch('variacoes') || [];
  const selectedGridId = watch('grade_id');
  const initialGridIdRef = useRef<string | null>(null);

  const selectedGridObj = useMemo(() => grids?.find(g => String(g.id) === String(selectedGridId)), [grids, selectedGridId]);

  useEffect(() => {
    if ((isEditMode || isDuplicateMode) && selectedGridId && !initialGridIdRef.current) {
        initialGridIdRef.current = String(selectedGridId);
    }
  }, [selectedGridId, isEditMode, isDuplicateMode]);

  useEffect(() => {
    if (!selectedGridObj) return;

    const currentSizes = variacaoFields.map((v:any) => v.tamanho);
    const newSizes = selectedGridObj.tamanhos.map(t => t.tamanho);

    if ((isEditMode || isDuplicateMode) && String(selectedGridObj.id) === initialGridIdRef.current) {
        if (currentSizes.length === 0) {
            replace(selectedGridObj.tamanhos.map(t => ({
                tamanho: t.tamanho, 
                estoque: 0, 
                sku: '', 
                codigo_barras: '', 
                peso_kg: t.peso_kg || 0, 
                altura_cm: t.altura_cm || 0, 
                largura_cm: t.largura_cm || 0, 
                comprimento_cm: t.comprimento_cm || 0,
            })));
        }
        return; 
    }

    if (JSON.stringify(currentSizes) !== JSON.stringify(newSizes)) {
        replace(selectedGridObj.tamanhos.map(t => ({
            tamanho: t.tamanho, 
            estoque: 0, 
            sku: '', 
            codigo_barras: '', 
            peso_kg: t.peso_kg || 0, 
            altura_cm: t.altura_cm || 0, 
            largura_cm: t.largura_cm || 0, 
            comprimento_cm: t.comprimento_cm || 0,
        })));
    }
  }, [selectedGridObj, isEditMode, isDuplicateMode, replace, variacaoFields]);

  const handleApplyBulkStock = () => {
    const qty = Number(bulkStockQty);
    if (isNaN(qty) || bulkStockQty === '') return;
    const updatedVariations = variacoesValues.map((v: any) => ({ ...v, estoque: qty }));
    setValue('variacoes', updatedVariations);
    setBulkStockQty('');
  };

  // Função para validar o SKU via API no onBlur
  const validarSku = async (sku: string, index: number, variacaoId?: number) => {
    if (!sku) {
      setSkuErrors(prev => ({ ...prev, [index]: '' }));
      return;
    }
    try {
      const { data } = await api.get('/produtos/verificar-sku', {
        params: { sku, variacao_id: variacaoId }
      });
      setSkuErrors(prev => ({ 
        ...prev, 
        [index]: data.existe ? data.mensagem : '' 
      }));
    } catch (e) {
      console.error("Erro ao validar SKU:", e);
    }
  };

  if (variacaoFields.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
      <CardHeader className="pb-4 border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-emerald-400">
          <GridIcon className="h-5 w-5" /> 2. Grade, Estoque & Dimensões
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="animate-in fade-in slide-in-from-top-4">
          {!isEditMode && (
            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-black/20 border border-white/10 max-w-sm">
              <Input type="number" placeholder="Estoque p/ todos" className="bg-transparent border-none h-8" value={bulkStockQty} onChange={(e) => setBulkStockQty(e.target.value)} />
              <Button type="button" size="sm" onClick={handleApplyBulkStock} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">Aplicar</Button>
            </div>
          )}

          {isMobile ? (
            <div className="space-y-4">
              {variacaoFields.map((field: any, index) => (
                <MobileVariationCard 
                  key={field.id} 
                  field={field} 
                  currentVariation={variacoesValues?.[index]} 
                  index={index} 
                  register={register} 
                  skuErrors={skuErrors}
                  validarSku={validarSku}
                  onEditDimensions={setEditingDimensionsIndex} 
                  isEditMode={isEditMode} 
                />
              ))}
            </div>
          ) : (
            <div id="variations-table" className="rounded-xl border border-white/10 overflow-hidden">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-[80px] text-emerald-400 font-bold">Tam.</TableHead>
                    <TableHead className="w-[100px]">Estoque</TableHead>
                    <TableHead className="min-w-[180px]">SKU</TableHead>
                    <TableHead className="min-w-[150px]">Cód. Barras</TableHead>
                    <TableHead>Peso(kg)</TableHead>
                    <TableHead>A(cm)</TableHead>
                    <TableHead>L(cm)</TableHead>
                    <TableHead>C(cm)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-black/20">
                  {variacaoFields.map((field: any, index) => {
                    const currentVariation = variacoesValues?.[index];
                    const skuErrorMsg = skuErrors[index];
                    
                    return (
                      <TableRow key={field.id} className="border-white/10 hover:bg-white/5">
                        <TableCell><Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-3 py-1">{field.tamanho}</Badge></TableCell>
                        <TableCell><Input type="number" {...register(`variacoes.${index}.estoque`)} disabled={isEditMode} className="bg-black/40 border-white/10 h-9 disabled:opacity-70" /></TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <Input 
                              {...register(`variacoes.${index}.sku`)} 
                              onBlur={(e) => validarSku(e.target.value, index, currentVariation?.id)}
                              className={`uppercase h-9 ${skuErrorMsg ? 'border-red-500' : 'bg-black/40 border-white/10'}`} 
                            />
                            {skuErrorMsg && <span className="text-red-500 text-[10px] leading-tight block">{skuErrorMsg}</span>}
                          </div>
                        </TableCell>
                        
                        <TableCell><Input {...register(`variacoes.${index}.codigo_barras`)} className="h-9 bg-black/40 border-white/10" /></TableCell>
                        <TableCell><Input type="number" step="0.01" {...register(`variacoes.${index}.peso_kg`)} className="bg-black/40 border-white/10 h-9 w-20" /></TableCell>
                        <TableCell><Input type="number" {...register(`variacoes.${index}.altura_cm`)} className="bg-black/40 border-white/10 h-9 w-16" /></TableCell>
                        <TableCell><Input type="number" {...register(`variacoes.${index}.largura_cm`)} className="bg-black/40 border-white/10 h-9 w-16" /></TableCell>
                        <TableCell><Input type="number" {...register(`variacoes.${index}.comprimento_cm`)} className="bg-black/40 border-white/10 h-9 w-16" /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>

      {isMobile && editingDimensionsIndex !== null && (
        <Dialog open={editingDimensionsIndex !== null} onOpenChange={(open) => !open && setEditingDimensionsIndex(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Dimensões - Tamanho {variacoesValues[editingDimensionsIndex]?.tamanho}</DialogTitle>
              <DialogDescription>Insira as dimensões da embalagem para cálculo de frete.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="grid gap-2 col-span-2">
                <Label>Peso (kg)</Label>
                <Input type="number" step="0.01" {...register(`variacoes.${editingDimensionsIndex}.peso_kg`)} className="h-12 text-lg" />
              </div>
              <div className="grid gap-2">
                <Label>Altura (cm)</Label>
                <Input type="number" {...register(`variacoes.${editingDimensionsIndex}.altura_cm`)} className="h-12 text-lg" />
              </div>
              <div className="grid gap-2">
                <Label>Largura (cm)</Label>
                <Input type="number" {...register(`variacoes.${editingDimensionsIndex}.largura_cm`)} className="h-12 text-lg" />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label>Comprimento (cm)</Label>
                <Input type="number" {...register(`variacoes.${editingDimensionsIndex}.comprimento_cm`)} className="h-12 text-lg" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setEditingDimensionsIndex(null)}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}