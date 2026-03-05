"use client";

import { useEffect, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Grid as GridIcon, Ruler, AlertCircle } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Grid } from '@/types';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/use-debounce';

interface VariationsSectionProps {
  isEditMode: boolean;
  isDuplicateMode: boolean;
  grids?: Grid[];
}

const VariationRow = ({ field, index, isEditMode, isDuplicateMode, variacoesValues, onEditDimensions, isMobile }: any) => {
  const { register, watch, setError, clearErrors } = useFormContext();
  const currentVariation = variacoesValues[index];
  const currentSku = watch(`variacoes.${index}.sku`);
  
  // Estado local para segurar o erro independentemente do React Hook Form
  const [localSkuError, setLocalSkuError] = useState<string | null>(null);
  
  const debouncedSku = useDebounce(currentSku, 600);

  useEffect(() => {
    const validateSku = async () => {
      const skuVal = debouncedSku?.trim().toUpperCase();
      
      if (!skuVal) {
        setLocalSkuError(null);
        clearErrors(`variacoes.${index}.sku`);
        return;
      }

      // 1. Validação Local (Duplicados na tela)
      const allSkus = variacoesValues.map((v: any) => v.sku?.trim().toUpperCase()).filter(Boolean);
      const isLocalDuplicate = allSkus.filter((s: string) => s === skuVal).length > 1;

      if (isLocalDuplicate) {
        const msg = 'SKU duplicado nesta grade';
        setLocalSkuError(msg);
        setError(`variacoes.${index}.sku`, { type: 'manual', message: msg });
        return;
      }

      // 2. Validação no Banco de Dados (API do Kimi)
      try {
        const varId = (!isEditMode || isDuplicateMode) ? undefined : currentVariation?.id;
        
        let url = `/produtos/verificar-sku?sku=${skuVal}`;
        if (varId) url += `&variacao_id=${varId}`;

        const { data } = await api.get(url);

        if (data.existe) {
          const msg = data.produto_nome ? `Em uso por: ${data.produto_nome}` : data.mensagem;
          setLocalSkuError(msg);
          setError(`variacoes.${index}.sku`, { type: 'manual', message: msg });
        } else {
          setLocalSkuError(null);
          clearErrors(`variacoes.${index}.sku`);
        }
      } catch (error) {
        console.error('Erro na API ao validar SKU:', error);
      }
    };

    validateSku();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSku]); // Observa APENAS o debounce para não causar repetições

  const hasDimensions = currentVariation?.peso_kg > 0 || currentVariation?.altura_cm > 0;

  if (isMobile) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-lg">{field.tamanho}</Badge>
          <div className="w-32">
            <Label className="text-xs text-muted-foreground">Estoque</Label>
            <Input type="number" {...register(`variacoes.${index}.estoque`)} disabled={isEditMode && !isDuplicateMode} className="bg-black/40 border-white/10 h-12 text-center text-lg disabled:opacity-70" placeholder="0" />
          </div>
        </div>
        <div className="space-y-2 relative">
          <Label className="text-xs">SKU</Label>
          <Input 
            {...register(`variacoes.${index}.sku`)}
            className={`uppercase h-12 transition-all ${localSkuError ? 'border-red-500 bg-red-500/10 text-white font-bold ring-2 ring-red-500' : 'bg-black/40 border-white/10'}`} 
            placeholder="Opcional se estoque 0" 
          />
          {localSkuError && (
            <div className="bg-red-500 text-white text-xs font-bold p-2.5 rounded-lg shadow-lg border border-red-600 flex items-start gap-1.5 mt-1 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="leading-tight">{localSkuError}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Cód. Barras</Label>
          <Input {...register(`variacoes.${index}.codigo_barras`)} className="bg-black/40 border-white/10 h-12" placeholder="EAN-13" />
        </div>
        <Button type="button" variant="outline" className={`w-full h-12 ${hasDimensions ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-white/10'}`} onClick={() => onEditDimensions(index)}>
          <Ruler className="mr-2 h-4 w-4" /> {hasDimensions ? 'Editar Dimensões' : 'Adicionar Dimensões'}
        </Button>
      </div>
    );
  }

  return (
    <TableRow className="border-white/10 hover:bg-white/5">
      <TableCell><Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-3 py-1">{field.tamanho}</Badge></TableCell>
      <TableCell><Input type="number" {...register(`variacoes.${index}.estoque`)} disabled={isEditMode && !isDuplicateMode} className="bg-black/40 border-white/10 h-9 disabled:opacity-70" /></TableCell>
      
      <TableCell className="relative">
        <Input 
          {...register(`variacoes.${index}.sku`)}
          className={`uppercase h-9 transition-all ${localSkuError ? 'border-red-500 bg-red-500/10 text-white font-bold ring-2 ring-red-500' : 'bg-black/40 border-white/10 focus-visible:ring-emerald-500'}`} 
        />
        {localSkuError && (
          <div className="absolute z-20 top-full left-4 mt-2 bg-red-500 text-white text-xs font-bold p-2.5 rounded-lg shadow-xl border border-red-600 flex items-start gap-1.5 min-w-[200px] animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-tight">{localSkuError}</span>
            <div className="absolute -top-1.5 left-4 w-3 h-3 bg-red-500 rotate-45 border-l border-t border-red-600" />
          </div>
        )}
      </TableCell>
      
      <TableCell>
        <Input {...register(`variacoes.${index}.codigo_barras`)} className="bg-black/40 border-white/10 focus-visible:ring-emerald-500 h-9" />
      </TableCell>

      <TableCell><Input type="number" step="0.01" {...register(`variacoes.${index}.peso_kg`)} className="bg-black/40 border-white/10 h-9 w-20" /></TableCell>
      <TableCell><Input type="number" {...register(`variacoes.${index}.altura_cm`)} className="bg-black/40 border-white/10 h-9 w-16" /></TableCell>
      <TableCell><Input type="number" {...register(`variacoes.${index}.largura_cm`)} className="bg-black/40 border-white/10 h-9 w-16" /></TableCell>
      <TableCell><Input type="number" {...register(`variacoes.${index}.comprimento_cm`)} className="bg-black/40 border-white/10 h-9 w-16" /></TableCell>
    </TableRow>
  );
};

