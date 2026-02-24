import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Tag, FolderTree, ArrowRight, Trash2 } from 'lucide-react';
import { useCategories, useSubcategories } from '@/hooks/use-categories';
import { useCreateCategory, useDeleteCategory, useCreateSubcategory } from '@/hooks/use-category-mutations';
import { Skeleton } from '@/components/ui/skeleton';
import { Category, Subcategory } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CategoryPage() {
  // Hooks de Dados
  const { data: categories, isLoading: isLoadingCats } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { data: subcategories, isLoading: isLoadingSubs } = useSubcategories(selectedCategory?.id || null);

  // Hooks de Mutação
  const { mutate: createCategory, isPending: isCreatingCat } = useCreateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: createSubcategory, isPending: isCreatingSub } = useCreateSubcategory();

  // Estados de UI
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);

  // Forms
  const { register: registerCat, handleSubmit: handleCatSubmit, reset: resetCat } = useForm<{ nome: string }>();
  const { register: registerSub, handleSubmit: handleSubSubmit, reset: resetSub, setValue: setSubValue } = useForm<Omit<Subcategory, 'id' | 'categoria_id'>>();

  // Handlers
  const onCatSubmit = (data: { nome: string }) => {
    createCategory(data, {
      onSuccess: () => {
        setIsCatDialogOpen(false);
        resetCat();
      }
    });
  };

  const onSubSubmit = (data: Omit<Subcategory, 'id' | 'categoria_id'>) => {
    if (!selectedCategory) return;
    
    createSubcategory({ ...data, categoria_id: selectedCategory.id }, {
      onSuccess: () => {
        setIsSubDialogOpen(false);
        resetSub();
      }
    });
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorias & Fiscal</h1>
          <p className="text-muted-foreground">Gerencie a árvore de produtos e tributação padrão.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
        
        {/* COLUNA ESQUERDA: CATEGORIAS */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tag className="h-4 w-4 text-emerald-500" /> Categorias
            </CardTitle>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsCatDialogOpen(true)}>
              <PlusCircle className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-4 pb-4">
              {isLoadingCats ? (
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-1 pt-2">
                  {categories?.map(cat => (
                    <div 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        selectedCategory?.id === cat.id 
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-medium' 
                          : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                      }`}
                    >
                      <span className="truncate">{cat.nome}</span>
                      {selectedCategory?.id === cat.id && <ArrowRight className="h-4 w-4 opacity-50" />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* COLUNA DIREITA: SUBCATEGORIAS */}
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-emerald-500" /> 
                {selectedCategory ? `Subcategorias de: ${selectedCategory.nome}` : 'Selecione uma Categoria'}
              </CardTitle>
              {selectedCategory && (
                <CardDescription>Configure os dados fiscais padrão para esta linha.</CardDescription>
              )}
            </div>
            {selectedCategory && (
              <Button size="sm" className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30" onClick={() => setIsSubDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Subcategoria
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {!selectedCategory ? (
              <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
                <Tag className="h-12 w-12 opacity-20" />
                <p>Selecione uma categoria à esquerda para ver suas subcategorias.</p>
              </div>
            ) : isLoadingSubs ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : subcategories?.length === 0 ? (
               <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
                <p>Nenhuma subcategoria encontrada.</p>
                <Button variant="link" onClick={() => setIsSubDialogOpen(true)}>Criar a primeira</Button>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                  {subcategories?.map(sub => (
                    <div key={sub.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-white">{sub.nome}</h3>
                        <Badge variant="outline" className="text-xs font-mono">{sub.ncm}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-3">
                        <div>
                          <span className="block opacity-50">CFOP</span>
                          <span className="text-foreground">{sub.cfop_padrao}</span>
                        </div>
                        <div>
                          <span className="block opacity-50">CST/CSOSN</span>
                          <span className="text-foreground">{sub.cst_icms}</span>
                        </div>
                        <div>
                          <span className="block opacity-50">Origem</span>
                          <span className="text-foreground">{sub.origem}</span>
                        </div>
                        <div>
                          <span className="block opacity-50">Und.</span>
                          <span className="text-foreground">{sub.unidade_medida}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DIALOG: Nova Categoria */}
      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
          <form onSubmit={handleCatSubmit(onCatSubmit)} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input {...registerCat('nome', { required: true })} placeholder="Ex: Roupas" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreatingCat}>Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Nova Subcategoria */}
      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Subcategoria</DialogTitle>
            <DialogDescription>Define a classificação fiscal padrão para produtos desta subcategoria.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubSubmit(onSubSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome da Subcategoria</Label>
                <Input id="nome" {...registerSub('nome', { required: true })} placeholder="Ex: Calça Jeans" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                  <Label htmlFor="ncm">NCM (8 dígitos)</Label>
                  <Input id="ncm" {...registerSub('ncm', { required: true, minLength: 8, maxLength: 8 })} placeholder="00000000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cfop">CFOP Padrão</Label>
                   <Select onValueChange={(v) => setSubValue('cfop_padrao', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5102">5102 - Venda Mercadoria</SelectItem>
                      <SelectItem value="5405">5405 - Venda ST</SelectItem>
                      <SelectItem value="6102">6102 - Venda Interestadual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                  <Label>CST/CSOSN</Label>
                  <Select onValueChange={(v) => setSubValue('cst_icms', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="102">102 - Tributada SN</SelectItem>
                      <SelectItem value="300">300 - Imune</SelectItem>
                      <SelectItem value="400">400 - Não Tributada</SelectItem>
                      <SelectItem value="00">00 - Tributada Integralmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Origem</Label>
                  <Select onValueChange={(v) => setSubValue('origem', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - Nacional</SelectItem>
                      <SelectItem value="1">1 - Estrangeira (Importação direta)</SelectItem>
                      <SelectItem value="2">2 - Estrangeira (Adq. no mercado interno)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

               <div className="grid gap-2">
                  <Label>Unidade de Medida</Label>
                  <Select onValueChange={(v) => setSubValue('unidade_medida', v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UN">UN - Unidade</SelectItem>
                      <SelectItem value="KG">KG - Quilograma</SelectItem>
                      <SelectItem value="MT">MT - Metro</SelectItem>
                      <SelectItem value="CX">CX - Caixa</SelectItem>
                      <SelectItem value="PC">PC - Peça</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSubDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isCreatingSub}>Salvar Fiscal & Subcategoria</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}