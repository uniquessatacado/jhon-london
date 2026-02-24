import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Package, FileText, Ruler, Image, Check, ArrowLeft, AlertCircle, Info, ShoppingBag, DollarSign, Lock, Calculator, Box } from 'lucide-react';
import { useCategories, useAllSubcategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { useGrids } from '@/hooks/use-grids';
import { useCreateProduct } from '@/hooks/use-create-product';
import { api } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function NewProductPage() {
  const navigate = useNavigate();
  // Using <any> to avoid strict type inference errors since defaultValues is partial
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<any>({
    defaultValues: {
      atacado_grade_qtd_por_tamanho: 1, // Default 1 peça por tamanho
      qtd_minima_atacado_grade: 6,
      habilita_atacado_geral: false,
      habilita_atacado_grade: false,
      usar_preco_atacado_unico: true,
      estoque: 0,
      estoque_minimo: 0,
      preco_custo: 0,
      preco_varejo: 0,
      preco_atacado_geral: 0,
      preco_atacado_grade: 0
    }
  });
  
  // Hooks de Dados
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: grids } = useGrids();
  const { data: allSubcategories, isLoading: isLoadingSubs } = useAllSubcategories();
  const { mutate: createProduct, isPending } = useCreateProduct();

  // Estado local para config global
  const [globalAtacadoMin, setGlobalAtacadoMin] = useState('10');

  useEffect(() => {
    api.get('/configuracoes/qtd_minima_atacado_geral')
      .then(res => setGlobalAtacadoMin(res.data?.valor || '10'))
      .catch(() => {});
  }, []);
  
  // Watchers
  const selectedSubcategoryId = watch('subcategoria_id');
  const selectedGridId = watch('grade_id'); // Grade física
  
  // Watchers Atacado
  const habilitaAtacadoGeral = watch('habilita_atacado_geral');
  const habilitaAtacadoGrade = watch('habilita_atacado_grade');
  const usarPrecoUnico = watch('usar_preco_atacado_unico');
  
  // Watchers Grade Atacado
  const selectedGradeAtacadoId = watch('grade_atacado_id');
  const qtdPorTamanho = watch('atacado_grade_qtd_por_tamanho') || 1;
  const precoAtacadoGeral = watch('preco_atacado_geral') || 0;
  const precoAtacadoGrade = watch('preco_atacado_grade') || 0;

  // Cálculos do Pacote
  const gradeAtacadoObj = useMemo(() => {
      if (!grids || !selectedGradeAtacadoId) return null;
      return grids.find(g => String(g.id) === String(selectedGradeAtacadoId));
  }, [grids, selectedGradeAtacadoId]);

  const totalPecasPacote = useMemo(() => {
      if (!gradeAtacadoObj) return 0;
      return (gradeAtacadoObj.tamanhos?.length || 0) * Number(qtdPorTamanho);
  }, [gradeAtacadoObj, qtdPorTamanho]);

  const valorTotalPacote = useMemo(() => {
      const precoUnitario = usarPrecoUnico ? Number(precoAtacadoGeral) : Number(precoAtacadoGrade);
      return totalPecasPacote * precoUnitario;
  }, [totalPecasPacote, precoAtacadoGeral, precoAtacadoGrade, usarPrecoUnico]);

  // EFEITO: Preenchimento Automático Fiscal + CATEGORIA + GRADE FÍSICA
  useEffect(() => {
    if (selectedSubcategoryId && allSubcategories) {
      const sub = allSubcategories.find(s => String(s.id) === String(selectedSubcategoryId));
      if (sub) {
        // Vincula Categoria Pai automaticamente
        setValue('categoria_id', String(sub.categoria_id));

        // Fiscal
        setValue('ncm', sub.ncm);
        setValue('cfop_padrao', sub.cfop_padrao);
        setValue('cst_icms', sub.cst_icms);
        setValue('origem', sub.origem);
        setValue('unidade_medida', sub.unidade_medida);
        
        // Grade Física Sugerida
        if (sub.grade_id) {
            setValue('grade_id', String(sub.grade_id));
        }
      }
    }
  }, [selectedSubcategoryId, allSubcategories, setValue]);

  const onSubmit = (data: any) => {
    const precoGeral = Number(data.preco_atacado_geral) || 0;
    const precoGrade = data.usar_preco_atacado_unico ? precoGeral : (Number(data.preco_atacado_grade) || 0);

    const payload = {
        ...data,
        peso_kg: selectedGridId && selectedGridId !== 'null' ? 0 : data.peso_kg,
        altura_cm: selectedGridId && selectedGridId !== 'null' ? 0 : data.altura_cm,
        largura_cm: selectedGridId && selectedGridId !== 'null' ? 0 : data.largura_cm,
        comprimento_cm: selectedGridId && selectedGridId !== 'null' ? 0 : data.comprimento_cm,
        
        preco_atacado_geral: precoGeral,
        preco_atacado_grade: precoGrade,
        grade_atacado_id: data.grade_atacado_id ? Number(data.grade_atacado_id) : null,
        atacado_grade_qtd_por_tamanho: Number(data.atacado_grade_qtd_por_tamanho),
    };
    createProduct(payload);
  };

  // Helper para mostrar nome da categoria na lista de subs
  const getCategoryName = (catId: number) => {
    return categories?.find(c => c.id === catId)?.nome || '';
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
           <Button type="button" variant="outline" size="icon" onClick={() => navigate('/produtos')} className="bg-white/5 border-white/10 hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Novo Produto</h1>
            <p className="text-muted-foreground">Cadastre produtos com inteligência fiscal e regras de atacado.</p>
          </div>
        </div>
        <Button size="lg" type="submit" disabled={isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
          {isPending ? 'Salvando...' : <><Check className="mr-2 h-4 w-4" /> Salvar Produto</>}
        </Button>
      </div>

      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden p-6 shadow-2xl">
        <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-black/20 p-1 rounded-xl mb-8">
              <TabsTrigger value="basic" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><Package className="mr-2 h-4 w-4" />Dados Básicos</TabsTrigger>
              <TabsTrigger value="fiscal" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><FileText className="mr-2 h-4 w-4" />Fiscal</TabsTrigger>
              <TabsTrigger value="dimensions" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><Ruler className="mr-2 h-4 w-4" />Dimensões</TabsTrigger>
              <TabsTrigger value="images" className="rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><Image className="mr-2 h-4 w-4" />Imagens</TabsTrigger>
            </TabsList>
            
            {/* DADOS BÁSICOS */}
            <TabsContent value="basic" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Identificação */}
                  <div className="grid gap-4 p-4 border border-white/10 rounded-xl bg-white/5 col-span-2">
                      <div className="grid gap-2">
                        <Label htmlFor="nome">Nome do Produto</Label>
                        <Input id="nome" {...register('nome', { required: true })} className="bg-black/20 border-white/10" placeholder="Ex: Camiseta Básica Preta" />
                        {errors.nome && <p className="text-sm text-red-500">Nome é obrigatório.</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="grid gap-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" {...register('sku')} className="bg-black/20 border-white/10" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="codigo_barras">EAN (Código de Barras)</Label>
                            <Input id="codigo_barras" {...register('codigo_barras')} className="bg-black/20 border-white/10" />
                        </div>
                      </div>
                  </div>

                  {/* Preços Básicos (Varejo/Custo) */}
                  <div className="grid gap-4 p-4 border border-white/10 rounded-xl bg-white/5">
                      <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" /> Financeiro (Varejo)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="preco_custo">Custo (R$)</Label>
                            <Input id="preco_custo" type="number" step="0.01" {...register('preco_custo')} className="bg-black/20 border-white/10" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="preco_varejo">Venda Varejo (R$)</Label>
                            <Input id="preco_varejo" type="number" step="0.01" {...register('preco_varejo', { required: true })} className="bg-black/20 border-white/10 font-bold text-emerald-400" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                         <div className="grid gap-2">
                            <Label htmlFor="estoque">Estoque Inicial</Label>
                            <Input id="estoque" type="number" {...register('estoque')} className="bg-black/20 border-white/10" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="estoque_minimo">Mínimo</Label>
                            <Input id="estoque_minimo" type="number" {...register('estoque_minimo')} className="bg-black/20 border-white/10" />
                        </div>
                      </div>
                  </div>

                  {/* REGRAS DE ATACADO (PACOTE/KIT) */}
                  <div className="grid gap-4 p-4 border border-white/10 rounded-xl bg-white/5">
                    <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" /> Regras de Atacado
                    </h3>
                    
                    {/* Toggle: Usar mesmo preço */}
                    <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                        <Label htmlFor="usar_preco_atacado_unico" className="cursor-pointer flex items-center gap-2 text-sm">
                            {usarPrecoUnico ? <Lock className="h-3 w-3 text-emerald-500" /> : <Lock className="h-3 w-3 text-muted-foreground" />}
                            Usar mesmo preço unitário para ambos os tipos
                        </Label>
                        <Switch 
                            id="usar_preco_atacado_unico" 
                            checked={usarPrecoUnico}
                            onCheckedChange={(c) => setValue('usar_preco_atacado_unico', c)}
                        />
                    </div>
                    
                    {/* 1. ATACADO GERAL */}
                    <div className={`p-4 rounded-xl border transition-all ${habilitaAtacadoGeral ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-black/20 border-white/5'}`}>
                        <div className="flex items-start justify-between mb-2">
                            <div className="grid gap-1">
                                <Label htmlFor="habilita_atacado_geral" className="font-medium cursor-pointer text-base">Atacado Geral</Label>
                                <p className="text-xs text-muted-foreground">
                                    Venda misturada (qualquer modelo). Mínimo global: <strong>{globalAtacadoMin} peças</strong>.
                                </p>
                            </div>
                            <Switch 
                                id="habilita_atacado_geral" 
                                checked={habilitaAtacadoGeral}
                                onCheckedChange={(c) => setValue('habilita_atacado_geral', c)}
                            />
                        </div>
                        
                        {(habilitaAtacadoGeral || usarPrecoUnico) && (
                            <div className="animate-in fade-in slide-in-from-top-2 mt-2">
                                <Label className="text-xs">
                                    {usarPrecoUnico ? "Preço Atacado (R$)" : "Preço Atacado Geral (R$)"}
                                </Label>
                                <Input 
                                    type="number" 
                                    step="0.01" 
                                    {...register('preco_atacado_geral')}
                                    className="bg-white/5 border-white/10 mt-1 max-w-[200px]"
                                    placeholder="0.00"
                                />
                            </div>
                        )}
                    </div>

                    {/* 2. ATACADO POR GRADE (PACOTE) */}
                    <div className={`p-4 rounded-xl border transition-all ${habilitaAtacadoGrade ? 'bg-purple-500/5 border-purple-500/20' : 'bg-black/20 border-white/5'}`}>
                         <div className="flex items-start justify-between mb-4">
                            <div className="grid gap-1">
                                <Label htmlFor="habilita_atacado_grade" className="font-medium cursor-pointer text-base">Pacote Fechado (Grade)</Label>
                                <p className="text-xs text-muted-foreground">
                                    Vende o kit completo com todos os tamanhos da grade.
                                </p>
                            </div>
                            <Switch 
                                id="habilita_atacado_grade" 
                                checked={habilitaAtacadoGrade}
                                onCheckedChange={(c) => setValue('habilita_atacado_grade', c)}
                            />
                        </div>

                        {habilitaAtacadoGrade && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                {/* Seleção da Grade */}
                                <div className="grid gap-2">
                                    <Label>Selecionar Grade do Pacote</Label>
                                    <Select onValueChange={(v) => setValue('grade_atacado_id', v)}>
                                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Selecione a grade..." /></SelectTrigger>
                                        <SelectContent>
                                            {grids?.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Preview da Grade */}
                                {gradeAtacadoObj && (
                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {gradeAtacadoObj.tamanhos.map((t, idx) => (
                                                <Badge key={idx} variant="secondary" className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                                                    {t.tamanho}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-purple-200/70">
                                            <Info className="h-3 w-3" /> 
                                            <span>Essa grade possui {gradeAtacadoObj.tamanhos.length} tamanhos distintos.</span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs">Qtd. por Tamanho</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Input 
                                                type="number" 
                                                min="1"
                                                {...register('atacado_grade_qtd_por_tamanho')}
                                                className="bg-white/5 border-white/10"
                                            />
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">pçs cada</span>
                                        </div>
                                    </div>
                                    
                                    {!usarPrecoUnico && (
                                        <div>
                                            <Label className="text-xs">Preço Unitário Grade (R$)</Label>
                                            <Input 
                                                type="number" 
                                                step="0.01" 
                                                {...register('preco_atacado_grade')}
                                                className="bg-white/5 border-white/10 mt-1"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Card de Totalização */}
                                <div className="bg-black/40 rounded-lg p-4 border border-white/10 flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2"><Box className="h-4 w-4" /> Total de Peças no Pacote:</span>
                                        <span className="font-bold text-white">{totalPecasPacote} peças</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" /> Preço Unitário Aplicado:</span>
                                        <span className="font-mono text-emerald-400">
                                            R$ {(usarPrecoUnico ? Number(precoAtacadoGeral) : Number(precoAtacadoGrade)).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="h-px bg-white/10 my-1" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-white">Valor Total do Pacote</span>
                                        <span className="font-bold text-lg text-emerald-400">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalPacote)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                  </div>

                  {/* Categorização Simplificada */}
                  <div className="grid gap-4 p-4 border border-white/10 rounded-xl bg-white/5 col-span-2">
                       <h3 className="font-semibold text-emerald-400">Classificação</h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {/* Subcategoria é o principal agora */}
                           <div className="grid gap-2">
                            <Label>Subcategoria & Categoria <span className="text-xs text-muted-foreground">(Preenche fiscal)</span></Label>
                            <Select onValueChange={(value) => setValue('subcategoria_id', value)}>
                                <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
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
                            <Label>Marca</Label>
                            <Select onValueChange={(value) => setValue('marca_id', value)}>
                                <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                {brands?.map(brand => <SelectItem key={brand.id} value={String(brand.id)}>{brand.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                           </div>
                           <div className="grid gap-2">
                            <Label>Grade Física (Opcional)</Label>
                            <Select 
                                onValueChange={(value) => setValue('grade_id', value)} 
                                value={selectedGridId}
                            >
                                <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">Nenhuma</SelectItem>
                                    {grids?.map(grid => <SelectItem key={grid.id} value={String(grid.id)}>{grid.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground">Define variações de estoque físico. Diferente da grade de pacote.</p>
                           </div>
                       </div>
                  </div>
                </div>
            </TabsContent>

            {/* DADOS FISCAIS */}
            <TabsContent value="fiscal" className="animate-in fade-in slide-in-from-bottom-4">
              <div className="grid gap-6 p-6 border border-white/10 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 mb-4 text-emerald-400">
                    <Info className="h-5 w-5" />
                    <p className="text-sm">Estes dados foram carregados automaticamente da Subcategoria selecionada, mas você pode alterá-los.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="ncm">NCM</Label>
                        <Input id="ncm" {...register('ncm')} className="bg-black/20 border-white/10" placeholder="00000000" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cfop_padrao">CFOP Padrão</Label>
                        <Input id="cfop_padrao" {...register('cfop_padrao')} className="bg-black/20 border-white/10" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cst_icms">CST/CSOSN</Label>
                        <Input id="cst_icms" {...register('cst_icms')} className="bg-black/20 border-white/10" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Origem</Label>
                        <Select onValueChange={(v) => setValue('origem', v)}>
                             <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="0">0 - Nacional</SelectItem>
                                <SelectItem value="1">1 - Importada</SelectItem>
                             </SelectContent>
                        </Select>
                    </div>
                     <div className="grid gap-2">
                        <Label>Unidade de Medida</Label>
                         <Input id="unidade_medida" {...register('unidade_medida')} className="bg-black/20 border-white/10" placeholder="UN" />
                    </div>
                  </div>
              </div>
            </TabsContent>

            {/* DIMENSÕES */}
            <TabsContent value="dimensions" className="animate-in fade-in slide-in-from-bottom-4">
               <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                  {selectedGridId && selectedGridId !== 'null' && selectedGridId !== "null" ? (
                      <Alert className="mb-6 bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Dimensões Dinâmicas</AlertTitle>
                        <AlertDescription>
                            Você selecionou uma grade. O peso e as dimensões serão calculados automaticamente no pedido baseados no tamanho escolhido pelo cliente (herdando da configuração da Grade).
                        </AlertDescription>
                      </Alert>
                  ) : (
                      <p className="text-muted-foreground mb-6">Preencha as dimensões da embalagem para cálculo de frete (produto único sem grade).</p>
                  )}

                  <div className={`grid gap-6 md:grid-cols-2 ${selectedGridId && selectedGridId !== 'null' && selectedGridId !== "null" ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                    <div className="grid gap-2">
                        <Label htmlFor="peso_kg">Peso Bruto (kg)</Label>
                        <Input id="peso_kg" type="number" step="0.001" {...register('peso_kg')} className="bg-black/20 border-white/10" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="altura_cm">Altura (cm)</Label>
                        <Input id="altura_cm" type="number" step="0.1" {...register('altura_cm')} className="bg-black/20 border-white/10" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="largura_cm">Largura (cm)</Label>
                        <Input id="largura_cm" type="number" step="0.1" {...register('largura_cm')} className="bg-black/20 border-white/10" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="comprimento_cm">Comprimento (cm)</Label>
                        <Input id="comprimento_cm" type="number" step="0.1" {...register('comprimento_cm')} className="bg-black/20 border-white/10" />
                    </div>
                  </div>
               </div>
            </TabsContent>

            {/* IMAGENS */}
            <TabsContent value="images" className="animate-in fade-in slide-in-from-bottom-4">
              <div className="grid gap-6 p-6 border border-white/10 rounded-xl bg-white/5">
                  <div className="grid gap-2">
                    <Label htmlFor="imagem_principal">URL da Imagem Principal</Label>
                    <Input id="imagem_principal" placeholder="https://exemplo.com/imagem.jpg" {...register('imagem_principal')} className="bg-black/20 border-white/10" />
                    <p className="text-xs text-muted-foreground">Cole a URL direta da imagem.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="imagens_galeria">URLs da Galeria (separadas por vírgula)</Label>
                    <Textarea id="imagens_galeria" placeholder="https://exemplo.com/img1.jpg, https://exemplo.com/img2.jpg" {...register('imagens_galeria')} className="bg-black/20 border-white/10 min-h-[100px]" />
                  </div>
              </div>
            </TabsContent>
        </Tabs>
      </div>
    </form>
  );
}