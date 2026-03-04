import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  Check, ArrowLeft, DollarSign, Box, Grid as GridIcon, Tag, Ruler, AlertTriangle, Image as ImageIcon, Video, Trash2, Loader2, FileText, Upload, X
} from 'lucide-react';
import { useCategories, useAllSubcategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { useGrids } from '@/hooks/use-grids';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-create-product';
import { useProductDetails } from '@/hooks/use-product-details';
import { useProducts } from '@/hooks/use-products';
import { api, mediaBaseUrl } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMediaQuery } from '@/hooks/use-media-query';
import { compressImage } from '@/lib/utils';

// Componente para a lista de variações no mobile
const MobileVariationCard = ({ field, currentVariation, index, register, duplicateCheck, onEditDimensions, isEditMode }: any) => {
  const currentEan = currentVariation?.codigo_barras;
  const currentSku = currentVariation?.sku;
  const isMissingBoth = !currentEan && !currentSku;
  const isSkuDuplicate = currentSku && duplicateCheck.allDuplicateSkus.includes(currentSku);
  const isEanDuplicate = currentEan && duplicateCheck.allDuplicateEans.includes(currentEan);

  const skuBorder = isMissingBoth ? "border-red-500/50 bg-red-500/5" : isSkuDuplicate ? "border-red-500 text-red-200" : "bg-black/40 border-white/10";
  const eanBorder = isMissingBoth ? "border-red-500/50 bg-red-500/5" : isEanDuplicate ? "border-red-500 text-red-200" : "bg-black/40 border-white/10";

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
        <Input {...register(`variacoes.${index}.sku`)} className={`${skuBorder} uppercase h-12`} placeholder={currentEan ? "Opcional" : "Obrigatório"} />
        {isSkuDuplicate && <p className="text-xs text-red-400">SKU já existe</p>}
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Cód. Barras</Label>
        <Input {...register(`variacoes.${index}.codigo_barras`)} className={`${eanBorder} h-12`} placeholder="EAN-13" />
        {isEanDuplicate && <p className="text-xs text-red-400">Cód. Barras já existe</p>}
      </div>
      <Button type="button" variant="outline" className={`w-full h-12 ${hasDimensions ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-white/10'}`} onClick={() => onEditDimensions(index)}>
        <Ruler className="mr-2 h-4 w-4" /> {hasDimensions ? 'Editar Dimensões' : 'Adicionar Dimensões'}
      </Button>
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
      preco_atacado_grade: 0,
      categoria_id: '',
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
  const [editingDimensionsIndex, setEditingDimensionsIndex] = useState<number | null>(null);

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
      .catch(() => console.error("Failed to fetch global wholesale minimum quantity."));
  }, []);

  useEffect(() => {
    if (allProducts) {
        const skus: string[] = [];
        const eans: string[] = [];
        const productsToScan = isEditMode ? allProducts.filter(p => String(p.id) !== id) : allProducts;
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
    if (productData && allSubcategories && brands && grids) {
        let categoryId = productData.categoria_id;
        if (!categoryId && productData.subcategoria_id) {
            const sub = allSubcategories.find(s => s.id === productData.subcategoria_id);
            if (sub) categoryId = sub.categoria_id;
        }

        const variacoesComDimensoes = productData.variacoes?.map(v => {
            const dim = productData.dimensoes_grade?.find(d => d.tamanho === v.tamanho);
            return {
                ...v,
                estoque: isDuplicateMode ? 0 : v.estoque,
                sku: isDuplicateMode ? '' : v.sku,
                codigo_barras: isDuplicateMode ? '' : v.codigo_barras,
                peso_kg: dim?.peso_kg || 0,
                altura_cm: dim?.altura_cm || 0,
                largura_cm: dim?.largura_cm || 0,
                comprimento_cm: dim?.comprimento_cm || 0,
            };
        }) || [];

        const formData = {
            nome: isDuplicateMode ? `${productData.nome} - Cópia` : productData.nome,
            grade_id: String(productData.grade_id || ''),
            categoria_id: String(categoryId || ''),
            subcategoria_id: String(productData.subcategoria_id || ''),
            marca_id: String(productData.marca_id || ''),
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
            grade_atacado_id: String(productData.grade_atacado_id || ''),
            preco_atacado_grade: productData.preco_atacado_grade,
            variacoes: variacoesComDimensoes,
            composicao_atacado: typeof productData.composicao_atacado_grade === 'string' 
                ? JSON.parse(productData.composicao_atacado_grade || "[]") 
                : (productData.composicao_atacado_grade || [])
        };
        reset(formData);
        if (!isDuplicateMode) {
            if (productData.imagem_principal) setMainImagePreview(productData.imagem_principal.startsWith('http') ? productData.imagem_principal : `${mediaBaseUrl}${productData.imagem_principal}`);
            if (productData.imagens_galeria?.length) {
                const fullUrls = productData.imagens_galeria.map(img => img.startsWith('http') ? img : `${mediaBaseUrl}${img}`);
                setGalleryPreviews(fullUrls);
                setExistingGallery(fullUrls);
            }
            const videoSrc = productData.video_url || productData.video;
            if (videoSrc) {
                setVideoPreview(videoSrc.startsWith('http') ? videoSrc : `${mediaBaseUrl}${videoSrc}`);
            }
        }
    }
  }, [productData, reset, isDuplicateMode, allSubcategories, brands, grids]);
  
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
    if (!selectedGridObj || isEditMode || isDuplicateMode) return;
    const currentSizes = variacaoFields.map((v:any) => v.tamanho);
    const newSizes = selectedGridObj.tamanhos.map(t => t.tamanho);
    if (JSON.stringify(currentSizes) !== JSON.stringify(newSizes)) {
        const newVariations = selectedGridObj.tamanhos.map(t => ({ 
            tamanho: t.tamanho, estoque: 0, sku: '', codigo_barras: '', peso_kg: t.peso_kg || 0, altura_cm: t.altura_cm || 0, largura_cm: t.largura_cm || 0, comprimento_cm: t.comprimento_cm || 0,
        }));
        replaceVariacoes(newVariations);
    }
  }, [selectedGridObj, replaceVariacoes, variacaoFields, isEditMode, isDuplicateMode]);

  useEffect(() => {
    if (selectedSubcategoryId && allSubcategories) {
      const selectedSub = allSubcategories.find(sub => String(sub.id) === String(selectedSubcategoryId));
      if (selectedSub) setValue('categoria_id', String(selectedSub.categoria_id));
    }
  }, [selectedSubcategoryId, allSubcategories, setValue]);

  useEffect(() => {
    const shouldFill = (!isEditMode && !isDuplicateMode) || !watch('ncm');
    if (selectedSubcategoryId && shouldFill) {
      api.get(`/subcategorias/${selectedSubcategoryId}/fiscal`).then(response => {
        const fiscalData = response.data;
        if (fiscalData) {
          setValue('ncm', fiscalData.ncm);
          setValue('cfop_padrao', fiscalData.cfop_padrao);
          setValue('cst_icms', fiscalData.cst_icms);
          setValue('origem', fiscalData.origem);
          setValue('unidade_medida', fiscalData.unidade_medida);
        }
      }).catch(err => console.error(err));
    }
  }, [selectedSubcategoryId, setValue, isEditMode, isDuplicateMode, watch]);

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

  // Sincroniza o valor de atacado grade se o toggle "usar preço único" estiver ativo
  useEffect(() => {
    if (usarPrecoUnico) {
      setValue('preco_atacado_grade', precoAtacadoGeral);
    }
  }, [usarPrecoUnico, precoAtacadoGeral, setValue]);

  // CÁLCULO INDEPENDENTE DO PACOTE FECHADO
  const totalPecasPacote = composicaoAtacadoValues?.reduce((acc: number, curr: any) => acc + (Number(curr?.quantidade) || 0), 0) || 0;
  
  // Agora usamos sempre o precoAtacadoGrade, que já vai estar com o valor certo (seja digitado manual ou sincronizado)
  const valorTotalPacote = Number(precoAtacadoGrade) * totalPecasPacote;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setFile: Function, setPreview: Function, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'image') {
        try {
            const compressedFile = await compressImage(file, 2, 1200);
            setFile(compressedFile);
            setPreview(URL.createObjectURL(compressedFile));
        } catch (error) { toast.error("Falha ao comprimir imagem."); }
    } else {
        if (file.size > 50 * 1024 * 1024) return toast.error(`Vídeo muito grande. Máximo 50MB.`);
        setFile(file);
        setPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (galleryPreviews.length + files.length > 5) return toast.error("Limite máximo de 5 imagens na galeria.");
    const compressionPromises = files.map(file => file.size > 2 * 1024 * 1024 ? compressImage(file, 2, 1200) : Promise.resolve(file));
    try {
        const compressedFiles = await Promise.all(compressionPromises);
        setGalleryFiles(prev => [...prev, ...compressedFiles]);
        setGalleryPreviews(prev => [...prev, ...compressedFiles.map(f => URL.createObjectURL(f))]);
    } catch (error) { toast.error("Erro ao processar imagens da galeria."); }
  };

  const removeGalleryImage = (index: number) => {
    const itemToRemove = galleryPreviews[index];
    const isOldImage = existingGallery.includes(itemToRemove);
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    if (!isOldImage) {
        const numExisting = galleryPreviews.filter(p => existingGallery.includes(p)).length;
        if (index >= numExisting) setGalleryFiles(prev => prev.filter((_, i) => i !== (index - numExisting)));
    }
  };

  const handleApplyBulkStock = () => {
    const qty = Number(bulkStockQty);
    if (isNaN(qty) || bulkStockQty === '') return;
    setValue('variacoes', watch('variacoes').map((v: any) => ({ ...v, estoque: qty })));
    setBulkStockQty('');
  };

  const onSubmit = (data: any) => {
    if (!data.nome || !data.grade_id || !data.subcategoria_id || !data.marca_id) return toast.error('Preencha todos os campos obrigatórios da Identificação.');
    if (!data.variacoes || data.variacoes.length === 0) return toast.error('Adicione pelo menos uma variação na grade.');
    if (data.variacoes?.some((v: any) => !v.sku && !v.codigo_barras)) return toast.error('Toda variação precisa de SKU ou Cód. Barras.');
    if (duplicateCheck.allDuplicateSkus.length > 0 || duplicateCheck.allDuplicateEans.length > 0) return toast.error('SKU ou Cód. de Barras duplicado.');

    const payload = { ...data, id: isEditMode ? Number(id) : undefined, imagem_principal_file: mainImageFile, imagens_galeria_files: galleryFiles, video_file: videoFile };
    isEditMode ? updateProduct(payload) : createProduct(payload);
  };
  
  const isSaving = isCreating || isUpdating;

  if ((isEditMode || isDuplicateMode) && isLoadingData) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-emerald-500" /></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8 pb-24 md:pb-20">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Button type="button" variant="outline" size="icon" onClick={() => navigate('/produtos')} className="bg-white/5 border-white/10 hover:bg-white/10"><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{isEditMode ? 'Editar Produto' : isDuplicateMode ? 'Duplicar Produto' : 'Novo Produto'}</h1>
            <p className="text-muted-foreground text-sm hidden md:block">{isEditMode ? 'Alterar dados, preços e estoque.' : 'Cadastro completo.'}</p>
          </div>
        </div>
        <Button size={isMobile ? 'default' : 'lg'} type="submit" disabled={isSaving || isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} {isEditMode ? 'Salvar' : 'Salvar'}
        </Button>
      </div>

      {isDuplicateMode && <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-200"><AlertTriangle className="h-4 w-4" /><AlertTitle>Modo de Duplicação</AlertTitle><AlertDescription>Estoque, SKU e imagens foram zerados.</AlertDescription></Alert>}

      <div className="space-y-6 md:space-y-8">
        {/* SEÇÃO 1: IDENTIFICAÇÃO */}
        <Card className="bg-black/20 border-white/10 shadow-lg">
          <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2 text-white"><Tag className="h-4 w-4 text-emerald-500" /> 1. Identificação e Classificação</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-6">
              <div className="grid gap-2"><Label htmlFor="nome">Nome do Produto *</Label><Input id="nome" {...register('nome', { required: true })} className={`bg-black/40 h-14 text-base ${errors.nome ? 'border-red-500' : 'border-white/10'}`} placeholder="Ex: Camiseta Básica Gola V" /></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div className="grid gap-2"><Label>Categoria *</Label><Select value={watch('categoria_id')} disabled><SelectTrigger className="bg-black/40 h-14 text-base border-white/10 disabled:opacity-70"><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{categories?.map(cat => (<SelectItem key={cat.id} value={String(cat.id)}>{cat.nome}</SelectItem>))}</SelectContent></Select></div>
                   <div className="grid gap-2"><Label>Subcategoria *</Label><Controller name="subcategoria_id" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger className={`bg-black/40 h-14 text-base ${errors.subcategoria_id ? 'border-red-500' : 'border-white/10'}`}><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{allSubcategories?.map(sub => (<SelectItem key={sub.id} value={String(sub.id)}>{sub.nome}</SelectItem>))}</SelectContent></Select>)} /></div>
                   <div className="grid gap-2"><Label>Marca *</Label><Controller name="marca_id" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger className={`bg-black/40 h-14 text-base ${errors.marca_id ? 'border-red-500' : 'border-white/10'}`}><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{brands?.map(brand => <SelectItem key={brand.id} value={String(brand.id)}>{brand.nome}</SelectItem>)}</SelectContent></Select>)} /></div>
                   <div className="grid gap-2"><Label>Grade do Produto *</Label><Controller name="grade_id" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger className={`bg-black/40 h-14 text-base ${errors.grade_id ? 'border-red-500' : 'border-white/10'}`}><SelectValue placeholder="Escolha uma grade..." /></SelectTrigger><SelectContent>{grids?.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>)}</SelectContent></Select>)} /></div>
              </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 2: GRADE, ESTOQUE & DIMENSÕES */}
        {selectedGridId && (
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="pb-4 border-b border-white/10"><CardTitle className="flex items-center gap-2 text-emerald-400"><GridIcon className="h-5 w-5" /> 2. Grade, Estoque & Dimensões</CardTitle></CardHeader>
            <CardContent className="pt-6 space-y-6">
                {variacaoFields.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-top-4">
                        {!isEditMode && (
                            <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-black/20 border border-white/10 max-w-sm">
                                <Input type="number" placeholder="Estoque p/ todos" className="bg-transparent border-none h-8" value={bulkStockQty} onChange={(e) => setBulkStockQty(e.target.value)} />
                                <Button type="button" size="sm" onClick={handleApplyBulkStock} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">Aplicar</Button>
                            </div>
                        )}

                        {isMobile ? (
                          <div className="space-y-4">
                            {variacaoFields.map((field: any, index) => <MobileVariationCard key={field.id} field={field} currentVariation={variacoesValues?.[index]} index={index} register={register} duplicateCheck={duplicateCheck} onEditDimensions={setEditingDimensionsIndex} isEditMode={isEditMode} />)}
                          </div>
                        ) : (
                          <div id="variations-table" className="rounded-xl border border-white/10 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-black/40"><TableRow className="border-white/10 hover:bg-transparent"><TableHead className="w-[80px] text-emerald-400 font-bold">Tam.</TableHead><TableHead className="w-[100px]">Estoque</TableHead><TableHead className="min-w-[150px]">SKU</TableHead><TableHead className="min-w-[150px]">Cód. Barras</TableHead><TableHead>Peso(kg)</TableHead><TableHead>A(cm)</TableHead><TableHead>L(cm)</TableHead><TableHead>C(cm)</TableHead></TableRow></TableHeader>
                                <TableBody className="bg-black/20">
                                    {variacaoFields.map((field: any, index) => {
                                        const currentVariation = variacoesValues?.[index];
                                        const isSkuDuplicate = currentVariation?.sku && duplicateCheck.allDuplicateSkus.includes(currentVariation.sku);
                                        const isEanDuplicate = currentVariation?.codigo_barras && duplicateCheck.allDuplicateEans.includes(currentVariation.codigo_barras);
                                        return (
                                            <TableRow key={field.id} className="border-white/10 hover:bg-white/5">
                                                <TableCell><Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-3 py-1">{field.tamanho}</Badge></TableCell>
                                                <TableCell><Input type="number" {...register(`variacoes.${index}.estoque`)} disabled={isEditMode} className="bg-black/40 border-white/10 h-9 disabled:opacity-70" /></TableCell>
                                                <TableCell><Input {...register(`variacoes.${index}.sku`)} className={`uppercase h-9 ${isSkuDuplicate ? 'border-red-500' : 'bg-black/40 border-white/10'}`} /></TableCell>
                                                <TableCell><Input {...register(`variacoes.${index}.codigo_barras`)} className={`h-9 ${isEanDuplicate ? 'border-red-500' : 'bg-black/40 border-white/10'}`} /></TableCell>
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
                )}
            </CardContent>
          </Card>
        )}

        {/* SEÇÃO 3: FINANCEIRO & ATACADO */}
        <Card className="bg-black/20 border-white/10 shadow-lg">
          <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2 text-white"><DollarSign className="h-4 w-4 text-emerald-500" /> 3. Financeiro e Atacado</CardTitle></CardHeader>
          <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 max-w-2xl">
                  <div className="grid gap-2"><Label>Custo (R$)</Label><Input type="number" step="0.01" {...register('preco_custo')} className="bg-black/40 border-white/10 h-14 text-base" /></div>
                  <div className="grid gap-2"><Label>Varejo (R$)</Label><Input type="number" step="0.01" {...register('preco_varejo')} className="bg-black/40 border-emerald-500/30 text-emerald-400 font-bold h-14 text-base" /></div>
              </div>
              
              <Separator className="bg-white/10" />
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex flex-col">
                      <Label htmlFor="usar_preco_atacado_unico" className="text-base cursor-pointer">Usar mesmo preço para ambos os atacados</Label>
                      <span className="text-xs text-muted-foreground">Se ativado, utiliza o mesmo valor unitário preenchido abaixo para o Atacado Geral e o Atacado Grade.</span>
                    </div>
                    <Switch id="usar_preco_atacado_unico" checked={usarPrecoUnico} onCheckedChange={(c) => setValue('usar_preco_atacado_unico', c)} />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Geral */}
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
                              <Label>Preço Unitário {usarPrecoUnico ? '(Aplicado em Ambos)' : '(Avulso)'}</Label>
                              <Input type="number" step="0.01" {...register('preco_atacado_geral')} className="bg-black/40 border-white/10 h-12 text-lg font-bold text-emerald-400" placeholder="R$ 0,00" />
                            </div>
                            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                              <p className="text-xs text-muted-foreground"><span className="font-semibold text-white">Qtd Mínima:</span> {globalAtacadoMin} pçs</p>
                              <p className="text-[10px] text-muted-foreground mt-1">Definida nas configurações globais do sistema.</p>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Grade */}
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
                              <Label>Grade Atacado</Label>
                              <Controller
                                name="grade_atacado_id"
                                control={control}
                                render={({ field }) => (
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="bg-black/40 border-white/10 h-12"><SelectValue placeholder="Selecione a grade..." /></SelectTrigger>
                                    <SelectContent>{grids?.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>)}</SelectContent>
                                  </Select>
                                )}
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label>Preço Unitário (Grade)</Label>
                              <Input 
                                type="number" 
                                step="0.01" 
                                {...register('preco_atacado_grade')} 
                                disabled={usarPrecoUnico}
                                className={`bg-black/40 h-12 text-lg font-bold ${usarPrecoUnico ? 'border-white/10 text-purple-400/50' : 'border-purple-500/30 text-purple-400'}`} 
                                placeholder="R$ 0,00" 
                              />
                              {usarPrecoUnico && <p className="text-[10px] text-purple-300/50">Valor sincronizado com o Atacado Geral</p>}
                            </div>

                            {/* Tabela de composição (Visual e para quantificar) */}
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

        {/* SEÇÃO 4: MÍDIA E ARQUIVOS */}
        <Card className="bg-black/20 border-white/10 shadow-lg">
          <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2 text-white"><Box className="h-4 w-4 text-emerald-500" /> 4. Mídia e Arquivos</CardTitle></CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-emerald-400" /> Imagem Principal</Label>
              <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-white/5 ${mainImagePreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'}`} onClick={() => mainImageInputRef.current?.click()}>
                  <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setMainImageFile, setMainImagePreview, 'image')} />
                  {mainImagePreview ? <div className="relative group w-full h-48"><img src={mainImagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg" /><div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"><span className="text-white font-medium flex items-center"><Upload className="mr-2 h-4 w-4" /> Trocar</span></div></div> : <div className="text-center py-6 text-muted-foreground"><Upload className="mx-auto h-8 w-8 mb-2 opacity-50" /><p className="text-sm">Clique para enviar</p><p className="text-[10px] opacity-70">Max 2MB (comprimido)</p></div>}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><Label className="flex items-center gap-2"><GridIcon className="h-4 w-4 text-emerald-400" /> Galeria (Até 5)</Label><span className="text-xs text-muted-foreground">{galleryPreviews.length}/5</span></div>
              <div className="grid grid-cols-3 gap-2">
                  {galleryPreviews.map((preview, idx) => <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group"><img src={preview} alt={`Galeria ${idx}`} className="w-full h-full object-cover" /><Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeGalleryImage(idx)}><X className="h-3 w-3" /></Button></div>)}
                  {galleryPreviews.length < 5 && <div className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5" onClick={() => galleryInputRef.current?.click()}><input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryChange} /><Upload className="h-6 w-6 text-muted-foreground mb-1" /><span className="text-[10px] text-muted-foreground">Adicionar</span></div>}
              </div>
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label className="flex items-center gap-2"><Video className="h-4 w-4 text-emerald-400" /> Vídeo do Produto</Label>
              <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${videoPreview ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'}`}>
                  <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, setVideoFile, setVideoPreview, 'video')} />
                  {videoPreview ? (
                      <div className="relative group w-full aspect-video max-w-md mx-auto">
                          <video src={videoPreview} controls className="w-full h-full object-contain rounded-lg" />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                              <span className="text-white font-medium flex items-center"><Upload className="mr-2 h-4 w-4" /> Trocar Vídeo</span>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center py-6 text-muted-foreground cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                          <Upload className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">Clique para enviar</p>
                          <p className="text-[10px] opacity-70">Max 50MB</p>
                      </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 5: FISCAL */}
        <Card className="bg-black/20 border-white/10 shadow-lg">
          <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2 text-white"><FileText className="h-4 w-4 text-emerald-500" /> 5. Dados Fiscais</CardTitle></CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">Estes dados são preenchidos automaticamente pela subcategoria selecionada.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><Label className="text-xs">NCM</Label><Input readOnly value={watch('ncm') || '-'} className="bg-black/40 border-white/10 mt-1" /></div>
              <div><Label className="text-xs">CFOP</Label><Input readOnly value={watch('cfop_padrao') || '-'} className="bg-black/40 border-white/10 mt-1" /></div>
              <div><Label className="text-xs">CST/CSOSN</Label><Input readOnly value={watch('cst_icms') || '-'} className="bg-black/40 border-white/10 mt-1" /></div>
              <div><Label className="text-xs">Origem</Label><Input readOnly value={watch('origem') || '-'} className="bg-black/40 border-white/10 mt-1" /></div>
              <div><Label className="text-xs">Unidade</Label><Input readOnly value={watch('unidade_medida') || '-'} className="bg-black/40 border-white/10 mt-1" /></div>
            </div>
          </CardContent>
        </Card>
      </div>
      <input type="hidden" {...register('ncm')} />
      <input type="hidden" {...register('cfop_padrao')} />

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
    </form>
  );
}