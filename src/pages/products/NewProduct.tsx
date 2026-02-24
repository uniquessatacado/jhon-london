import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Check, ArrowLeft, Info, DollarSign, Lock, Box, Grid as GridIcon, Tag, Ruler, AlertTriangle, ArrowDown, Copy, Barcode, ScanBarcode, 
  Upload, X, Image as ImageIcon, Video, Play, Trash2, Loader2 
} from 'lucide-react';
import { useCategories, useAllSubcategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { useGrids } from '@/hooks/use-grids';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-create-product';
import { useProductDetails } from '@/hooks/use-product-details';
import { useProducts } from '@/hooks/use-products';
import { api } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMediaQuery } from '@/hooks/use-media-query';

// Componente para a lista de variações no mobile
const MobileVariationCard = ({ field, currentVariation, index, register, duplicateCheck }: any) => {
  const currentEan = currentVariation?.codigo_barras;
  const currentSku = currentVariation?.sku;
  const isMissingBoth = !currentEan && !currentSku;
  const isSkuDuplicate = currentSku && duplicateCheck.allDuplicateSkus.includes(currentSku);
  const isEanDuplicate = currentEan && duplicateCheck.allDuplicateEans.includes(currentEan);

  const skuBorder = isMissingBoth ? "border-red-500/50 bg-red-500/5" : isSkuDuplicate ? "border-red-500 text-red-200" : "bg-black/40 border-white/10";
  const eanBorder = isMissingBoth ? "border-red-500/50 bg-red-500/5" : isEanDuplicate ? "border-red-500 text-red-200" : "bg-black/40 border-white/10";

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
      <div className="flex justify-between items-center">
        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-lg">{field.tamanho}</Badge>
        <div className="w-32">
          <Label className="text-xs text-muted-foreground">Estoque</Label>
          <Input type="number" {...register(`variacoes.${index}.estoque`)} className="bg-black/40 border-white/10 h-12 text-center text-lg" placeholder="0" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">SKU</Label>
        <Input {...register(`variacoes.${index}.sku`)} className={`${skuBorder} uppercase h-12`} placeholder={currentEan ? "Opcional" : "Obrigatório"} />
        {isSkuDuplicate && <p className="text-xs text-red-400">SKU já existe</p>}
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Cód. Barras</Label>
        <Input {...register(`variacoes.${index}.codigo_barras`)} className={`${eanBorder} h-12`} placeholder="EAN-13" />
        {isEanDuplicate && <p className="text-xs text-red-400">Cód. Barras já existe</p>}
      </div>
    </div>
  );
};