export function VariationsSection({ isEditMode, isDuplicateMode, grids }: VariationsSectionProps) {
  const { control, watch, setValue } = useFormContext<any>();
  const { fields: variacaoFields } = useFieldArray({ control, name: "variacoes" });
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [bulkStockQty, setBulkStockQty] = useState('');
  const [editingDimensionsIndex, setEditingDimensionsIndex] = useState<number | null>(null);

  const variacoesValues = watch('variacoes') || [];

  const handleApplyBulkStock = () => {
    const qty = Number(bulkStockQty);
    if (isNaN(qty) || bulkStockQty === '') return;
    const updatedVariations = variacoesValues.map((v: any) => ({ ...v, estoque: qty }));
    setValue('variacoes', updatedVariations);
    setBulkStockQty('');
  };

  if (variacaoFields.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-visible">
      <CardHeader className="pb-4 border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-emerald-400">
          <GridIcon className="h-5 w-5" /> 2. Grade, Estoque & Dimensões
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6 overflow-visible">
        <div className="animate-in fade-in slide-in-from-top-4 overflow-visible">
          {(!isEditMode || isDuplicateMode) && (
            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-black/20 border border-white/10 max-w-sm">
              <Input type="number" placeholder="Estoque p/ todos" className="bg-transparent border-none h-8" value={bulkStockQty} onChange={(e) => setBulkStockQty(e.target.value)} />
              <Button type="button" size="sm" onClick={handleApplyBulkStock} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">Aplicar</Button>
            </div>
          )}

          {isMobile ? (
            <div className="space-y-4">
              {variacaoFields.map((field: any, index: number) => (
                <VariationRow 
                  key={field.id} 
                  field={field} 
                  index={index} 
                  isEditMode={isEditMode} 
                  isDuplicateMode={isDuplicateMode}
                  variacoesValues={variacoesValues} 
                  onEditDimensions={setEditingDimensionsIndex} 
                  isMobile={isMobile} 
                />
              ))}
            </div>
          ) : (
            <div id="variations-table" className="rounded-xl border border-white/10 overflow-visible">
              <Table className="overflow-visible">
                <TableHeader className="bg-black/40">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="w-[80px] text-emerald-400 font-bold">Tam.</TableHead>
                    <TableHead className="w-[100px]">Estoque</TableHead>
                    <TableHead className="min-w-[220px]">SKU</TableHead>
                    <TableHead className="min-w-[150px]">Cód. Barras</TableHead>
                    <TableHead>Peso(kg)</TableHead>
                    <TableHead>A(cm)</TableHead>
                    <TableHead>L(cm)</TableHead>
                    <TableHead>C(cm)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-black/20 overflow-visible">
                  {variacaoFields.map((field: any, index: number) => (
                    <VariationRow 
                      key={field.id} 
                      field={field} 
                      index={index} 
                      isEditMode={isEditMode} 
                      isDuplicateMode={isDuplicateMode}
                      variacoesValues={variacoesValues} 
                      isMobile={isMobile} 
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}