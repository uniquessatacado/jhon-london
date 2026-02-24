import { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Check, ArrowLeft, Info, ShoppingBag, DollarSign, Lock, Box, Grid as GridIcon, Tag, Ruler, AlertTriangle, ArrowDown, Copy, Barcode, ScanBarcode } from 'lucide-react';
import { useCategories, useAllSubcategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { useGrids } from '@/hooks/use-grids';
import { useCreateProduct } from '@/hooks/use-create-product';
import { api } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export function NewProductPage() {
  const navigate = useNavigate();
  
  const { register, control, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, getValues } = useForm<any>({
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

  // Array de Variações (Estoque)
  const { fields: variacaoFields, replace: replaceVariacoes } = useFieldArray({
    control,
    name: "variacoes"
  });

  // Array de Composição Atacado (Pacote)
  const { fields: composicaoFields, replace: replaceComposicao } = useFieldArray({
    control,
    name: "composicao_atacado"
  });
  
  // Hooks de Dados
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: grids } = useGrids();
  const { data: allSubcategories } = useAllSubcategories();
  const { mutate: createProduct, isPending } = useCreateProduct();

  // Estados Locais
  const [globalAtacadoMin, setGlobalAtacadoMin] = useState('10');
  const [bulkStockQty, setBulkStockQty] = useState(''); 

  useEffect(() => {
    api.get('/configuracoes/qtd_minima_atacado_geral')
      .then(res => setGlobalAtacadoMin(res.data?.valor || '10'))
      .catch(() => {});
  }, []);
  
  // Watchers Principais
  const selectedGridId = watch('grade_id');
  const selectedSubcategoryId = watch('subcategoria_id');
  
  // Watchers Atacado
  const habilitaAtacadoGeral = watch('habilita_atacado_geral');
  const habilitaAtacadoGrade = watch('habilita_atacado_grade');
  const usarPrecoUnico = watch('usar_preco_atacado_unico');
  
  // Watchers Pacote
  const selectedGradeAtacadoId = watch('grade_atacado_id');
  const precoAtacadoGeral = watch('preco_atacado_geral') || 0;
  const precoAtacadoGrade = watch('preco_atacado_grade') || 0;
  
  // CORREÇÃO CRÍTICA: useWatch para garantir reatividade total na tabela
  const composicaoAtacadoValues = useWatch({
    control,
    name: "composicao_atacado",
    defaultValue: []
  });
  
  const variacoesValues = useWatch({
    control,
    name: "variacoes",
    defaultValue: []
  });

  // --- LÓGICA 1: GRADE E VARIAÇÕES (CRÍTICO) ---
  const selectedGridObj = useMemo(() => {
    return grids?.find(g => String(g.id) === String(selectedGridId));
  }, [grids, selectedGridId]);

  // Quando trocar a grade física, gerar as linhas da tabela de estoque
  useEffect(() => {
    if (selectedGridObj) {
        const newVariations = selectedGridObj.tamanhos.map(t => ({
            tamanho: t.tamanho,
            estoque: 0,
            sku: '',
            codigo_barras: ''
        }));
        replaceVariacoes(newVariations);
    }
  }, [selectedGridId, grids, replaceVariacoes]);

  // Função para aplicar estoque em massa
  const handleBulkStockApply = () => {
    if (!bulkStockQty) return;
    
    variacaoFields.forEach((_, index) => {
        setValue(`variacoes.${index}.estoque`, Number(bulkStockQty));
    });
    
    toast.success(`Estoque definido como ${bulkStockQty} para todos os tamanhos!`);
  };

  // --- LÓGICA 2: CLASSIFICAÇÃO E FISCAL ---
  useEffect(() => {
    if (selectedSubcategoryId && allSubcategories) {
      const sub = allSubcategories.find(s => String(s.id) === String(selectedSubcategoryId));
      if (sub) {
        // Fiscal Automático
        setValue('ncm', sub.ncm);
        setValue('cfop_padrao', sub.cfop_padrao);
        setValue('cst_icms', sub.cst_icms);
        setValue('origem', sub.origem);
        setValue('unidade_medida', sub.unidade_medida);
      }
    }
  }, [selectedSubcategoryId, allSubcategories, setValue]);

  // Helper de categoria
  const getCategoryName = (catId: number) => {
    return categories?.find(c => c.id === catId)?.nome || '';
  }

  // --- LÓGICA 3: CÁLCULOS PACOTE ATACADO (GRADE FECHADA) ---
  const gradeAtacadoObj = useMemo(() => {
      if (!grids || !selectedGradeAtacadoId) return null;
      return grids.find(g => String(g.id) === String(selectedGradeAtacadoId));
  }, [grids, selectedGradeAtacadoId]);

  // Inicializar composição quando trocar a grade do pacote
  useEffect(() => {
    if (gradeAtacadoObj) {
        // Resetar apenas se a grade mudar
        const initComposicao = gradeAtacadoObj.tamanhos.map(t => ({
            tamanho: t.tamanho,
            quantidade: 1 
        }));
        replaceComposicao(initComposicao);
    }
  }, [selectedGradeAtacadoId, gradeAtacadoObj, replaceComposicao]);

  // CÁLCULO DIRETO (SEM useMemo para evitar stale state)
  const totalPecasPacote = composicaoAtacadoValues 
    ? composicaoAtacadoValues.reduce((acc: number, curr: any) => acc + (Number(curr?.quantidade) || 0), 0)
    : 0;

  const valorTotalPacote = useMemo(() => {
      const precoUnitario = usarPrecoUnico ? Number(precoAtacadoGeral) : Number(precoAtacadoGrade);
      return totalPecasPacote * precoUnitario;
  }, [totalPecasPacote, precoAtacadoGeral, precoAtacadoGrade, usarPrecoUnico]);

  const onSubmit = (data: any) => {
    // VALIDAÇÃO MANUAL: SKU OU EAN OBRIGATÓRIO
    if (data.variacoes && data.variacoes.length > 0) {
        for (const variant of data.variacoes) {
            if (!variant.sku && !variant.codigo_barras) {
                toast.error(`Erro no tamanho ${variant.tamanho}`, {
                    description: 'É necessário informar o SKU ou o Código de Barras para salvar.',
                    duration: 5000,
                });
                
                const tableElement = document.getElementById('variations-table');
                tableElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
        }
    }
    createProduct(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Button type="button" variant="outline" size="icon" onClick={() => navigate('/produtos')} className="bg-white/5 border-white/10 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Novo Produto</h1>
            <p className="text-muted-foreground">Cadastro completo com grade e variação de estoque.</p>
          </div>
        </div>
        <Button size="lg" type="submit" disabled={isPending || isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          {isPending || isSubmitting ? 'Salvando...' : <><Check className="mr-2 h-4 w-4" /> Salvar Produto</>}
        </Button>
      </div>

      {/* SEÇÃO 1: GRADE E VARIAÇÕES (OBRIGATÓRIO) */}
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="pb-4 border-b border-white/10">
            <CardTitle className="flex items-center gap-2 text-emerald-400">
                <GridIcon className="h-5 w-5" /> 1. Grade de Estoque (Variações)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
                Selecione a grade primeiro para gerar as variações de tamanho.
            </p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
            <div className="max-w-md">
                <Label className="text-base font-semibold">Selecione a Grade do Produto *</Label>
                <Select onValueChange={(v) => setValue('grade_id', v)}>
                    <SelectTrigger className="mt-2 bg-black/40 border-emerald-500/30 h-12 text-lg focus:ring-emerald-500/30">
                        <SelectValue placeholder="Escolha uma grade..." />
                    </SelectTrigger>
                    <SelectContent>
                        {grids?.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nome} ({g.tamanhos.length} tam)</SelectItem>)}
                    </SelectContent>
                </Select>
                {errors.grade_id && <p className="text-red-500 text-sm mt-1">Grade é obrigatória</p>}
            </div>

            {selectedGridId && variacaoFields.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-4">
                    {/* Bulk Update Controls */}
                    <div className="flex items-end gap-3 mb-3 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl w-fit">
                        <div className="grid gap-1.5">
                            <Label className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                                <Copy className="h-3 w-3" /> Estoque Rápido (Todos)
                            </Label>
                            <Input 
                                type="number" 
                                className="h-8 w-32 bg-black/40 border-emerald-500/30 text-center font-bold focus:ring-emerald-500/40"
                                placeholder="Qtd. Igual"
                                value={bulkStockQty}
                                onChange={(e) => setBulkStockQty(e.target.value)}
                            />
                        </div>
                        <Button 
                            type="button" 
                            size="sm" 
                            onClick={handleBulkStockApply}
                            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400/20 shadow-lg shadow-emerald-500/10"
                        >
                            <ArrowDown className="mr-2 h-3 w-3" /> Aplicar
                        </Button>
                    </div>

                    <div id="variations-table" className="rounded-xl border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-black/40">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="w-[100px] text-emerald-400 font-bold">Tamanho</TableHead>
                                    <TableHead className="w-[150px]">Estoque Inicial</TableHead>
                                    <TableHead>
                                        <div className="flex items-center gap-2">
                                            <ScanBarcode className="h-4 w-4" /> SKU <span className="text-[10px] font-normal text-muted-foreground">(Interno)</span>
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center gap-2">
                                            <Barcode className="h-4 w-4" /> Cód. Barras / EAN
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-black/20">
                                {variacaoFields.map((field: any, index) => {
                                    const currentEan = variacoesValues?.[index]?.codigo_barras;
                                    const currentSku = variacoesValues?.[index]?.sku;
                                    const isMissingBoth = !currentEan && !currentSku;
                                    
                                    const skuPlaceholder = currentEan ? "Opcional (tem EAN)" : "Obrigatório s/ EAN";
                                    const skuBorderClass = isMissingBoth ? "focus:border-red-500/50 border-red-500/30 bg-red-500/5" : "bg-black/40 border-white/10 focus:bg-white/10";
                                    const eanBorderClass = isMissingBoth ? "focus:border-red-500/50 border-red-500/30 bg-red-500/5" : "bg-black/40 border-white/10 focus:bg-white/10";

                                    return (
                                        <TableRow key={field.id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-bold text-lg text-white">
                                                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                                                    {field.tamanho}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number" 
                                                    {...register(`variacoes.${index}.estoque`)} 
                                                    className="bg-black/40 border-white/10 focus:bg-white/10"
                                                    placeholder="0"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    {...register(`variacoes.${index}.sku`)} 
                                                    className={`${skuBorderClass} uppercase transition-colors`}
                                                    placeholder={skuPlaceholder}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input 
                                                    {...register(`variacoes.${index}.codigo_barras`)} 
                                                    className={`${eanBorderClass} transition-colors`}
                                                    placeholder="EAN-13 (Opcional c/ SKU)"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                        <Info className="h-3 w-3" />
                        <span>Regra: É obrigatório informar pelo menos um identificador (SKU ou Código de Barras) para cada tamanho.</span>
                    </div>
                </div>
            )}
            
            {!selectedGridId && (
                <div className="flex items-center justify-center p-8 border border-dashed border-white/10 rounded-xl bg-white/5 text-muted-foreground">
                    <AlertTriangle className="mr-2 h-5 w-5 opacity-50" />
                    Selecione uma grade acima para habilitar o estoque.
                </div>
            )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* SEÇÃO 2 & 3: IDENTIFICAÇÃO E CLASSIFICAÇÃO */}
          <div className="space-y-8">
              <Card className="bg-black/20 border-white/10 shadow-lg">
                <CardHeader className="pb-3 border-b border-white/5">
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                        <Tag className="h-4 w-4 text-emerald-500" /> 2. Identificação & Classificação
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nome">Nome do Produto *</Label>
                        <Input id="nome" {...register('nome', { required: true })} className="bg-black/40 border-white/10" placeholder="Ex: Calça Jeans Skinny" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div className="grid gap-2">
                            <Label>Subcategoria (Define Fiscal) *</Label>
                            <Select onValueChange={(value) => setValue('subcategoria_id', value)}>
                                <SelectTrigger className="bg-black/40 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                {allSubcategories?.map(sub => (
                                    <SelectItem key={sub.id} value={String(sub.id)}>
                                        <span className="font-medium">{sub.nome}</span>
                                        <span className="text-muted-foreground text-xs ml-2">({getCategoryName(sub.categoria_id)})</span>
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                         </div>
                         <div className="grid gap-2">
                            <Label>Marca *</Label>
                            <Select onValueChange={(value) => setValue('marca_id', value)}>
                                <SelectTrigger className="bg-black/40 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                {brands?.map(brand => <SelectItem key={brand.id} value={String(brand.id)}>{brand.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                         </div>
                    </div>
                </CardContent>
              </Card>

              {/* SEÇÃO 4: DIMENSÕES (AUTOMÁTICO) */}
              <Card className="bg-black/20 border-white/10 shadow-lg">
                <CardHeader className="pb-3 border-b border-white/5">
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                        <Ruler className="h-4 w-4 text-emerald-500" /> 3. Dimensões (Automático)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {selectedGridObj ? (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground mb-2">
                                Dimensões herdadas da grade <strong>{selectedGridObj.nome}</strong>:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {selectedGridObj.tamanhos.map((t, i) => (
                                    <div key={i} className="text-xs p-2 rounded bg-white/5 border border-white/5 flex flex-col">
                                        <span className="font-bold text-emerald-400 mb-1">Tam: {t.tamanho}</span>
                                        <span className="text-muted-foreground">
                                            {t.peso_kg}kg • {t.altura_cm}x{t.largura_cm}x{t.comprimento_cm}cm
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground italic p-4 text-center">
                            Selecione a grade no topo para ver as dimensões.
                        </div>
                    )}
                </CardContent>
              </Card>
              
               {/* IMAGENS */}
              <Card className="bg-black/20 border-white/10 shadow-lg">
                <CardHeader className="pb-3 border-b border-white/5">
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                        <Box className="h-4 w-4 text-emerald-500" /> Imagens
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="imagem_principal">URL Principal</Label>
                    <Input id="imagem_principal" {...register('imagem_principal')} className="bg-black/40 border-white/10" />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="imagens_galeria">Galeria (URL separadas por vírgula)</Label>
                    <Textarea id="imagens_galeria" {...register('imagens_galeria')} className="bg-black/40 border-white/10 h-20" />
                  </div>
                </CardContent>
              </Card>
          </div>

          {/* SEÇÃO 5: FINANCEIRO */}
          <div className="space-y-8">
              <Card className="bg-black/20 border-white/10 shadow-lg h-full">
                <CardHeader className="pb-3 border-b border-white/5">
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                        <DollarSign className="h-4 w-4 text-emerald-500" /> 4. Financeiro & Atacado
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-6">
                    {/* Preços Base */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="grid gap-2">
                            <Label>Custo (R$)</Label>
                            <Input type="number" step="0.01" {...register('preco_custo')} className="bg-black/40 border-white/10" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Venda Varejo (R$)</Label>
                            <Input type="number" step="0.01" {...register('preco_varejo')} className="bg-black/40 border-emerald-500/30 text-emerald-400 font-bold" />
                        </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Toggle Único Preço */}
                    <div className="flex items-center justify-between">
                         <Label htmlFor="usar_preco_atacado_unico" className="flex items-center gap-2 text-sm cursor-pointer">
                            <Lock className="h-3 w-3" /> Usar mesmo preço de atacado para tudo
                        </Label>
                        <Switch 
                            id="usar_preco_atacado_unico" 
                            checked={usarPrecoUnico}
                            onCheckedChange={(c) => setValue('usar_preco_atacado_unico', c)}
                        />
                    </div>

                    {/* Atacado Geral */}
                    <div className={`p-4 rounded-xl border transition-all ${habilitaAtacadoGeral ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <Label className="font-medium">Atacado Geral (Misturado)</Label>
                                <p className="text-xs text-muted-foreground">Mínimo global: {globalAtacadoMin} peças</p>
                            </div>
                            <Switch checked={habilitaAtacadoGeral} onCheckedChange={(c) => setValue('habilita_atacado_geral', c)} />
                        </div>
                        {(habilitaAtacadoGeral || usarPrecoUnico) && (
                            <Input 
                                type="number" 
                                step="0.01" 
                                {...register('preco_atacado_geral')} 
                                className="mt-2 bg-black/40 border-white/10" 
                                placeholder="R$ 0,00"
                            />
                        )}
                    </div>

                    {/* Atacado Pacote (Grade) */}
                    <div className={`p-4 rounded-xl border transition-all ${habilitaAtacadoGrade ? 'bg-purple-500/5 border-purple-500/20' : 'bg-white/5 border-white/5'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <Label className="font-medium">Atacado Grade (Pacote Fechado)</Label>
                                <p className="text-xs text-muted-foreground">Venda de kit com distribuição definida</p>
                            </div>
                            <Switch checked={habilitaAtacadoGrade} onCheckedChange={(c) => setValue('habilita_atacado_grade', c)} />
                        </div>

                        {habilitaAtacadoGrade && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="grid gap-2">
                                    <Label className="text-xs text-purple-300">Grade do Pacote</Label>
                                    <Select onValueChange={(v) => setValue('grade_atacado_id', v)}>
                                        <SelectTrigger className="bg-black/40 border-white/10 h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            {grids?.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* TABELA DE COMPOSIÇÃO - AGORA USANDO FIELDS DO USEFIELDARRAY */}
                                {composicaoFields.length > 0 && (
                                    <div className="border border-white/10 rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader className="bg-purple-500/10">
                                                <TableRow className="border-white/10 hover:bg-transparent">
                                                    <TableHead className="h-8 text-xs text-purple-300">Tamanho</TableHead>
                                                    <TableHead className="h-8 text-xs text-right text-purple-300">Qtd. no Pacote</TableHead>
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
                                                            <Input 
                                                                type="number" 
                                                                min="0"
                                                                className="h-7 w-20 ml-auto bg-black/40 border-white/10 text-right"
                                                                {...register(`composicao_atacado.${idx}.quantidade`, { valueAsNumber: true })}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}

                                {!usarPrecoUnico && (
                                    <div className="grid gap-2">
                                        <Label className="text-xs">Preço Unit. no Pacote</Label>
                                        <Input type="number" step="0.01" {...register('preco_atacado_grade')} className="bg-black/40 border-white/10 h-9" placeholder="R$ 0,00" />
                                    </div>
                                )}

                                {/* Resumo do Pacote */}
                                {gradeAtacadoObj && (
                                    <div className="bg-black/40 rounded border border-white/10 p-3 text-sm space-y-1 mt-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total de Peças:</span>
                                            <span className="font-bold">{totalPecasPacote} un</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Preço Unitário:</span>
                                            <span className="text-emerald-400">R$ {(usarPrecoUnico ? Number(precoAtacadoGeral) : Number(precoAtacadoGrade)).toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-white/10 my-1 pt-1 flex justify-between font-bold">
                                            <span>Valor Total do Pacote:</span>
                                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalPacote)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
              </Card>
          </div>
      </div>
      
      {/* Dados Fiscais */}
      <input type="hidden" {...register('ncm')} />
      <input type="hidden" {...register('cfop_padrao')} />
    </form>
  );
}