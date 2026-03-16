import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tag } from 'lucide-react';
import { Category, Subcategory, Brand, Grid } from '@/types';
import { supabase } from '@/lib/supabase';

interface IdentificationSectionProps {
  categories?: Category[];
  allSubcategories?: Subcategory[];
  brands?: Brand[];
  grids?: Grid[];
}

export function IdentificationSection({ categories, allSubcategories, brands, grids }: IdentificationSectionProps) {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<any>();
  const categoriaId = watch('categoria_id');

  const handleSubcategoryChange = async (val: string) => {
    if (!allSubcategories) return;
    
    const selectedSub = allSubcategories.find(sub => String(sub.id) === val);
    if (selectedSub) {
      setValue('categoria_id', String(selectedSub.categoria_id));
      if (selectedSub.grade_id) {
          setValue('grade_id', String(selectedSub.grade_id), { shouldValidate: true });
      }
      
      try {
          const { data: fiscalData } = await supabase.from('subcategorias').select('ncm,cfop_padrao,cst_icms,origem,unidade_medida').eq('id', val).single();
          if (fiscalData) {
            setValue('ncm', fiscalData.ncm);
            setValue('cfop_padrao', fiscalData.cfop_padrao);
            setValue('cst_icms', fiscalData.cst_icms);
            setValue('origem', String(fiscalData.origem));
            setValue('unidade_medida', fiscalData.unidade_medida);
          }
      } catch (e) {
          console.error("Erro ao buscar dados fiscais", e);
      }
    }
  };

  return (
    <Card className="bg-black/20 border-white/10 shadow-lg">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-base flex items-center gap-2 text-white">
          <Tag className="h-4 w-4 text-emerald-500" /> 1. Identificação e Classificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-2">
          <Label htmlFor="nome">Nome do Produto *</Label>
          <Input id="nome" {...register('nome', { required: true })} className={`bg-black/40 h-14 text-base ${errors.nome ? 'border-red-500' : 'border-white/10'}`} placeholder="Ex: Camiseta Básica Gola V" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="grid gap-2">
            <Label>Categoria *</Label>
            <Select value={categoriaId ? String(categoriaId) : undefined} disabled>
              <SelectTrigger className="bg-black/40 h-14 text-base border-white/10 disabled:opacity-70"><SelectValue placeholder="Automático pela subcategoria..." /></SelectTrigger>
              <SelectContent>{categories?.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Subcategoria *</Label>
            <Controller
              control={control} name="subcategoria_id" rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={(val) => { field.onChange(val); handleSubcategoryChange(val); }} value={field.value ? String(field.value) : undefined}>
                  <SelectTrigger className={`bg-black/40 h-14 text-base ${errors.subcategoria_id ? 'border-red-500' : 'border-white/10'}`}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{allSubcategories?.map(sub => <SelectItem key={sub.id} value={String(sub.id)}>{sub.nome}</SelectItem>)}</SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label>Marca *</Label>
            <Controller
              control={control} name="marca_id" rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                  <SelectTrigger className={`bg-black/40 h-14 text-base ${errors.marca_id ? 'border-red-500' : 'border-white/10'}`}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{brands?.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.nome}</SelectItem>)}</SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label>Grade do Produto *</Label>
            <Controller
              control={control} name="grade_id" rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                  <SelectTrigger className={`bg-black/40 h-14 text-base ${errors.grade_id ? 'border-red-500' : 'border-white/10'}`}><SelectValue placeholder="Escolha uma grade..." /></SelectTrigger>
                  <SelectContent>{grids?.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>)}</SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}