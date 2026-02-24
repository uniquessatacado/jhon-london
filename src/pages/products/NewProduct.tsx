import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package, FileText, Ruler, Image, Check, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { useCategories, useSubcategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { useGrids } from '@/hooks/use-grids';
import { useCreateProduct } from '@/hooks/use-create-product';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function NewProductPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, control, setValue, watch, resetField } = useForm();
  
  // Hooks de Dados
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: grids } = useGrids();
  
  // Watchers para lógica condicional
  const selectedCategoryId = watch('categoria_id');
  const selectedSubcategoryId = watch('subcategoria_id');
  const selectedGridId = watch('grade_id');

  // Buscar subcategorias quando categoria muda
  const { data: subcategories, isLoading: isLoadingSubs } = useSubcategories(selectedCategoryId ? Number(selectedCategoryId) : null);
  const { mutate: createProduct, isPending } = useCreateProduct();

  // EFEITO 1: Preenchimento Automático Fiscal
  useEffect(() => {
    if (selectedSubcategoryId && subcategories) {
      const sub = subcategories.find(s => String(s.id) === String(selectedSubcategoryId));
      if (sub) {
        // Preenche os campos fiscais mas deixa editável
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
    // Se a categoria mudar, limpa a subcategoria selecionada
    setValue('subcategoria_id', '');
  }, [selectedCategoryId, setValue]);

  const onSubmit = (data: any) => {
    // Limpeza de dados antes do envio
    const payload = {
        ...data,
        // Se tiver grade, zera dimensões manuais para evitar lixo
        peso_kg: selectedGridId ? 0 : data.peso_kg,
        altura_cm: selectedGridId ? 0 : data.altura_cm,
        largura_cm: selectedGridId ? 0 : data.largura_cm,
        comprimento_cm: selectedGridId ? 0 : data.comprimento_cm,
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
            <p className="text-muted-foreground">Cadastre produtos com inteligência fiscal e de grade.</p>
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
                      <h3 className="font-semibold text-emerald-400">Financeiro</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="preco_custo">Custo (R$)</Label>
                            <Input id="preco_custo" type="number" step="0.01" {...register('preco_custo')} className="bg-black/20 border-white/10" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="preco_varejo">Venda (R$)</Label>
                            <Input id="preco_varejo" type="number" step="0.01" {...register('preco_varejo', { required: true })} className="bg-black/20 border-white/10" />
                        </div>
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

                  {/* Categorização */}
                  <div className="grid gap-4 p-4 border border-white/10 rounded-xl bg-white/5">
                       <h3 className="font-semibold text-emerald-400">Classificação</h3>
                       
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

                       <div className="grid grid-cols-2 gap-4">
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