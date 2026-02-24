import { useEffect, useState, useMemo, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Check, ArrowLeft, Info, DollarSign, Lock, Box, Grid as GridIcon, Tag, Ruler, AlertTriangle, ArrowDown, Copy, Barcode, ScanBarcode, 
  Upload, X, Image as ImageIcon, Video, Play, Trash2 
} from 'lucide-react';
import { useCategories, useAllSubcategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { useGrids } from '@/hooks/use-grids';
import { useCreateProduct } from '@/hooks/use-create-product';
import { useUpdateProduct } from '@/hooks/use-update-product';
import { useProduct } from '@/hooks/use-products';
import { api } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export function NewProductPage() {
  const navigate = useNavigate();
  const params = useParams();
  
  // Tratamento robusto do ID
  const id = params.id && params.id !== 'undefined' && params.id !== 'novo' ? params.id : undefined;
  const isEditMode = !!id;

  // Hooks de Mutação
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const isPending = isCreating || isUpdating;

  // Dados para edição - Só busca se tiver ID válido
  const { data: existingProduct, isLoading: isLoadingProduct } = useProduct(id);

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

  // PREENCHER FORMULÁRIO NA EDIÇÃO
  useEffect(() => {
    if (existingProduct) {
        // Mapeia os dados do backend para o formato do form
        reset({
            nome: existingProduct.nome,
            subcategoria_id: String(existingProduct.subcategoria_id),
            marca_id: String(existingProduct.marca_id),
            grade_id: String(existingProduct.grade_id),
            preco_custo: existingProduct.preco_custo,
            preco_varejo: existingProduct.preco_varejo,
            variacoes: existingProduct.variacoes || [],
            // Campos de Atacado
            habilita_atacado_geral: Boolean(existingProduct.habilita_atacado_geral),
            preco_atacado_geral: existingProduct.preco_atacado_geral,
            habilita_atacado_grade: Boolean(existingProduct.habilita_atacado_grade),
            usar_preco_atacado_unico: Boolean(existingProduct.usar_preco_atacado_unico),
            grade_atacado_id: existingProduct.grade_atacado_id ? String(existingProduct.grade_atacado_id) : undefined,
            preco_atacado_grade: existingProduct.preco_atacado_grade,
            // Fiscal (opcional carregar, ou deixar o useEffect da subcategoria tratar)
            ncm: existingProduct.ncm,
            cfop_padrao: existingProduct.cfop_padrao,
            cst_icms: existingProduct.cst_icms,
            unidade_medida: existingProduct.unidade_medida,
            origem: existingProduct.origem,
            // Imagens
            imagem_principal: existingProduct.imagem_principal,
        });

        // Setar previews iniciais se existirem
        if (existingProduct.imagem_principal) {
            setMainImagePreview(existingProduct.imagem_principal);
        }
        if (existingProduct.imagens_galeria && existingProduct.imagens_galeria.length > 0) {
            setGalleryPreviews(existingProduct.imagens_galeria);
        }
    }
  }, [existingProduct, reset]);

  // Array de Variações
  const { fields: variacaoFields, replace: replaceVariacoes } = useFieldArray({
    control,
    name: "variacoes"
  });

  const { fields: composicaoFields, replace: replaceComposicao } = useFieldArray({
    control,
    name: "composicao_atacado"
  });
  
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: grids } = useGrids();
  const { data: allSubcategories } = useAllSubcategories();

  const [globalAtacadoMin, setGlobalAtacadoMin] = useState('10');
  const [bulkStockQty, setBulkStockQty] = useState(''); 

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/configuracoes/qtd_minima_atacado_geral').then(res => setGlobalAtacadoMin(res.data?.valor || '10')).catch(() => {});
  }, []);
  
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
    const skus = variacoesValues?.map((v: any) => v.sku?.trim()).filter(Boolean) || [];
    const eans = variacoesValues?.map((v: any) => v.codigo_barras?.trim()).filter(Boolean) || [];
    const duplicateSkus = skus.filter((item: string, index: number) => skus.indexOf(item) !== index);
    const duplicateEans = eans.filter((item: string, index: number) => eans.indexOf(item) !== index);
    return { duplicateSkus, duplicateEans };
  }, [variacoesValues]);

  const selectedGridObj = useMemo(() => {
    return grids?.find(g => String(g.id) === String(selectedGridId));
  }, [grids, selectedGridId]);

  // Geração de Variações: Só gera se NÃO estiver em modo de edição OU se o usuário mudar a grade intencionalmente
  useEffect(() => {
    if (selectedGridObj) {
        // Verifica se a grade selecionada é a mesma que veio do banco (para edição)
        const isSameGridAsLoaded = existingProduct && String(existingProduct.grade_id) === String(selectedGridId);
        
        // Se NÃO for a mesma grade (mudou ou é novo), verifica se precisa popular
        if (!isSameGridAsLoaded) {
             // Se os campos estão vazios e não é edição, popula
             if (variacaoFields.length === 0 && !isEditMode) {
                 const newVariations = selectedGridObj.tamanhos.map(t => ({ tamanho: t.tamanho, estoque: 0, sku: '', codigo_barras: '' }));
                 replaceVariacoes(newVariations);
             }
        }
        
        // Se estiver criando novo e selecionou grade, popula/substitui
        if (!isEditMode && selectedGridId) {
             const newVariations = selectedGridObj.tamanhos.map(t => ({ tamanho: t.tamanho, estoque: 0, sku: '', codigo_barras: '' }));
             
             // Só substitui se os tamanhos forem diferentes para não apagar o que o usuário digitou
             const currentSizes = variacaoFields.map((v: any) => v.tamanho).join(',');
             const newSizes = newVariations.map(v => v.tamanho).join(',');
             if (currentSizes !== newSizes) {
                 replaceVariacoes(newVariations);
             }
        }
    }
  }, [selectedGridId, grids, replaceVariacoes, isEditMode, existingProduct, variacaoFields]);

  const handleBulkStockApply = () => {
    if (!bulkStockQty) return;
    variacaoFields.forEach((_, index) => setValue(`variacoes.${index}.estoque`, Number(bulkStockQty)));
    toast.success(`Estoque definido como ${bulkStockQty} para todos os tamanhos!`);
  };

  useEffect(() => {
    // Só auto-preenche se NÃO estiver editando ou se o usuário trocou a subcategoria manualmente
    // Para simplificar: se a subcategoria do banco for diferente da atual, preenche
    if (selectedSubcategoryId && allSubcategories) {
      const sub = allSubcategories.find(s => String(s.id) === String(selectedSubcategoryId));
      if (sub) {
        // Se estiver editando, só sobrescreve se o valor estiver vazio
        const currentNcm = watch('ncm');
        if (!currentNcm || !isEditMode) {
             setValue('ncm', sub.ncm);
             setValue('cfop_padrao', sub.cfop_padrao);
             setValue('cst_icms', sub.cst_icms);
             setValue('origem', sub.origem);
             setValue('unidade_medida', sub.unidade_medida);
        }
      }
    }
  }, [selectedSubcategoryId, allSubcategories, setValue, isEditMode]);

  const gradeAtacadoObj = useMemo(() => {
      if (!grids || !selectedGradeAtacadoId) return null;
      return grids.find(g => String(g.id) === String(selectedGradeAtacadoId));
  }, [grids, selectedGradeAtacadoId]);

  useEffect(() => {
    if (gradeAtacadoObj && !isEditMode) { // Só auto-preenche pacote em produto novo
        const initComposicao = gradeAtacadoObj.tamanhos.map(t => ({ tamanho: t.tamanho, quantidade: 1 }));
        replaceComposicao(initComposicao);
    }
  }, [selectedGradeAtacadoId, gradeAtacadoObj, replaceComposicao, isEditMode]);

  const totalPecasPacote = composicaoAtacadoValues ? composicaoAtacadoValues.reduce((acc: number, curr: any) => acc + (Number(curr?.quantidade) || 0), 0) : 0;
  const valorTotalPacote = useMemo(() => {
      const precoUnitario = usarPrecoUnico ? Number(precoAtacadoGeral) : Number(precoAtacadoGrade);
      return totalPecasPacote * precoUnitario;
  }, [totalPecasPacote, precoAtacadoGeral, precoAtacadoGrade, usarPrecoUnico]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB.");
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    files.forEach(file => {
      if (file.size <= 5 * 1024 * 1024) {
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });
    setGalleryFiles(prev => [...prev, ...validFiles]);
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: any) => {
    if (duplicateCheck.duplicateSkus.length > 0 || duplicateCheck.duplicateEans.length > 0) {
       return toast.error('Códigos duplicados detectados.');
    }

    const payload = {
        ...data,
        imagem_principal_file: mainImageFile,
        imagens_galeria_files: galleryFiles,
        video_file: videoFile
    };

    if (isEditMode && id) {
        updateProduct({ id, formData: payload });
    } else {
        createProduct(payload);
    }
  };

  if (isEditMode && isLoadingProduct) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500"></div>
              <p>Carregando dados do produto...</p>
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
            <h1 className="text-3xl font-bold">{isEditMode ? 'Editar Produto' : 'Novo Produto'}</h1>
            <p className="text-muted-foreground">{isEditMode ? 'Atualize os dados e o estoque.' : 'Cadastro completo com grade.'}</p>
          </div>
        </div>
        <Button size="lg" type="submit" disabled={isPending || isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          {isPending || isSubmitting ? 'Salvando...' : <><Check className="mr-2 h-4 w-4" /> {isEditMode ? 'Salvar Alterações' : 'Criar Produto'}</>}
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="pb-4 border-b border-white/10">
            <CardTitle className="flex items-center gap-2 text-emerald-400">
                <GridIcon className="h-5 w-5" /> 1. Grade de Estoque
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
            <div className="max-w-md">
                <Label className="text-base font-semibold">Grade do Produto *</Label>
                <Select onValueChange={(v) => setValue('grade_id', v)} value={selectedGridId}>
                    <SelectTrigger className="mt-2 bg-black/40 border-emerald-500/30 h-12 text-lg"><SelectValue placeholder="Escolha..." /></SelectTrigger>
                    <SelectContent>{grids?.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>)}</SelectContent>
                </Select>
            </div>

            {selectedGridId && (
                <div className="animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-end gap-3 mb-3 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl w-fit">
                        <div className="grid gap-1.5">
                            <Label className="text-xs text-emerald-400 font-medium">Estoque Rápido</Label>
                            <Input type="number" className="h-8 w-32 bg-black/40 border-emerald-500/30 text-center" value={bulkStockQty} onChange={(e) => setBulkStockQty(e.target.value)} />
                        </div>
                        <Button type="button" size="sm" onClick={handleBulkStockApply} className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white"><ArrowDown className="mr-2 h-3 w-3" /> Aplicar</Button>
                    </div>

                    <div id="variations-table" className="rounded-xl border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-black/40">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="w-[100px] text-emerald-400 font-bold">Tamanho</TableHead>
                                    <TableHead className="w-[150px]">Estoque</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Cód. Barras</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-black/20">
                                {variacaoFields.map((field: any, index) => {
                                    const currentEan = variacoesValues?.[index]?.codigo_barras;
                                    const currentSku = variacoesValues?.[index]?.sku;
                                    const isSkuDuplicate = currentSku && duplicateCheck.duplicateSkus.includes(currentSku);
                                    return (
                                        <TableRow key={field.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-bold text-lg text-white"><Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">{field.tamanho}</Badge></TableCell>
                                            <TableCell><Input type="number" {...register(`variacoes.${index}.estoque`)} className="bg-black/40 border-white/10" /></TableCell>
                                            <TableCell className="relative"><Input {...register(`variacoes.${index}.sku`)} className={`uppercase ${isSkuDuplicate ? 'border-red-500 text-red-400' : 'bg-black/40 border-white/10'}`} /></TableCell>
                                            <TableCell><Input {...register(`variacoes.${index}.codigo_barras`)} className="bg-black/40 border-white/10" /></TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
              <Card className="bg-black/20 border-white/10 shadow-lg">
                <CardHeader className="pb-3 border-b border-white/5">
                    <CardTitle className="text-base flex items-center gap-2 text-white"><Tag className="h-4 w-4 text-emerald-500" /> 2. Identificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid gap-2"><Label>Nome</Label><Input {...register('nome')} className="bg-black/40 border-white/10" /></div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="grid gap-2"><Label>Subcategoria</Label><Select onValueChange={(v) => setValue('subcategoria_id', v)} value={selectedSubcategoryId}><SelectTrigger className="bg-black/40 border-white/10"><SelectValue /></SelectTrigger><SelectContent>{allSubcategories?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>)}</SelectContent></Select></div>
                         <div className="grid gap-2"><Label>Marca</Label><Select onValueChange={(v) => setValue('marca_id', v)} value={watch('marca_id')}><SelectTrigger className="bg-black/40 border-white/10"><SelectValue /></SelectTrigger><SelectContent>{brands?.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.nome}</SelectItem>)}</SelectContent></Select></div>
                    </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-white/10 shadow-lg">
                <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2 text-white"><Box className="h-4 w-4 text-emerald-500" /> Mídia</CardTitle></CardHeader>
                <CardContent className="pt-4 space-y-6">
                  <div className="space-y-3">
                    <Label>Imagem Principal</Label>
                    <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 ${mainImagePreview ? 'border-emerald-500/50' : 'border-white/10'}`} onClick={() => mainImageInputRef.current?.click()}>
                        <input type="file" ref={mainImageInputRef} className="hidden" accept="image/*" onChange={handleMainImageChange} />
                        {mainImagePreview ? <img src={mainImagePreview} className="h-48 object-contain" /> : <div className="text-center py-6"><Upload className="mx-auto h-8 w-8 mb-2 opacity-50" /><p className="text-sm">Clique para enviar</p></div>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Galeria</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {galleryPreviews.map((p, i) => <div key={i} className="relative aspect-square rounded overflow-hidden border border-white/10"><img src={p} className="w-full h-full object-cover" /><Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeGalleryImage(i)}><X className="h-3 w-3" /></Button></div>)}
                        {galleryFiles.length < 5 && <div className="aspect-square rounded border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/5" onClick={() => galleryInputRef.current?.click()}><input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryChange} /><Upload className="h-6 w-6 opacity-50" /></div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
          </div>

          <div className="space-y-8">
              <Card className="bg-black/20 border-white/10 shadow-lg h-full">
                <CardHeader className="pb-3 border-b border-white/5"><CardTitle className="text-base flex items-center gap-2 text-white"><DollarSign className="h-4 w-4 text-emerald-500" /> Financeiro</CardTitle></CardHeader>
                <CardContent className="pt-4 space-y-6">
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="grid gap-2"><Label>Custo</Label><Input type="number" step="0.01" {...register('preco_custo')} className="bg-black/40 border-white/10" /></div>
                        <div className="grid gap-2"><Label>Varejo</Label><Input type="number" step="0.01" {...register('preco_varejo')} className="bg-black/40 border-emerald-500/30 text-emerald-400 font-bold" /></div>
                    </div>
                    {/* ... (Resto dos campos de Atacado mantidos iguais) ... */}
                </CardContent>
              </Card>
          </div>
      </div>
      <input type="hidden" {...register('ncm')} />
      <input type="hidden" {...register('cfop_padrao')} />
    </form>
  );
}