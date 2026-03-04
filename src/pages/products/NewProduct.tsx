import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
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

// Subcomponentes
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
      tipo_atacado: 'nenhum',
      preco_atacado: 0,
      quantidade_minima_atacado: 0,
      atacado_grade: [],
      preco_custo: 0,
      preco_varejo: 0,
      categoria_id: '',
      subcategoria_id: '',
      marca_id: '',
      grade_id: ''
    }
  });

  const { watch, setValue, reset, handleSubmit, register, control, formState: { isSubmitting } } = methods;
  
  // Utilizando os hooks para controle de arrays vinculados
  const { fields: variacaoFields, replace: replaceVariacoes } = useFieldArray({ control, name: "variacoes" });
  const { replace: replaceAtacadoGrade } = useFieldArray({ control, name: "atacado_grade" });
  
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

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Evitar sobreposição de Grade durante o load inicial
  const isInitialLoadDone = useRef(false);

  useEffect(() => {
    api.get('/configuracoes/qtd_minima_atacado_geral')
      .then(res => setGlobalAtacadoMin(res.data?.valor || '10'))
      .catch(() => {});
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

  // CORREÇÃO CRÍTICA 1: Carregamento dos Selects na Edição
  // Aguardamos expressamente todos os dicionários (brands, categories, etc) carregarem 
  // ANTES de dar o reset() com os dados do produto.
  const isDataLoading = isLoadingData || !categories || !brands || !grids || !allSubcategories;

  useEffect(() => {
    if (productData && !isDataLoading && !isInitialLoadDone.current) {
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

      // Ajustando array do Atacado Grade
      let atacadoGradeArr = [];
      try {
          // Trata se o BD retorna string JSON ou Array de Objetos
          atacadoGradeArr = typeof productData.atacado_grade === 'string' 
             ? JSON.parse(productData.atacado_grade) 
             : (productData.atacado_grade || []);
             
          // Fallback para nome de campo antigo caso a API mande composicao_atacado_grade
          if (atacadoGradeArr.length === 0 && (productData as any).composicao_atacado_grade) {
             atacadoGradeArr = typeof (productData as any).composicao_atacado_grade === 'string' 
                ? JSON.parse((productData as any).composicao_atacado_grade) 
                : ((productData as any).composicao_atacado_grade);
          }
      } catch (e) {}

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
        
        // ESTRUTURA ATUALIZADA DO ATACADO
        tipo_atacado: productData.tipo_atacado || 'nenhum',
        preco_atacado: productData.preco_atacado || 0,
        quantidade_minima_atacado: productData.quantidade_minima_atacado || 0,
        atacado_grade: atacadoGradeArr,
        
        variacoes: variacoesComDimensoes,
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
      
      isInitialLoadDone.current = true;
    }
  }, [productData, reset, isDuplicateMode, allSubcategories, isDataLoading]);

  const variacoesValues = watch('variacoes') || [];
  const selectedSubcategoryId = watch('subcategoria_id');
  const selectedGridId = watch('grade_id');

  // Gerenciando as mudanças da grade do produto para sincronizar variações e atacado_grade
  const selectedGridObj = useMemo(() => grids?.find(g => String(g.id) === String(selectedGridId)), [grids, selectedGridId]);

  useEffect(() => {
    // Não substitui as variações durante o load inicial de edição, apenas quando o usuário alterar a grade na interface.
    if (!selectedGridObj || (!isInitialLoadDone.current && (isEditMode || isDuplicateMode))) return;
    
    const currentSizes = variacoesValues.map((v:any) => v.tamanho);
    const newSizes = selectedGridObj.tamanhos.map(t => t.tamanho);
    
    if (JSON.stringify(currentSizes) !== JSON.stringify(newSizes)) {
        // Zera as Variações
        const newVariations = selectedGridObj.tamanhos.map(t => ({ 
            tamanho: t.tamanho, estoque: 0, sku: '', codigo_barras: '', 
            peso_kg: t.peso_kg || 0, altura_cm: t.altura_cm || 0, largura_cm: t.largura_cm || 0, comprimento_cm: t.comprimento_cm || 0,
        }));
        replaceVariacoes(newVariations);

        // Prepara as linhas do Atacado Grade
        const newAtacadoGrade = selectedGridObj.tamanhos.map(t => ({
            tamanho: t.tamanho, preco_atacado: 0
        }));
        replaceAtacadoGrade(newAtacadoGrade);
    }
  }, [selectedGridObj, isEditMode, isDuplicateMode, variacoesValues, replaceVariacoes, replaceAtacadoGrade]);

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

  const onSubmit = (data: any) => {
    if (!data.nome || !data.grade_id || !data.subcategoria_id || !data.marca_id) return toast.error('Preencha todos os campos obrigatórios da Identificação (Categoria, Subcategoria, Marca, Grade).');
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

  // Bloqueia renderização da tela se os Selects não tiverem opções montadas ainda
  if ((isEditMode || isDuplicateMode) && isDataLoading) {
     return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-emerald-500" /></div>;
  }

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