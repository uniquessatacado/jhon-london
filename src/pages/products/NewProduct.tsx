import { useEffect, useState, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { useCategories, useAllSubcategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { useGrids } from '@/hooks/use-grids';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-create-product';
import { useProductDetails } from '@/hooks/use-product-details';
import { api, mediaBaseUrl } from '@/lib/api';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMediaQuery } from '@/hooks/use-media-query';

import { IdentificationSection } from '@/components/products/form/IdentificationSection';
import { VariationsSection } from '@/components/products/form/VariationsSection';
import { FinancialSection } from '@/components/products/form/FinancialSection';
import { MediaSection } from '@/components/products/form/MediaSection';
import { FiscalSection } from '@/components/products/form/FiscalSection';

export function NewProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicate_id');
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isEditMode = !!id;
  const isDuplicateMode = !!duplicateId;
  const fetchId = id || duplicateId;
  
  const methods = useForm<any>({
    mode: 'onChange', 
    defaultValues: {
      variacoes: [],
      composicao_atacado: [], 
      habilita_atacado_geral: false,
      habilita_atacado_grade: false,
      preco_custo: 0,
      preco_varejo: 0,
      preco_atacado_geral: 0,
      preco_atacado_grade: 0,
      categoria_id: '',
      subcategoria_id: '',
      marca_id: '',
      grade_id: '',
      grade_atacado_id: ''
    }
  });

  const { watch, setValue, reset, handleSubmit, getValues, formState: { isSubmitting, errors } } = methods;
  
  const { data: categories, isLoading: isLoadingCats } = useCategories();
  const { data: brands, isLoading: isLoadingBrands } = useBrands();
  const { data: grids, isLoading: isLoadingGrids } = useGrids();
  const { data: allSubcategories, isLoading: isLoadingSubs } = useAllSubcategories();
  
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { data: productData, isLoading: isLoadingData } = useProductDetails(fetchId || undefined);

  const [globalAtacadoMin, setGlobalAtacadoMin] = useState('10');
  const hasInitialized = useRef(false);

  // Estados de mídia
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  useEffect(() => {
    api.get('/configuracoes/qtd_minima_atacado_geral')
      .then(res => setGlobalAtacadoMin(res.data?.valor || '10'))
      .catch(() => console.error("Failed to fetch global wholesale minimum quantity."));
  }, []);

  // CARREGAMENTO SEGURO DA EDIÇÃO: Aguarda TODAS as dependências
  useEffect(() => {
    if (!productData || isLoadingCats || isLoadingSubs || isLoadingBrands || isLoadingGrids || hasInitialized.current) {
      return;
    }

    let categoryId = productData.categoria_id?.toString() || '';
    const subcategoryId = productData.subcategoria_id?.toString() || '';
    const brandId = productData.marca_id?.toString() || '';
    const gridId = productData.grade_id?.toString() || '';
    const gradeAtacadoId = productData.grade_atacado_id?.toString() || '';

    if (!categoryId && subcategoryId) {
      const sub = allSubcategories?.find(s => String(s.id) === subcategoryId);
      if (sub) categoryId = String(sub.categoria_id);
    }

    const variacoesComDimensoes = productData.variacoes?.map(v => {
      const dim = productData.dimensoes_grade?.find(d => d.tamanho === v.tamanho);
      return {
        ...v,
        id: v.id,
        estoque: isDuplicateMode ? 0 : v.estoque,
        sku: isDuplicateMode ? '' : v.sku,
        codigo_barras: isDuplicateMode ? '' : v.codigo_barras,
        peso_kg: dim?.peso_kg || 0,
        altura_cm: dim?.altura_cm || 0,
        largura_cm: dim?.largura_cm || 0,
        comprimento_cm: dim?.comprimento_cm || 0,
      };
    }) || [];

    // Preencher os dados de uma única vez com reset
    reset({
      nome: isDuplicateMode ? `${productData.nome} - Cópia` : productData.nome,
      categoria_id: categoryId,
      subcategoria_id: subcategoryId,
      marca_id: brandId,
      grade_id: gridId,
      grade_atacado_id: gradeAtacadoId,
      ncm: productData.ncm,
      cfop_padrao: productData.cfop_padrao,
      cst_icms: productData.cst_icms,
      origem: productData.origem,
      unidade_medida: productData.unidade_medida,
      preco_custo: Number(productData.preco_custo) || 0,
      preco_varejo: Number(productData.preco_varejo) || 0,
      habilita_atacado_geral: !!productData.habilita_atacado_geral,
      preco_atacado_geral: Number(productData.preco_atacado_geral) || 0,
      habilita_atacado_grade: !!productData.habilita_atacado_grade,
      preco_atacado_grade: Number(productData.preco_atacado_grade) || 0,
      variacoes: variacoesComDimensoes,
      composicao_atacado: typeof productData.composicao_atacado_grade === 'string'
        ? JSON.parse(productData.composicao_atacado_grade || "[]")
        : (productData.composicao_atacado_grade || [])
    });
    
    // Imagens / Vídeo
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

    hasInitialized.current = true;
  }, [productData, isLoadingCats, isLoadingSubs, isLoadingBrands, isLoadingGrids, allSubcategories, reset, isDuplicateMode]);

  const selectedSubcategoryId = watch('subcategoria_id');

  // Autopreenchimento Inteligente (Dispara quando o usuário altera a subcategoria)
  useEffect(() => {
    if (selectedSubcategoryId && allSubcategories) {
      const selectedSub = allSubcategories.find(sub => String(sub.id) === String(selectedSubcategoryId));
      if (selectedSub) {
        setValue('categoria_id', String(selectedSub.categoria_id));
        
        // Evita reescrever a Grade na primeira abertura do Edição
        const isManualChange = hasInitialized.current && String(selectedSubcategoryId) !== String(productData?.subcategoria_id);
        
        if (!isEditMode && !isDuplicateMode || isManualChange) {
           const currentGrid = getValues('grade_id');
           if (selectedSub.grade_id && String(currentGrid) !== String(selectedSub.grade_id)) {
               setValue('grade_id', String(selectedSub.grade_id), { shouldValidate: true });
           }
           
           api.get(`/subcategorias/${selectedSubcategoryId}/fiscal`).then(response => {
             const fiscalData = response.data;
             if (fiscalData) {
               setValue('ncm', fiscalData.ncm);
               setValue('cfop_padrao', fiscalData.cfop_padrao);
               setValue('cst_icms', fiscalData.cst_icms);
               setValue('origem', fiscalData.origem);
               setValue('unidade_medida', fiscalData.unidade_medida);
             }
           }).catch(() => null);
        }
      }
    }
  }, [selectedSubcategoryId, allSubcategories, setValue, isEditMode, isDuplicateMode, getValues, productData]);

  const onSubmit = (data: any) => {
    if (!data.nome || !data.grade_id || !data.subcategoria_id || !data.marca_id) return toast.error('Preencha todos os campos obrigatórios da Identificação.');
    if (!data.variacoes || data.variacoes.length === 0) return toast.error('Adicione pelo menos uma variação na grade.');
    if (data.variacoes?.some((v: any) => !v.sku && !v.codigo_barras)) return toast.error('Toda variação precisa de SKU ou Cód. Barras.');

    const skus = data.variacoes.map((v: any) => v.sku?.trim().toUpperCase()).filter(Boolean);
    if (new Set(skus).size !== skus.length) return toast.error('Existem SKUs repetidos na grade do produto. Corrija os erros em vermelho.');

    const payload = { 
      ...data, 
      id: isEditMode ? Number(id) : undefined, 
      imagem_principal_file: mainImageFile, 
      imagens_galeria_files: galleryFiles, 
      video_file: videoFile 
    };
    
    isEditMode ? updateProduct(payload) : createProduct(payload);
  };
  
  const isSaving = isCreating || isUpdating;

  // Trava a tela enquanto o banco estiver processando as categorias
  const isPageLoading = isLoadingCats || isLoadingBrands || isLoadingGrids || isLoadingSubs || ((isEditMode || isDuplicateMode) && isLoadingData);
  if (isPageLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-emerald-500" /></div>;

  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <FormProvider {...methods}>
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
          <Button 
            size={isMobile ? 'default' : 'lg'} 
            type="submit" 
            disabled={isSaving || isSubmitting || hasValidationErrors} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} {isEditMode ? 'Salvar Alterações' : 'Salvar Produto'}
          </Button>
        </div>

        {isDuplicateMode && (
          <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Modo de Duplicação</AlertTitle>
            <AlertDescription>Estoque, SKU e imagens foram zerados.</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6 md:space-y-8">
          <IdentificationSection 
            categories={categories} 
            allSubcategories={allSubcategories} 
            brands={brands} 
            grids={grids} 
          />
          
          <VariationsSection 
            isEditMode={isEditMode} 
            isDuplicateMode={isDuplicateMode}
            grids={grids}
          />

          <FinancialSection 
            grids={grids} 
            globalAtacadoMin={globalAtacadoMin} 
            isEditMode={isEditMode}
            isDuplicateMode={isDuplicateMode}
          />

          <MediaSection 
            mainImagePreview={mainImagePreview}
            setMainImagePreview={setMainImagePreview}
            setMainImageFile={setMainImageFile}
            galleryPreviews={galleryPreviews}
            setGalleryPreviews={setGalleryPreviews}
            setGalleryFiles={setGalleryFiles}
            existingGallery={existingGallery}
            videoPreview={videoPreview}
            setVideoPreview={setVideoPreview}
            setVideoFile={setVideoFile}
          />

          <FiscalSection />
          
          <input type="hidden" {...methods.register('ncm')} />
          <input type="hidden" {...methods.register('cfop_padrao')} />
        </div>
      </form>
    </FormProvider>
  );
}