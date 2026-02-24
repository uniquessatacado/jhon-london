import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Check, ArrowLeft, DollarSign, Lock, Box, Grid as GridIcon, Tag, 
  ArrowDown, Copy, Barcode, ScanBarcode, Upload, X, Image as ImageIcon, Video, Play, Trash2, Loader2 
} from 'lucide-react';
import { useCategories, useAllSubcategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { useGrids } from '@/hooks/use-grids';
import { useProductMutation } from '@/hooks/use-product-mutations';
import { useProduct } from '@/hooks/use-products';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Hooks de Dados
  const { data: productData, isLoading: isLoadingProduct } = useProduct(id);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: grids } = useGrids();
  const { data: allSubcategories } = useAllSubcategories();
  const { mutate: saveProduct, isPending } = useProductMutation();

  // Estados de Arquivos
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null); // Pode ser URL remota ou local
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]); // Apenas novos arquivos
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]); // URLs para display (mistura antigos e novos)

  const [bulkStockQty, setBulkStockQty] = useState(''); 

  const { register, control, handleSubmit, formState: { isSubmitting }, setValue, watch, reset } = useForm<any>({
    defaultValues: {
      variacoes: [],
      composicao_atacado: [], 
      habilita_atacado_geral: false,
      habilita_atacado_grade: false,
      usar_preco_atacado_unico: true,
      preco_custo: 0,
      preco_varejo: 0,
      preco_atacado_geral: 0,
      preco_atacado_grade: 0
    }
  });

  // Arrays
  const { fields: variacaoFields, replace: replaceVariacoes } = useFieldArray({ control, name: "variacoes" });
  const { fields: composicaoFields, replace: replaceComposicao } = useFieldArray({ control, name: "composicao_atacado" });

  // --- POPULAR DADOS NA EDIÇÃO ---
  useEffect(() => {
    if (productData && isEditing) {
        // Campos Simples
        setValue('nome', productData.nome);
        setValue('categoria_id', String(productData.categoria_id));
        setValue('subcategoria_id', String(productData.subcategoria_id));
        setValue('marca_id', String(productData.marca_id));
        setValue('grade_id', String(productData.grade_id));
        
        // Fiscal
        setValue('ncm', productData.ncm);
        setValue('cfop_padrao', productData.cfop_padrao);
        setValue('cst_icms', productData.cst_icms);
        setValue('origem', productData.origem);
        setValue('unidade_medida', productData.unidade_medida);

        // Financeiro
        setValue('preco_custo', productData.preco_custo);
        setValue('preco_varejo', productData.preco_varejo);
        
        // Atacado
        setValue('habilita_atacado_geral', productData.habilita_atacado_geral);
        setValue('preco_atacado_geral', productData.preco_atacado_geral);
        setValue('habilita_atacado_grade', productData.habilita_atacado_grade);
        setValue('usar_preco_atacado_unico', productData.usar_preco_atacado_unico);
        setValue('grade_atacado_id', String(productData.grade_atacado_id || ''));
        setValue('preco_atacado_grade', productData.preco_atacado_grade);

        // Variações (Grade)
        if (productData.variacoes) {
            replaceVariacoes(productData.variacoes);
        }

        // Imagens (Apenas Previews)
        if (productData.imagem_principal) {
            setMainImagePreview(productData.imagem_principal);
        }
        if (productData.imagens_galeria) {
            setGalleryPreviews(productData.imagens_galeria);
        }
        
        toast("Dados do produto carregados.");
    }
  }, [productData, isEditing, setValue, replaceVariacoes]);


  // --- Lógica de Grade (Só aplica se mudar grade e NÃO estiver carregando inicial) ---
  const selectedGridId = watch('grade_id');
  const selectedGridObj = useMemo(() => grids?.find(g => String(g.id) === String(selectedGridId)), [grids, selectedGridId]);

  useEffect(() => {
    // Se selecionou uma grade e NÃO temos variações carregadas (ou é criação), popula
    // Na edição, o useEffect acima já populou com os dados do banco, então evitamos sobrescrever
    // A menos que o usuário explicitamente mude a grade
    if (selectedGridObj && !isEditing && variacaoFields.length === 0) {
        replaceVariacoes(selectedGridObj.tamanhos.map(t => ({
            tamanho: t.tamanho,
            estoque: 0,
            sku: '',
            codigo_barras: ''
        })));
    }
  }, [selectedGridObj, isEditing, variacaoFields.length, replaceVariacoes]);


  // Watchers & Helpers
  const selectedSubcategoryId = watch('subcategoria_id');
  useEffect(() => {
    // Auto-preencher fiscal ao selecionar subcategoria
    if (selectedSubcategoryId && allSubcategories) {
      const sub = allSubcategories.find(s => String(s.id) === String(selectedSubcategoryId));
      if (sub) {
        setValue('ncm', sub.ncm);
        setValue('cfop_padrao', sub.cfop_padrao);
        setValue('cst_icms', sub.cst_icms);
        setValue('origem', sub.origem);
        setValue('unidade_medida', sub.unidade_medida);
      }
    }
  }, [selectedSubcategoryId, allSubcategories, setValue]);

  const handleBulkStockApply = () => {
    if (!bulkStockQty) return;
    variacaoFields.forEach((_, index) => setValue(`variacoes.${index}.estoque`, Number(bulkStockQty)));
    toast.success(`Estoque definido como ${bulkStockQty} para todos!`);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Máximo 5MB.");
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data: any) => {
    const payload = {
        ...data,
        id: isEditing ? Number(id) : undefined,
        imagem_principal_file: mainImageFile,
        imagens_galeria_files: galleryFiles,
        video_file: videoFile
    };
    saveProduct(payload);
  };

  if (isEditing && isLoadingProduct) {
      return (
          <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
              <p className="text-muted-foreground">Carregando dados do produto...</p>
          </div>
      );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Button type="button" variant="outline" size="icon" onClick={() => navigate('/produtos')} className="bg-white/5 border-white/10 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h1>
            <p className="text-muted-foreground">{isEditing ? 'Atualize os dados e estoque.' : 'Cadastro completo com grade e variação.'}</p>
          </div>
        </div>
        <Button size="lg" type="submit" disabled={isPending || isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          {isPending || isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Check className="mr-2 h-4 w-4" /> Salvar Produto</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COLUNA ESQUERDA */}
          <div className="space-y-8">
              {/* Identificação */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4 text-emerald-500" /> Identificação</CardTitle></CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid gap-2">
                        <Label>Nome do Produto *</Label>
                        <Input {...register('nome', { required: true })} className="bg-black/40 border-white/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="grid gap-2">
                            <Label>Subcategoria *</Label>
                            <Select onValueChange={(v) => setValue('subcategoria_id', v)} value={watch('subcategoria_id')}>
                                <SelectTrigger className="bg-black/40 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>{allSubcategories?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>)}</SelectContent>
                            </Select>
                         </div>
                         <div className="grid gap-2">
                            <Label>Marca *</Label>
                            <Select onValueChange={(v) => setValue('marca_id', v)} value={watch('marca_id')}>
                                <SelectTrigger className="bg-black/40 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>{brands?.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.nome}</SelectItem>)}</SelectContent>
                            </Select>
                         </div>
                    </div>
                </CardContent>
              </Card>

              {/* Imagens */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4 text-emerald-500" /> Mídia</CardTitle></CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <Label className="mb-2 block">Capa</Label>
                    <div className="flex gap-4 items-center">
                        <div className={`h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-black/40 ${mainImagePreview ? 'border-emerald-500/50' : 'border-white/10'}`}>
                            {mainImagePreview ? <img src={mainImagePreview} className="h-full w-full object-cover" /> : <Upload className="h-6 w-6 opacity-50" />}
                        </div>
                        <Input type="file" accept="image/*" onChange={handleMainImageChange} className="max-w-[250px] bg-white/5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
          </div>

          {/* COLUNA DIREITA */}
          <div className="space-y-8">
              {/* Financeiro */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-500" /> Preços</CardTitle></CardHeader>
                <CardContent className="pt-4 grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Custo (R$)</Label>
                        <Input type="number" step="0.01" {...register('preco_custo')} className="bg-black/40 border-white/10" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Varejo (R$)</Label>
                        <Input type="number" step="0.01" {...register('preco_varejo')} className="bg-black/40 border-emerald-500/30 text-emerald-400 font-bold" />
                    </div>
                </CardContent>
              </Card>

              {/* Estoque e Grade */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2"><GridIcon className="h-4 w-4 text-emerald-500" /> Grade e Estoque</CardTitle></CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="grid gap-2">
                        <Label>Grade Utilizada</Label>
                        <Select onValueChange={(v) => setValue('grade_id', v)} value={watch('grade_id')}>
                            <SelectTrigger className="bg-black/40 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{grids?.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>

                    {variacaoFields.length > 0 && (
                        <div className="rounded border border-white/10 overflow-hidden">
                            <div className="bg-white/5 p-2 flex gap-2 items-center border-b border-white/10">
                                <Input 
                                    placeholder="Qtd. Geral" 
                                    className="h-8 w-24 bg-black/40" 
                                    value={bulkStockQty}
                                    onChange={(e) => setBulkStockQty(e.target.value)}
                                />
                                <Button type="button" size="sm" variant="secondary" className="h-8" onClick={handleBulkStockApply}>Aplicar a todos</Button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent"><TableHead>Tam</TableHead><TableHead>Estoque</TableHead><TableHead>SKU</TableHead></TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {variacaoFields.map((field: any, index) => (
                                            <TableRow key={field.id} className="hover:bg-white/5">
                                                <TableCell className="font-bold py-2">{field.tamanho}</TableCell>
                                                <TableCell className="py-2"><Input type="number" {...register(`variacoes.${index}.estoque`)} className="h-8 w-24 bg-black/40" /></TableCell>
                                                <TableCell className="py-2"><Input {...register(`variacoes.${index}.sku`)} className="h-8 uppercase bg-black/40" placeholder="SKU" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
              </Card>
          </div>
      </div>
      
      {/* Campos ocultos Fiscais (populados pelo efeito da subcategoria) */}
      <input type="hidden" {...register('ncm')} />
      <input type="hidden" {...register('cfop_padrao')} />
      <input type="hidden" {...register('cst_icms')} />
      <input type="hidden" {...register('origem')} />
      <input type="hidden" {...register('unidade_medida')} />
    </form>
  );
}