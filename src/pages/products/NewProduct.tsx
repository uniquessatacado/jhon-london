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
import { api, mediaBaseUrl } from '@/lib/api';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMediaQuery } from '@/hooks/use-media-query';

import { IdentificationSection } from '@/components/products/form/IdentificationSection';
import { VariationsSection } from '@/components/products/form/VariationsSection';
import { FinancialSection } from '@/components/products/form/FinancialSection';
import { MediaSection } from '@/components/products/form/MediaSection';
import { FiscalSection } from '@/components/products/form/FiscalSection';

const defaultFormValues = {
  nome: '',
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
};

// ============================================================================
// COMPONENTE INTERNO: SÓ É MONTADO QUANDO TODOS OS DADOS JÁ ESTÃO NA MÃO
// ============================================================================
function ProductFormContent({ 
  isEditMode, 
  isDuplicateMode, 
  productData, 
  categories, 
  brands, 
  grids, 
  allSubcategories, 
  globalAtacadoMin,
  id
}: any) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  // Mapeamos os dados UMA ÚNICA VEZ para ser o estado inicial absoluto do form
  const mappedData = useMemo(() => {
    if (!isEditMode && !isDuplicateMode) return defaultFormValues;
    if (!productData) return undefined; // Retorna undefined para o Form "esperar" os dados

    let categoryId = productData.categoria_id ? String(productData.categoria_id) : '';
    const subcategoryId = productData.subcategoria_id ? String(productData.subcategoria_id) : '';
    const brandId = productData.marca_id ? String(productData.marca_id) : '';
    const gridId = productData.grade_id ? String(productData.grade_id) : '';
    const gradeAtacadoId = productData.grade_atacado_id ? String(productData.grade_atacado_id) : '';

    if (!categoryId && subcategoryId && allSubcategories) {
      const sub = allSubcategories.find((s:any) => String(s.id) === subcategoryId);
      if (sub) categoryId = String(sub.categoria_id);
    }

    const variacoesComDimensoes = productData.variacoes?.map((v:any) => {
      const dim = productData.dimensoes_grade?.find((d:any) => d.tamanho === v.tamanho);
      return {
        ...v,
        id: v.id,
        estoque: isDuplicateMode ? 0 : v.estoque,
        sku: isDuplicateMode ? '' : v.sku,
        codigo_barras: isDuplicateMode ? '' : v.codigo_barras,
        peso_kg: v.peso_kg || dim?.peso_kg || 0,
        altura_cm: v.altura_cm || dim?.altura_cm || 0,
        largura_cm: v.largura_cm || dim?.largura_cm || 0,
        comprimento_cm: v.comprimento_cm || dim?.comprimento_cm || 0,
      };
    }) || [];

    const composicaoParsed = typeof productData.composicao_atacado_grade === 'string'
        ? JSON.parse(productData.composicao_atacado_grade || "[]")
        : (productData.composicao_atacado_grade || []);

    return {
      ...defaultFormValues,
      nome: isDuplicateMode ? `${productData.nome} - Cópia` : productData.nome,
      categoria_id: categoryId,
      subcategoria_id: subcategoryId, 
      marca_id: brandId,               
      grade_id: gridId,               
      grade_atacado_id: gradeAtacadoId, 
      ncm: productData.ncm || '',
      cfop_padrao: productData.cfop_padrao || '',
      cst_icms: productData.cst_icms || '',
      origem: String(productData.origem || ''),
      unidade_medida: productData.unidade_medida || '',
      preco_custo: Number(productData.preco_custo) || 0,
      preco_varejo: Number(productData.preco_varejo) || 0,
      habilita_atacado_geral: !!productData.habilita_atacado_geral,
      preco_atacado_geral: Number(productData.preco_atacado_geral) || 0,
      habilita_atacado_grade: !!productData.habilita_atacado_grade,
      preco_atacado_grade: Number(productData.preco_atacado_grade) || 0,
      variacoes: variacoesComDimensoes,
      composicao_atacado: composicaoParsed
    };
  }, [productData, isEditMode, isDuplicateMode, allSubcategories]);

  const methods = useForm<any>({
    mode: 'onChange',
    defaultValues: defaultFormValues,
    values: mappedData, // <--- Sincronização Perfeita
  });

  const { handleSubmit, formState: { isSubmitting, errors } } = methods;

  // Estados de Mídia
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Injeção de mídias na montagem (Corrigido com dica do Kimi)
  useEffect(() => {
    if (productData && !isDuplicateMode) {
      if (productData.imagem_principal) {
        setMainImagePreview(productData.imagem_principal.startsWith('http') ? productData.imagem_principal : `${mediaBaseUrl}${productData.imagem_principal}`);
      } else {
        setMainImagePreview(null);
      }

      if (productData.imagens_galeria?.length) {
        const fullUrls = productData.imagens_galeria.map((img: string) => img.startsWith('http') ? img : `${mediaBaseUrl}${img}`);
        setGalleryPreviews(fullUrls);
        setExistingGallery(fullUrls);
      } else {
        setGalleryPreviews([]);
        setExistingGallery([]);
      }

      const videoSrc = productData.video_url || productData.video;
      if (videoSrc) {
        setVideoPreview(videoSrc.startsWith('http') ? videoSrc : `${mediaBaseUrl}${videoSrc}`);
      } else {
        setVideoPreview(null);
      }
    } else {
      // Garante que o form nasça limpo ao criar novo produto ou duplicar
      setMainImagePreview(null);
      setGalleryPreviews([]);
      setExistingGallery([]);
      setVideoPreview(null);
    }
  }, [productData, isDuplicateMode]); // ✅ Correção aplicada: Reage às mudanças de rota/produto

  const onSubmit = (data: any) => {
    if (!data.nome || !data.grade_id || !data.subcategoria_id || !data.marca_id) {
        return toast.error('Preencha todos os campos obrigatórios da Identificação.');
    }
    if (!data.variacoes || data.variacoes.length === 0) {
        return toast.error('Adicione pelo menos uma variação na grade.');
    }

    const variacoesInvalidas = data.variacoes.filter((v: any) => Number(v.estoque) > 0 && !v.sku?.trim() && !v.codigo_barras?.trim());
    if (variacoesInvalidas.length > 0) {
        return toast.error('Tamanho com estoque MAIOR QUE ZERO exige que o SKU ou Cód. Barras seja preenchido.');
    }

    const skus = data.variacoes.map((v: any) => v.sku?.trim().toUpperCase()).filter(Boolean);
    if (new Set(skus).size !== skus.length) {
        return toast.error('Existem SKUs repetidos na grade do produto. Verifique os avisos em vermelho.');
    }

    if (data.habilita_atacado_geral && Number(data.preco_atacado_geral) <= 0) {
        return toast.error('O Atacado Geral está ativo, portanto o Preço do Atacado Geral deve ser maior que zero.');
    }

    if (data.habilita_atacado_grade) {
        if (Number(data.preco_atacado_grade) <= 0) {
            return toast.error('O Atacado Grade está ativo, portanto o Preço do Pacote Fechado deve ser maior que zero.');
        }
        const hasQty = data.composicao_atacado?.some((c: any) => Number(c.quantidade) > 0);
        if (!hasQty) {
            return toast.error('Atacado Grade Ativo: Você precisa definir pelo menos uma peça (quantidade > 0) na tabela de Composição do Pacote.');
        }
    }

    const payload = { 
      ...data, 
      id: isEditMode ? Number(id) : undefined, 
      imagem_principal_file: mainImageFile, 
      imagens_galeria_files: galleryFiles, 
      video_file: videoFile 
    };
    
    isEditMode ? updateProduct(payload) : createProduct(payload);
  };
  
  const onInvalid = (errors: any) => {
    if (errors.variacoes) {
        toast.error("O produto não foi salvo. Existe um erro de SKU duplicado nas variações.", {
            description: "Verifique as caixas destacadas em vermelho na aba de Variações."
        });
    } else {
        toast.error("Preencha todos os campos obrigatórios.");
    }
  };

  const isSaving = isCreating || isUpdating;
  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 md:space-y-8 pb-24 md:pb-20">
        
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

