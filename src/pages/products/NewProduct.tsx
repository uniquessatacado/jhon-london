import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Package, FileText, Ruler, Image, Check, ArrowLeft } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { useBrands } from '@/hooks/use-brands';
import { useCreateProduct } from '@/hooks/use-create-product';
import { Skeleton } from '@/components/ui/skeleton';

export function NewProductPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, control, setValue } = useForm();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: brands, isLoading: isLoadingBrands } = useBrands();
  const { mutate: createProduct, isPending } = useCreateProduct();

  const onSubmit = (data: any) => {
    createProduct(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
           <Button type="button" variant="outline" size="icon" onClick={() => navigate('/produtos')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Novo Produto</h1>
            <p className="text-muted-foreground">Preencha os dados para cadastrar um novo produto.</p>
          </div>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="basic"><Package className="mr-2 h-4 w-4" />Dados Básicos</TabsTrigger>
              <TabsTrigger value="fiscal"><FileText className="mr-2 h-4 w-4" />Fiscal</TabsTrigger>
              <TabsTrigger value="dimensions"><Ruler className="mr-2 h-4 w-4" />Dimensões</TabsTrigger>
              <TabsTrigger value="images"><Image className="mr-2 h-4 w-4" />Imagens</TabsTrigger>
            </TabsList>
            
            {/* DADOS BÁSICOS */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Básicos</CardTitle>
                  <CardDescription>Informações essenciais do produto.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="grid gap-2 col-span-2">
                    <Label htmlFor="nome">Nome do Produto</Label>
                    <Input id="nome" {...register('nome', { required: true })} />
                    {errors.nome && <p className="text-sm text-red-500">Nome é obrigatório.</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" {...register('sku')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="codigo_barras">Código de Barras (EAN)</Label>
                    <Input id="codigo_barras" {...register('codigo_barras')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="preco_custo">Preço de Custo</Label>
                    <Input id="preco_custo" type="number" step="0.01" {...register('preco_custo')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="preco_varejo">Preço de Varejo</Label>
                    <Input id="preco_varejo" type="number" step="0.01" {...register('preco_varejo', { required: true })} />
                    {errors.preco_varejo && <p className="text-sm text-red-500">Preço de varejo é obrigatório.</p>}
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="estoque">Estoque Atual</Label>
                    <Input id="estoque" type="number" {...register('estoque', { required: true })} />
                     {errors.estoque && <p className="text-sm text-red-500">Estoque é obrigatório.</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                    <Input id="estoque_minimo" type="number" {...register('estoque_minimo')} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Categoria</Label>
                    {isLoadingCategories ? <Skeleton className="h-10 w-full" /> : (
                      <Select onValueChange={(value) => setValue('categoria_id', value)}>
                        <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                        <SelectContent>
                          {categories?.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label>Marca</Label>
                     {isLoadingBrands ? <Skeleton className="h-10 w-full" /> : (
                      <Select onValueChange={(value) => setValue('marca_id', value)}>
                        <SelectTrigger><SelectValue placeholder="Selecione uma marca" /></SelectTrigger>
                        <SelectContent>
                          {brands?.map(brand => <SelectItem key={brand.id} value={String(brand.id)}>{brand.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* DADOS FISCAIS */}
            <TabsContent value="fiscal">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Fiscais</CardTitle>
                  <CardDescription>Informações para emissão de nota fiscal.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="ncm">NCM</Label>
                    <Input id="ncm" {...register('ncm')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cfop_padrao">CFOP Padrão</Label>
                    <Input id="cfop_padrao" {...register('cfop_padrao')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cst_icms">CST/CSOSN</Label>
                    <Input id="cst_icms" {...register('cst_icms')} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Origem da Mercadoria</Label>
                    <Select onValueChange={(value) => setValue('origem', value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione a origem" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 - Nacional</SelectItem>
                        <SelectItem value="1">1 - Estrangeira - Importação direta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid gap-2">
                    <Label>Unidade de Medida</Label>
                    <Select onValueChange={(value) => setValue('unidade_medida', value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UN">UN - Unidade</SelectItem>
                        <SelectItem value="CX">CX - Caixa</SelectItem>
                        <SelectItem value="KG">KG - Quilograma</SelectItem>
                        <SelectItem value="PC">PC - Peça</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* DIMENSÕES */}
            <TabsContent value="dimensions">
              <Card>
                <CardHeader>
                  <CardTitle>Dimensões</CardTitle>
                  <CardDescription>Peso e medidas para cálculo de frete.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="peso_kg">Peso (kg)</Label>
                    <Input id="peso_kg" type="number" step="0.001" {...register('peso_kg')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="altura_cm">Altura (cm)</Label>
                    <Input id="altura_cm" type="number" step="0.1" {...register('altura_cm')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="largura_cm">Largura (cm)</Label>
                    <Input id="largura_cm" type="number" step="0.1" {...register('largura_cm')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="comprimento_cm">Comprimento (cm)</Label>
                    <Input id="comprimento_cm" type="number" step="0.1" {...register('comprimento_cm')} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* IMAGENS */}
            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle>Imagens</CardTitle>
                  <CardDescription>Insira as URLs das imagens do produto.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="imagem_principal">URL da Imagem Principal</Label>
                    <Input id="imagem_principal" placeholder="https://exemplo.com/imagem.jpg" {...register('imagem_principal')} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="imagens_galeria">URLs da Galeria (separadas por vírgula)</Label>
                    <Textarea id="imagens_galeria" placeholder="https://exemplo.com/img1.jpg, https://exemplo.com/img2.jpg" {...register('imagens_galeria')} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <Button size="lg" type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : <><Check className="mr-2 h-4 w-4" /> Salvar Produto</>}
        </Button>
      </div>
    </form>
  );
}