export function NewProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicate_id');
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isEditMode = !!id;
  const isDuplicateMode = !!duplicateId;
  const fetchId = id || duplicateId;
  
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm<any>({
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

  const { fields: variacaoFields, replace: replaceVariacoes } = useFieldArray({ control, name: "variacoes" });
  const { fields: composicaoFields, replace: replaceComposicao } = useFieldArray({ control, name: "composicao_atacado" });
  
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: grids } = useGrids();
  const { data: allSubcategories } = useAllSubcategories();
  const { data: allProducts } = useProducts();
  
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { data: productData, isLoading: isLoadingData } = useProductDetails(fetchId || undefined);

  const [existingIdentifiers, setExistingIdentifiers] = useState<{skus: string[], eans: string[]}>({ skus: [], eans: [] });
  const [globalAtacadoMin, setGlobalAtacadoMin] = useState('10');
  const [bulkStockQty, setBulkStockQty] = useState('');

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/configuracoes/qtd_minima_atacado_geral')
      .then(res => setGlobalAtacadoMin(res.data?.valor || '10'))
      .catch(() => {
        console.error("Failed to fetch global wholesale minimum quantity.");
      });
  }, []);

  useEffect(() => {
    if (allProducts) {
        const skus: string[] = [];
        const eans: string[] = [];
        
        const productsToScan = isEditMode 
            ? allProducts.filter(p => String(p.id) !== id) 
            : allProducts;

        productsToScan.forEach(p => {
            if (p.variacoes && p.variacoes.length > 0) {
                p.variacoes.forEach(v => {
                    if (v.sku) skus.push(v.sku.trim());
                    if (v.codigo_barras) eans.push(v.codigo_barras.trim());
                });
            }
        });
        setExistingIdentifiers({ skus: [...new Set(skus)], eans: [...new Set(eans)] });
    }
  }, [allProducts, isEditMode, id]);

  useEffect(() => {
    if (productData) {
        const formData = {
            nome: isDuplicateMode ? `${productData.nome} - Cópia` : productData.nome,
            grade_id: productData.grade_id ? String(productData.grade_id) : "",
            subcategoria_id: productData.subcategoria_id ? String(productData.subcategoria_id) : "",
            marca_id: productData.marca_id ? String(productData.marca_id) : "",
            ncm: productData.ncm,
            cfop_padrao: productData.cfop_padrao,
            cst_icms: productData.cst_icms,
            origem: productData.origem,
            unidade_medida: productData.unidade_medida,
            preco_custo: productData.preco_custo,
            preco_varejo: productData.preco_varejo,
            habilita_atacado_geral: !!productData.habilita_atacado_geral, 
            preco_atacado_geral: productData.preco_atacado_geral,
            habilita_atacado_grade: !!productData.habilita_atacado_grade, 
            usar_preco_atacado_unico: !!productData.usar_preco_atacado_unico, 
            grade_atacado_id: productData.grade_atacado_id ? String(productData.grade_atacado_id) : '',
            preco_atacado_grade: productData.preco_atacado_grade,
            variacoes: productData.variacoes?.map(v => ({
                tamanho: v.tamanho,
                estoque: isDuplicateMode ? 0 : v.estoque,
                sku: isDuplicateMode ? '' : v.sku,
                codigo_barras: isDuplicateMode ? '' : v.codigo_barras
            })) || [],
            composicao_atacado: typeof productData.composicao_atacado_grade === 'string' 
                ? JSON.parse(productData.composicao_atacado_grade || "[]") 
                : (productData.composicao_atacado_grade || [])
        };
        reset(formData);
        if (!isDuplicateMode) {
            if (productData.imagem_principal) setMainImagePreview(productData.imagem_principal);
            if (productData.imagens_galeria?.length) {
                setGalleryPreviews(productData.imagens_galeria);
                setExistingGallery(productData.imagens_galeria); 
            }
            const videoSrc = productData.video_url || productData.video;
            if (videoSrc) setVideoPreview(videoSrc);
        } else {
            toast.info("Dados do produto copiados.", { description: "Revise SKU, estoque e imagens." });
        }
    }
  }, [productData, reset, isDuplicateMode]);
  
  const selectedGridId = watch('grade_id');
  const selectedSubcategoryId = watch('subcategoria_id');
  const habilitaAtacadoGeral = watch('habilita_atacado_geral');
  const habilitaAtacadoGrade = watch('habilita_atacado_grade');
  const usarPrecoUnico = watch('usar_preco_atacado_unico');
  const selectedGradeAtacadoId = watch('grade_atacado_id');
  const precoAtacadoGeral = watch('preco_atacado_geral') || 0;
  const precoAtacadoGrade = watch('preco_atacado_grade') || 0;
  
  const composicaoAtacadoValues = useWatch({ control, name: "composicao_atacado", defaultValue: [] });
  const variacoesValues = useWatch({ control, name: "variacoes", defaultValue: [] });

  const duplicateCheck = useMemo(() => {
    const currentVariations = variacoesValues || [];
    const skusInForm = currentVariations.map((v: any) => v.sku?.trim()).filter(Boolean);
    const eansInForm = currentVariations.map((v: any) => v.codigo_barras?.trim()).filter(Boolean);

    const duplicateSkusInForm = skusInForm.filter((item: string, index: number) => skusInForm.indexOf(item) !== index);
    const duplicateEansInForm = eansInForm.filter((item: string, index: number) => eansInForm.indexOf(item) !== index);

    const conflictingSkus = skusInForm.filter(sku => existingIdentifiers.skus.includes(sku));
    const conflictingEans = eansInForm.filter(ean => existingIdentifiers.eans.includes(ean));

    return {
        allDuplicateSkus: [...new Set([...duplicateSkusInForm, ...conflictingSkus])],
        allDuplicateEans: [...new Set([...duplicateEansInForm, ...conflictingEans])]
    };
  }, [variacoesValues, existingIdentifiers]);

  const selectedGridObj = useMemo(() => grids?.find(g => String(g.id) === String(selectedGridId)), [grids, selectedGridId]);

  useEffect(() => {
    if (!selectedGridObj) return;
    const currentSizes = variacoesValues.map((v:any) => v.tamanho);
    const newSizes = selectedGridObj.tamanhos.map(t => t.tamanho);
    if (JSON.stringify(currentSizes) !== JSON.stringify(newSizes)) {
        replaceVariacoes(selectedGridObj.tamanhos.map(t => ({ tamanho: t.tamanho, estoque: 0, sku: '', codigo_barras: '' })));
    }
  }, [selectedGridId, selectedGridObj, replaceVariacoes, variacoesValues]); 

  useEffect(() => {
    if (selectedSubcategoryId && allSubcategories) {
      const sub = allSubcategories.find(s => String(s.id) === String(selectedSubcategoryId));
      const shouldFill = (!isEditMode && !isDuplicateMode) || !watch('ncm');
      if (sub && shouldFill) {
        setValue('ncm', sub.ncm);
        setValue('cfop_padrao', sub.cfop_padrao);
        setValue('cst_icms', sub.cst_icms);
        setValue('origem', sub.origem);
        setValue('unidade_medida', sub.unidade_medida);
      }
    }
  }, [selectedSubcategoryId, allSubcategories, setValue, isEditMode, isDuplicateMode, watch]);

  const gradeAtacadoObj = useMemo(() => grids?.find(g => String(g.id) === String(selectedGradeAtacadoId)), [grids, selectedGradeAtacadoId]);

  useEffect(() => {
    if (gradeAtacadoObj) {
        const currentSizes = composicaoAtacadoValues.map((v:any) => v.tamanho);
        const newSizes = gradeAtacadoObj.tamanhos.map(t => t.tamanho);
        if (JSON.stringify(currentSizes) !== JSON.stringify(newSizes)) {
            replaceComposicao(gradeAtacadoObj.tamanhos.map(t => ({ tamanho: t.tamanho, quantidade: 1 })));
        }
    }
  }, [selectedGradeAtacadoId, gradeAtacadoObj, replaceComposicao, composicaoAtacadoValues]);

  const totalPecasPacote = composicaoAtacadoValues?.reduce((acc: number, curr: any) => acc + (Number(curr?.quantidade) || 0), 0) || 0;
  const valorTotalPacote = useMemo(() => (usarPrecoUnico ? Number(precoAtacadoGeral) : Number(precoAtacadoGrade)) * totalPecasPacote, [totalPecasPacote, precoAtacadoGeral, precoAtacadoGrade, usarPrecoUnico]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: Function, setPreview: Function, maxSizeMB: number, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) return toast.error(`Arquivo muito grande. Máximo ${maxSizeMB}MB.`);
    if (!file.type.startsWith(`${type}/`)) return toast.error(`Apenas arquivos do tipo ${type} são permitidos.`);
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (galleryPreviews.length + files.length > 5) return toast.error("Limite máximo de 5 imagens na galeria.");
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { toast.error(`Imagem ${file.name} ignorada (> 5MB)`); return false; }
      return true;
    });
    setGalleryFiles(prev => [...prev, ...validFiles]);
    setGalleryPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
  };

  const removeGalleryImage = (index: number) => {
    const itemToRemove = galleryPreviews[index];
    const isOldImage = existingGallery.includes(itemToRemove);
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    if (!isOldImage) {
        const numExisting = galleryPreviews.filter(p => existingGallery.includes(p)).length;
        if (index >= numExisting) {
            setGalleryFiles(prev => prev.filter((_, i) => i !== (index - numExisting)));
        }
    }
  };

  const handleApplyBulkStock = () => {
    const qty = Number(bulkStockQty);
    if (isNaN(qty) || bulkStockQty === '') return;

    const currentVariations = watch('variacoes');
    const updatedVariations = currentVariations.map((v: any) => ({
        ...v,
        estoque: qty
    }));
    setValue('variacoes', updatedVariations);
    setBulkStockQty('');
  };

  const onSubmit = (data: any) => {
    if (!data.grade_id) return toast.error('Grade do Produto é obrigatória');
    if (data.variacoes?.some((v: any) => !v.sku && !v.codigo_barras)) return toast.error('Toda variação precisa de SKU ou Cód. Barras.');
    if (duplicateCheck.allDuplicateSkus.length > 0 || duplicateCheck.allDuplicateEans.length > 0) {
        return toast.error('SKU ou Cód. de Barras já existe.', {
            description: 'Verifique os campos em vermelho. Eles já estão em uso por outro produto ou duplicados neste formulário.'
        });
    }

    const payload = { ...data, id: isEditMode ? Number(id) : undefined, imagem_principal_file: mainImageFile, imagens_galeria_files: galleryFiles, video_file: videoFile };
    isEditMode ? updateProduct(payload) : createProduct(payload);
  };
  
  const isSaving = isCreating || isUpdating;

  if ((isEditMode || isDuplicateMode) && isLoadingData) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-emerald-500" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8 pb-24 md:pb-20">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Button type="button" variant="outline" size="icon" onClick={() => navigate('/produtos')} className="bg-white/5 border-white/10 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{isEditMode ? 'Editar Produto' : isDuplicateMode ? 'Duplicar Produto' : 'Novo Produto'}</h1>
            <p className="text-muted-foreground text-sm hidden md:block">{isEditMode ? 'Alterar dados, preços e estoque.' : 'Cadastro completo.'}</p>
          </div>
        </div>
        <Button size={isMobile ? 'default' : 'lg'} type="submit" disabled={isSaving || isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          {isEditMode ? 'Salvar' : 'Salvar'}
        </Button>
      </div>

      {isDuplicateMode && <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-200"><AlertTriangle className="h-4 w-4" /><AlertTitle>Modo de Duplicação</AlertTitle><AlertDescription>Estoque, SKU e imagens foram zerados.</AlertDescription></Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6 md:space-y-8">
          {/* SEÇÃO 1: GRADE E VARIAÇÕES */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="pb-4 border-b border-white/10"><CardTitle className="flex items-center gap-2 text-emerald-400"><GridIcon className="h-5 w-5" /> 1. Grade de Estoque</CardTitle></CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div>
                    <Label className="text-base font-semibold">Grade do Produto *</Label>
                    <Select onValueChange={(v) => setValue('grade_id', v)} value={watch('grade_id')}>
                        <SelectTrigger className="mt-2 bg-black/40 border-emerald-500/30 h-14 text-lg focus:ring-emerald-500/30"><SelectValue placeholder="Escolha uma grade..." /></SelectTrigger>
                        <SelectContent>{grids?.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>)}</SelectContent>
                    </Select>
                </div>

                {selectedGridId && variacaoFields.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-black/20 border border-white/10">
                            <Input 
                                type="number"
                                placeholder="Estoque p/ todos"
                                className="bg-transparent border-none h-8"
                                value={bulkStockQty}
                                onChange={(e) => setBulkStockQty(e.target.value)}
                            />
                            <Button type="button" size="sm" onClick={handleApplyBulkStock} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">
                                Aplicar
                            </Button>
                        </div>

                        {isMobile ? (
                          <div className="space-y-4">
                            {variacaoFields.map((field: any, index) => {
                                const currentVariation = variacoesValues?.[index];
                                return <MobileVariationCard key={field.id} field={field} currentVariation={currentVariation} index={index} register={register} duplicateCheck={duplicateCheck} />
                            })}
                          </div>
                        ) : (
                          <div id="variations-table" className="rounded-xl border border-white/10 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-black/40"><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="w-[100px] text-emerald-400 font-bold">Tamanho</TableHead><TableHead className="w-[150px]">Estoque</TableHead><TableHead>SKU</TableHead><TableHead>Cód. Barras</TableHead></TableRow></TableHeader>
                                <TableBody className="bg-black/20">
                                    {variacaoFields.map((field: any, index) => {
                                        const currentVariation = variacoesValues?.[index];
                                        const currentSku = currentVariation?.sku;
                                        const currentEan = currentVariation?.codigo_barras;
                                        const isSkuDuplicate = currentSku && duplicateCheck.allDuplicateSkus.includes(currentSku);
                                        const isEanDuplicate = currentEan && duplicateCheck.allDuplicateEans.includes(currentEan);
                                        return (
                                            <TableRow key={field.id} className="border-white/10 hover:bg-white/5">
                                                <TableCell><Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-3 py-1">{field.tamanho}</Badge></TableCell>
                                                <TableCell><Input type="number" {...register(`variacoes.${index}.estoque`)} className="bg-black/40 border-white/10" /></TableCell>
                                                <TableCell><Input {...register(`variacoes.${index}.sku`)} className={`uppercase ${isSkuDuplicate ? 'border-red-500' : 'bg-black/40 border-white/10'}`} /></TableCell>
                                                <TableCell><Input {...register(`variacoes.${index}.codigo_barras`)} className={`${isEanDuplicate ? 'border-red-500' : 'bg-black/40 border-white/10'}`} /></TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                          </div>
                        )}
                    </div>
                )}
            </CardContent>
          </Card>

          {/* IDENTIFICAÇÃO & CLASSIFICAÇÃO */}
          <Card className="bg-black/20 border-white/10 shadow-lg">
            <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2 text-white"><Tag className="h-4 w-4 text-emerald-500" /> 2. Identificação</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="grid gap-2">
                    <Label htmlFor="nome">Nome do Produto *</Label>
                    <Input id="nome" {...register('nome', { required: true })} className="bg-black/40 border-white/10 h-14 text-base" placeholder="Ex: Calça Jeans" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <Label>Subcategoria *</Label>
                        <Select onValueChange={(value) => setValue('subcategoria_id', value)} value={watch('subcategoria_id')}>
                            <SelectTrigger className="bg-black/40 border-white/10 h-14 text-base"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{allSubcategories?.map(sub => (<SelectItem key={sub.id} value={String(sub.id)}>{sub.nome}</SelectItem>))}</SelectContent>
                        </Select>
                     </div>
                     <div className="grid gap-2">
                        <Label>Marca *</Label>
                        <Select onValueChange={(value) => setValue('marca_id', value)} value={watch('marca_id')}>
                            <SelectTrigger className="bg-black/40 border-white/10 h-14 text-base"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{brands?.map(brand => <SelectItem key={brand.id} value={String(brand.id)}>{brand.nome}</SelectItem>)}</SelectContent>
                        </Select>
                     </div>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* FINANCEIRO & ATACADO */}
          <Card className="bg-black/20 border-white/10 shadow-lg">
            <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2 text-white"><DollarSign className="h-4 w-4 text-emerald-500" /> 3. Financeiro</CardTitle></CardHeader>
            <CardContent className="pt-4 space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="grid gap-2"><Label>Custo (R$)</Label><Input type="number" step="0.01" {...register('preco_custo')} className="bg-black/40 border-white/10 h-14 text-base" /></div>
                    <div className="grid gap-2"><Label>Varejo (R$)</Label><Input type="number" step="0.01" {...register('preco_varejo')} className="bg-black/40 border-emerald-500/30 text-emerald-400 font-bold h-14 text-base" /></div>
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between"><Label htmlFor="usar_preco_atacado_unico" className="cursor-pointer">Preço Único Atacado</Label><Switch id="usar_preco_atacado_unico" checked={usarPrecoUnico} onCheckedChange={(c) => setValue('usar_preco_atacado_unico', c)} /></div>
                <div className={`p-4 rounded-xl border transition-all ${habilitaAtacadoGeral ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div><Label className="font-medium">Atacado Geral</Label><p className="text-xs text-muted-foreground">Min: {globalAtacadoMin} pçs</p></div>
                        <Switch checked={habilitaAtacadoGeral} onCheckedChange={(c) => setValue('habilita_atacado_geral', c)} />
                    </div>
                    {(habilitaAtacadoGeral || usarPrecoUnico) && <Input type="number" step="0.01" {...register('preco_atacado_geral')} className="mt-2 bg-black/40 border-white/10 h-14 text-base" placeholder="R$ 0,00" />}
                </div>
                <div className={`p-4 rounded-xl border transition-all ${habilitaAtacadoGrade ? 'bg-purple-500/5 border-purple-500/20' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div><Label className="font-medium">Pacote Fechado</Label><p className="text-xs text-muted-foreground">Kit c/ grade definida</p></div>
                        <Switch checked={habilitaAtacadoGrade} onCheckedChange={(c) => setValue('habilita_atacado_grade', c)} />
                    </div>
                    {habilitaAtacadoGrade && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="grid gap-2"><Label className="text-xs text-purple-300">Grade do Pacote</Label><Select onValueChange={(v) => setValue('grade_atacado_id', v)} value={watch('grade_atacado_id')}><SelectTrigger className="bg-black/40 border-white/10 h-12"><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{grids?.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>)}</SelectContent></Select></div>
                            {composicaoFields.length > 0 && <div className="border border-white/10 rounded-lg overflow-hidden"><Table><TableHeader className="bg-purple-500/10"><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="h-8 text-xs text-purple-300">Tam</TableHead><TableHead className="h-8 text-xs text-right text-purple-300">Qtd</TableHead></TableRow></TableHeader><TableBody className="bg-black/20">{composicaoFields.map((field: any, idx) => (<TableRow key={field.id} className="border-white/5 hover:bg-transparent"><TableCell className="py-2 font-medium">{field.tamanho}<input type="hidden" {...register(`composicao_atacado.${idx}.tamanho`)} /></TableCell><TableCell className="py-2 text-right"><Input type="number" min="0" className="h-7 w-20 ml-auto bg-black/40 border-white/10 text-right" {...register(`composicao_atacado.${idx}.quantidade`, { valueAsNumber: true })} /></TableCell></TableRow>))}</TableBody></Table></div>}
                            {!usarPrecoUnico && <div className="grid gap-2"><Label className="text-xs">Preço Unit. Pacote</Label><Input type="number" step="0.01" {...register('preco_atacado_grade')} className="bg-black/40 border-white/10 h-12" placeholder="R$ 0,00" /></div>}
                            {gradeAtacadoObj && <div className="bg-black/40 rounded border border-white/10 p-3 text-sm space-y-1 mt-2"><div className="flex justify-between"><span className="text-muted-foreground">Total:</span><span className="font-bold">{totalPecasPacote} un</span></div><div className="border-t border-white/10 my-1 pt-1 flex justify-between font-bold"><span>Total Pacote:</span><span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalPacote)}</span></div></div>}
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>

          {/* MÍDIA E ARQUIVOS */}
          <Card className="bg-black/20 border-white/10 shadow-lg">
            <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2 text-white"><Box className="h-4 w-4 text-emerald-500" /> 4. Mídia e Arquivos</CardTitle></CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-emerald-400" /> Imagem Principal</Label>
                <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-white/5 ${mainImagePreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'}`} onClick={() => mainImageInputRef.current?.click()}>
                    <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setMainImageFile, setMainImagePreview, 5, 'image')} />
                    {mainImagePreview ? <div className="relative group w-full h-48"><img src={mainImagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" /><div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"><span className="text-white font-medium flex items-center"><Upload className="mr-2 h-4 w-4" /> Trocar</span></div></div> : <div className="text-center py-6 text-muted-foreground"><Upload className="mx-auto h-8 w-8 mb-2 opacity-50" /><p className="text-sm">Clique para enviar</p><p className="text-[10px] opacity-70">Max 5MB</p></div>}
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-3">
                <div className="flex justify-between items-center"><Label className="flex items-center gap-2"><GridIcon className="h-4 w-4 text-emerald-400" /> Galeria (Até 5)</Label><span className="text-xs text-muted-foreground">{galleryPreviews.length}/5</span></div>
                <div className="grid grid-cols-3 gap-2">
                    {galleryPreviews.map((preview, idx) => <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group"><img src={preview} alt={`Galeria ${idx}`} className="w-full h-full object-cover" /><Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeGalleryImage(idx)}><X className="h-3 w-3" /></Button></div>)}
                    {galleryPreviews.length < 5 && <div className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5" onClick={() => galleryInputRef.current?.click()}><input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryChange} /><Upload className="h-6 w-6 text-muted-foreground mb-1" /><span className="text-[10px] text-muted-foreground">Adicionar</span></div>}
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="space-y-3">
                <Label className="flex items-center gap-2"><Video className="h-4 w-4 text-emerald-400" /> Vídeo do Produto</Label>
                <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-white/5 ${videoPreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'}`} onClick={() => videoInputRef.current?.click()}>
                    <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, setVideoFile, setVideoPreview, 50, 'video')} />
                    {videoPreview ? (
                        <div className="relative group w-full aspect-video">
                            <video src={videoPreview} className="w-full h-full object-contain rounded-lg" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                <span className="text-white font-medium flex items-center"><Upload className="mr-2 h-4 w-4" /> Trocar Vídeo</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            <Upload className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">Clique para enviar</p>
                            <p className="text-[10px] opacity-70">Max 50MB</p>
                        </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <input type="hidden" {...register('ncm')} />
      <input type="hidden" {...register('cfop_padrao')} />
    </form>
  );
}