// ============================================================================
// COMPONENTE PRINCIPAL (CONTAINER): GERENCIA O LOADING E AS REQUISIÇÕES
// ============================================================================
export function NewProductPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicate_id');
  
  const isEditMode = !!id;
  const isDuplicateMode = !!duplicateId;
  const fetchId = id || duplicateId;
  
  const { data: categories, isLoading: isLoadingCats } = useCategories();
  const { data: brands, isLoading: isLoadingBrands } = useBrands();
  const { data: grids, isLoading: isLoadingGrids } = useGrids();
  const { data: allSubcategories, isLoading: isLoadingSubs } = useAllSubcategories();
  
  // Busca dos dados do produto se for edição ou duplicação
  const { data: productData, isLoading: isLoadingData } = useProductDetails(fetchId || undefined);

  const [globalAtacadoMin, setGlobalAtacadoMin] = useState('10');

  useEffect(() => {
    api.get('/configuracoes/qtd_minima_atacado_geral')
      .then(res => setGlobalAtacadoMin(res.data?.valor || '10'))
      .catch(() => console.error("Failed to fetch global wholesale minimum quantity."));
  }, []);

  // Bloqueio de tela: Se qualquer uma das APIS estiver carregando, mostra o spinner.
  const isPageLoading = isLoadingCats || isLoadingBrands || isLoadingGrids || isLoadingSubs || ((isEditMode || isDuplicateMode) && isLoadingData);

  if (isPageLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
        <p className="text-muted-foreground animate-pulse">Carregando dados estruturais...</p>
      </div>
    );
  }

  // Quando chega aqui, garantimos 100% que productData, brands, etc. não estão mais em "loading"
  return (
    <ProductFormContent 
      isEditMode={isEditMode}
      isDuplicateMode={isDuplicateMode}
      id={id}
      productData={productData}
      categories={categories}
      brands={brands}
      grids={grids}
      allSubcategories={allSubcategories}
      globalAtacadoMin={globalAtacadoMin}
    />
  );
}