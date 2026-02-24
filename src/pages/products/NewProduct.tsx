import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Package, FileText, Ruler, Image, Check, ArrowLeft, AlertCircle, Info, ShoppingBag } from 'lucide-react';
import { useCategories, useSubcategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { useGrids } from '@/hooks/use-grids';
import { useCreateProduct } from '@/hooks/use-create-product';
import { api } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function NewProductPage() {
  const navigate = useNavigate();
  // Using <any> to avoid strict type inference errors since defaultValues is partial
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<any>({
    defaultValues: {
      qtd_minima_atacado_grade: 6,
      habilita_atacado_geral: false,
      habilita_atacado_grade: false,
      estoque: 0,
      estoque_minimo: 0,
      preco_custo: 0,
      preco_varejo: 0,
      preco_atacado: 0
    }
  });
  
  // Hooks de Dados
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: grids } = useGrids();
  const { mutate: createProduct, isPending } = useCreateProduct();

  // Estado local para config global (apenas visualização)
  const [globalAtacadoMin, setGlobalAtacadoMin] = useState('10');

  useEffect(() => {
    // Buscar config global para mostrar no tooltip
    api.get('/configuracoes/qtd_minima_atacado_geral')
      .then(res => setGlobalAtacadoMin(res.data?.valor || '10'))
      .catch(() => {});
  }, []);
  
  // Watchers
  const selectedCategoryId = watch('categoria_id');
  const selectedSubcategoryId = watch('subcategoria_id');
  const selectedGridId = watch('grade_id');
  
  const habilitaAtacadoGeral = watch('habilita_atacado_geral');
  const habilitaAtacadoGrade = watch('habilita_atacado_grade');

  // Buscar subcategorias quando categoria muda
  const { data: subcategories, isLoading: isLoadingSubs } = useSubcategories(selectedCategoryId ? Number(selectedCategoryId) : null);

  // EFEITO 1: Preenchimento Automático Fiscal
  useEffect(() => {
    if (selectedSubcategoryId && subcategories) {
      const sub = subcategories.find(s => String(s.id) === String(selectedSubcategoryId));
      if (sub) {
        setValue('ncm', sub.ncm);
        setValue('cfop_padrao', sub.cfop_padrao);
        setValue('cst_icms', sub.cst_icms);
        setValue('origem', sub.origem);
        setValue('unidade_medida', sub.unidade_medida);
      }
    }
  }, [selectedSubcategoryId, subcategories, setValue]);

  // EFEITO 2: Resetar subcategoria se mudar categoria
  useEffect(() => {
    setValue('subcategoria_id', '');
  }, [selectedCategoryId, setValue]);

  const onSubmit = (data: any) => {
    const payload = {
        ...data,
        peso_kg: selectedGridId ? 0 : data.peso_kg,
        altura_cm: selectedGridId ? 0 : data.altura_cm,
        largura_cm: selectedGridId ? 0 : data.largura_cm,
        comprimento_cm: selectedGridId ? 0 : data.comprimento_cm,
        // Garantir numéricos
        preco_atacado: Number(data.preco_atacado) || 0,
        qtd_minima_atacado_grade: Number(data.qtd_minima_atacado_grade) || 6,
    };
    createProduct(payload);
  };

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

                  {/* Preços e Estoque */}
                  <div className="grid gap-4 p-4 border border-white/10 rounded-xl bg-white/5">
                      <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                        <span className="p-1 bg-emerald-500/10 rounded">R$</span> Financeiro
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="preco_custo">Custo (R$)</Label>
                            <Input id="preco_custo" type="number" step="0.01" {...register('preco_custo')} className="bg-black/20 border-white/10" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="preco_varejo">Venda Varejo (R$)</Label>
                            <Input id="preco_varejo" type="number" step="0.01" {...register('preco_varejo', { required: true })} className="bg-black/20 border-white/10 font-bold text-emerald-400" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="preco_atacado">Venda Atacado (R$)</Label>
                            <Input 
                                id="preco_atacado" 
                                type="number" 
                                step="0.01" 
                                {...register('preco_atacado', { required: habilitaAtacadoGeral || habilitaAtacadoGrade })} 
                                className={`bg-black/20 border-white/10 ${(habilitaAtacadoGeral || habilitaAtacadoGrade) ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : ''}`} 
                                placeholder="0.00"
                            />
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

                  {/* Regras de Atacado */}
                  <div className="grid gap-4 p-4 border border-white/10 rounded-xl bg-white/5">
                    <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" /> Regras de Atacado
                    </h3>
                    
                    {/* Atacado Geral */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-black/20 border border-white/5">
                        <Switch 
                            id="habilita_atacado_geral" 
                            checked={habilitaAtacadoGeral}
                            onCheckedChange={(c) => setValue('habilita_atacado_geral', c)}
                        />
                        <div className="grid gap-1">
                            <Label htmlFor="habilita_atacado_geral" className="font-medium cursor-pointer">Habilitar Atacado Geral</Label>
                            <p className="text-xs text-muted-foreground">
                                Permite misturar com outros modelos. Ativa quando o carrinho tiver <strong>{globalAtacadoMin}+ peças</strong> no total.
                            </p>
                        </div>
                    </div>

                    {/* Atacado Grade */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-black/20 border border-white/5">
                        <Switch 
                             id="habilita_atacado_grade" 
                             checked={habilitaAtacadoGrade}
                             onCheckedChange={(c) => setValue('habilita_atacado_grade', c)}
                        />
                        <div className="grid gap-1 flex-1">
                            <Label htmlFor="habilita_atacado_grade" className="font-medium cursor-pointer">Habilitar Atacado por Grade</Label>
                            <p className="text-xs text-muted-foreground">
                                Preço de atacado válido apenas se comprar a quantidade mínima DESTE produto específico.
                            </p>
                            
                            {habilitaAtacadoGrade && (
                                <div className="mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                    <Label htmlFor="qtd_minima_atacado_grade" className="text-xs whitespace-nowrap">Qtd. Mínima:</Label>
                                    <Input 
                                        id="qtd_minima_atacado_grade" 
                                        type="number" 
                                        className="h-7 w-20 bg-white/5 border-white/10 text-xs" 
                                        {...register('qtd_minima_atacado_grade')} 
                                    />
                                    <span className="text-xs text-muted-foreground">peças</span>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>

                  {/* Categorização */}
                  <div className="grid gap-4 p-4 border border-white/10 rounded-xl bg-white/5 col-span-2">
                       <h3 className="font-semibold text-emerald-400">Classificação</h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="grid gap-2">
                            <Label>Categoria</Label>
                            <Select onValueChange={(value) => setValue('categoria_id', value)}>
                                <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                {categories?.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                           </div>

                           <div className="grid gap-2">
                            <Label>Subcategoria <span className="text-xs text-muted-foreground">(Preenche fiscal)</span></Label>
                            <Select onValueChange={(value) => setValue('subcategoria_id', value)} disabled={!selectedCategoryId || isLoadingSubs}>
                                <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder={!selectedCategoryId ? "Selecione a categoria primeiro" : "Selecione..."} /></SelectTrigger>
                                <SelectContent>
                                {subcategories?.map(sub => <SelectItem key={sub.id} value={String(sub.id)}>{sub.nome}</SelectItem>)}
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
                            <Label>Grade (Opcional)</Label>
                            <Select onValueChange={(value) => setValue('grade_id', value)}>
                                <SelectTrigger className="bg-black/20 border-white/10"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">Nenhuma</SelectItem>
                                    {grids?.map(grid => <SelectItem key={grid.id} value={String(grid.id)}>{grid.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
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
                  {selectedGridId && selectedGridId !== 'null' ? (
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

                  <div className={`grid gap-6 md:grid-cols-2 ${selectedGridId && selectedGridId !== 'null' ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
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