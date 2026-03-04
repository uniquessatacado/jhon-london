import { useEffect, useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { useCategories, useAllSubcategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { useGrids } from '@/hooks/use-grids';
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-create-product';
import { useProductDetails } from '@/hooks/use-product-details';
import { useProducts } from '@/hooks/use-products';
import { api, mediaBaseUrl } from '@/lib/api';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMediaQuery } from '@/hooks/use-media-query';

// Subcomponentes importados da estrutura modular
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

  const { watch, setValue, reset, handleSubmit, register, formState: { isSubmitting } } = methods;
  
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

  // Estados de mídia
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Efeitos e Buscas
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

  const variacoesValues = watch('variacoes') || [];
  const selectedSubcategoryId = watch('subcategoria_id');
  const selectedGridId = watch('grade_id');
  const usarPrecoUnico = watch('usar_preco_atacado_unico');
  const precoAtacadoGeral = watch('preco_atacado_geral');

  const duplicateCheck = useMemo(() => {
    const skusInForm = variacoesValues.map((v: any) => v.sku?.trim()).filter(Boolean);
    const eansInForm = variacoesValues.map((v: any) => v.codigo_barras?.trim()).filter(Boolean);
    const duplicateSkusInForm = skusInForm.filter((item: string, index: number) => skusInForm.indexOf(item) !== index);
    const duplicateEansInForm = eansInForm.filter((item: string, index: number) => eansInForm.indexOf(item) !== index);
    const conflictingSkus = skusInForm.filter(sku => existingIdentifiers.skus.includes(sku));
    const conflictingEans = eansInForm.filter(ean => existingIdentifiers.eans.includes(ean));
    return {
      allDuplicateSkus: [...new Set([...duplicateSkusInForm, ...conflictingSkus])],
      allDuplicateEans: [...new Set([...duplicateEansInForm, ...conflictingEans])]
    };
  }, [variacoesValues, existingIdentifiers]);

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

  useEffect(() => {
    if (usarPrecoUnico) {
      setValue('preco_atacado_grade', precoAtacadoGeral);
    }
  }, [usarPrecoUnico, precoAtacadoGeral, setValue]);

  const onSubmit = (data: any) => {
    if (!data.nome || !data.grade_id || !data.subcategoria_id || !data.marca_id) return toast.error('Preencha todos os campos obrigatórios da Identificação.');
    if (!data.variacoes || data.variacoes.length === 0) return toast.error('Adicione pelo menos uma variação na grade.');
    if (data.variacoes?.some((v: any) => !v.sku && !v.codigo_barras)) return toast.error('Toda variação precisa de SKU ou Cód. Barras.');
    if (duplicateCheck.allDuplicateSkus.length > 0 || duplicateCheck.allDuplicateEans.length > 0) return toast.error('SKU ou Cód. de Barras duplicado.');

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

  if ((isEditMode || isDuplicateMode) && isLoadingData) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-emerald-500" /></div>;

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
          <Button size={isMobile ? 'default' : 'lg'} type="submit" disabled={isSaving || isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} {isEditMode ? 'Salvar' : 'Salvar'}
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
          
          {selectedGridId && (
            <VariationsSection 
              isEditMode={isEditMode} 
              duplicateCheck={duplicateCheck} 
            />
          )}

          <FinancialSection 
            grids={grids} 
            globalAtacadoMin={globalAtacadoMin} 
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
          
          <input type="hidden" {...register('ncm')} />
          <input type="hidden" {...register('cfop_padrao')} />
        </div>
      </form>
    </FormProvider>
  );
}