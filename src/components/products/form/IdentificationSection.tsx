import { useFormContext, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tag } from 'lucide-react';
import { Category, Subcategory, Brand, Grid } from '@/types';

interface IdentificationSectionProps {
  categories?: Category[];
  allSubcategories?: Subcategory[];
  brands?: Brand[];
  grids?: Grid[];
}

export function IdentificationSection({ categories, allSubcategories, brands, grids }: IdentificationSectionProps) {
  const { register, control, watch, formState: { errors } } = useFormContext<any>();

  // Categoria é apenas "visual" neste select, derivado da subcategoria
  const categoriaId = watch('categoria_id');

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
          <Input 
            id="nome" 
            {...register('nome', { required: true })} 
            className={`bg-black/40 h-14 text-base ${errors.nome ? 'border-red-500' : 'border-white/10'}`} 
            placeholder="Ex: Camiseta Básica Gola V" 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="grid gap-2">
            <Label>Categoria *</Label>
            <Select value={categoriaId !== undefined && categoriaId !== null && categoriaId !== '' ? String(categoriaId) : undefined} disabled>
              <SelectTrigger className="bg-black/40 h-14 text-base border-white/10 disabled:opacity-70 disabled:cursor-not-allowed">
                <SelectValue placeholder="Automático pela subcategoria..." />
              </SelectTrigger>
              <SelectContent>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Subcategoria *</Label>
            <Controller
              control={control}
              name="subcategoria_id"
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value !== undefined && field.value !== null && field.value !== '' ? String(field.value) : undefined}>
                  <SelectTrigger className={`bg-black/40 h-14 text-base ${errors.subcategoria_id ? 'border-red-500' : 'border-white/10'}`}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allSubcategories?.map(sub => (
                      <SelectItem key={sub.id} value={String(sub.id)}>{sub.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label>Marca *</Label>
            <Controller
              control={control}
              name="marca_id"
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value !== undefined && field.value !== null && field.value !== '' ? String(field.value) : undefined}>
                  <SelectTrigger className={`bg-black/40 h-14 text-base ${errors.marca_id ? 'border-red-500' : 'border-white/10'}`}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {brands?.map(brand => (
                      <SelectItem key={brand.id} value={String(brand.id)}>{brand.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid gap-2">
            <Label>Grade do Produto *</Label>
            <Controller
              control={control}
              name="grade_id"
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value !== undefined && field.value !== null && field.value !== '' ? String(field.value) : undefined}>
                  <SelectTrigger className={`bg-black/40 h-14 text-base ${errors.grade_id ? 'border-red-500' : 'border-white/10'}`}>
                    <SelectValue placeholder="Escolha uma grade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {grids?.map(g => (
                      <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}