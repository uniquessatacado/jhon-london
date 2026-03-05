import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Tag, FolderTree, ArrowRight, Pencil, Grid as GridIcon, Loader2, Copy, Trash2 } from 'lucide-react';
import { useCategories, useSubcategories } from '@/hooks/use-categories';
import { useCreateCategory, useUpdateCategory, useDeleteCategory, useCreateSubcategory, useUpdateSubcategory, useDeleteSubcategory } from '@/hooks/use-category-mutations';
import { useGrids } from '@/hooks/use-grids';
import { Skeleton } from '@/components/ui/skeleton';
import { Category, Subcategory } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export function CategoryPage() {
  const queryClient = useQueryClient();

  const { data: categories, isLoading: isLoadingCats } = useCategories();
  const { data: grids } = useGrids();
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { data: subcategories, isLoading: isLoadingSubs } = useSubcategories(selectedCategory?.id || null);

  const { mutate: createCategory, isPending: isCreatingCat } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdatingCat } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  
  const { mutate: createSubcategory, isPending: isCreatingSub } = useCreateSubcategory();
  const { mutate: updateSubcategory, isPending: isUpdatingSub } = useUpdateSubcategory();
  const { mutate: deleteSubcategory } = useDeleteSubcategory();

  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);

  const { register: registerCat, handleSubmit: handleCatSubmit, reset: resetCat } = useForm<{ nome: string }>();
  const { register: registerSub, handleSubmit: handleSubSubmit, reset: resetSub, control: controlSub } = useForm<any>();

  const handleOpenCatDialog = (cat: Category | null = null) => {
    if (cat) {
      setEditingCat(cat);
      resetCat({ nome: cat.nome });
    } else {
      setEditingCat(null);
      resetCat({ nome: '' });
    }
    setIsCatDialogOpen(true);
  };

  const onCatSubmit = (data: { nome: string }) => {
    if (editingCat) {
      updateCategory({ id: editingCat.id, ...data }, {
        onSuccess: () => {
          setIsCatDialogOpen(false);
          resetCat();
          setEditingCat(null);
        }
      });
    } else {
      createCategory(data, {
        onSuccess: () => {
          setIsCatDialogOpen(false);
          resetCat();
        }
      });
    }
  };

  const handleOpenSubDialog = (sub: Subcategory | null = null) => {
    if (sub) {
        setEditingSub(sub);
        // Garante que se o Kimi mandar null, a gente força a string "null" pro Select entender
        resetSub({
            nome: sub.nome,
            ncm: sub.ncm,
            cfop_padrao: sub.cfop_padrao,
            cst_icms: sub.cst_icms,
            origem: String(sub.origem),
            unidade_medida: sub.unidade_medida,
            grade_id: (sub.grade_id && sub.grade_id !== null) ? String(sub.grade_id) : "null"
        });
    } else {
        setEditingSub(null);
        resetSub({
            nome: '',
            ncm: '',
            cfop_padrao: '',
            cst_icms: '',
            origem: '',
            unidade_medida: '',
            grade_id: "null"
        });
    }
    setIsSubDialogOpen(true);
  };

  const handleCloneSub = (subToClone: Subcategory) => {
    setEditingSub(null); // NULL = Criar Nova
    resetSub({
        nome: `${subToClone.nome} - Cópia`,
        ncm: subToClone.ncm,
        cfop_padrao: subToClone.cfop_padrao,
        cst_icms: subToClone.cst_icms,
        origem: String(subToClone.origem),
        unidade_medida: subToClone.unidade_medida,
        grade_id: (subToClone.grade_id && subToClone.grade_id !== null) ? String(subToClone.grade_id) : "null"
    });
    setIsSubDialogOpen(true);
  };

  const onSubSubmit = (data: any) => {
    if (!selectedCategory) return;
    
    const ncmClean = data.ncm ? String(data.ncm).replace(/\D/g, '') : '';
    
    if (ncmClean.length !== 8) {
        toast.error('NCM Inválido', { description: 'O NCM deve conter exatamente 8 números.' });
        return;
    }

    if (!data.cfop_padrao || !data.cst_icms || !data.origem || !data.unidade_medida) {
        toast.error('Campos Obrigatórios', { description: 'Por favor, selecione todas as opções fiscais.' });
        return;
    }

    const payload = { 
        ...data, 
        ncm: ncmClean, 
        categoria_id: selectedCategory.id,
        // Traduz a string "null" para o null de verdade que o banco de dados gosta
        grade_id: (data.grade_id === "null" || !data.grade_id) ? null : Number(data.grade_id)
    };

    const handleSuccess = () => {
        setIsSubDialogOpen(false);
        resetSub();
        setEditingSub(null);
    };

    if (editingSub) {
        updateSubcategory({ id: editingSub.id, ...payload }, { onSuccess: handleSuccess });
    } else {
        createSubcategory(payload, { onSuccess: handleSuccess });
    }
  };

  const isSavingCat = isCreatingCat || isUpdatingCat;
  const isSavingSub = isCreatingSub || isUpdatingSub;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorias & Fiscal</h1>
          <p className="text-muted-foreground">Gerencie a árvore de produtos e tributação padrão.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0 md:min-h-[500px]">
        
        {/* COLUNA ESQUERDA: CATEGORIAS */}
        <Card className="bg-black/20 border-white/10 flex flex-col h-[300px] md:h-full shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Tag className="h-5 w-5 text-emerald-500" /> Categorias
            </CardTitle>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 text-emerald-400" onClick={() => handleOpenCatDialog()}>
              <PlusCircle className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full px-4 py-4">
              {isLoadingCats ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
                  <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
                </div>
              ) : categories?.length === 0 ? (
                <div className="text-center text-muted-foreground mt-10">Nenhuma categoria.</div>
              ) : (
                <div className="space-y-2">
                  {categories?.map(cat => (
                    <div 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                        selectedCategory?.id === cat.id 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold shadow-sm' 
                          : 'bg-white/5 border-transparent hover:border-white/10 text-white'
                      }`}
                    >
                      <span className="truncate flex-1">{cat.nome}</span>
                      
                      <div className="flex items-center gap-2">
                        <div className="hidden group-hover:flex items-center gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-emerald-400 hover:bg-emerald-500/20" 
                            onClick={(e) => { e.stopPropagation(); handleOpenCatDialog(cat); }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-red-400 hover:bg-red-500/20" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setCategoryToDelete(cat); 
                              if (selectedCategory?.id === cat.id) setSelectedCategory(null);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        {selectedCategory?.id === cat.id && <ArrowRight className="h-4 w-4" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* COLUNA DIREITA: SUBCATEGORIAS */}
        <Card className="col-span-1 md:col-span-2 bg-black/20 border-white/10 flex flex-col h-[500px] md:h-full shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <FolderTree className="h-5 w-5 text-emerald-500" /> 
                {selectedCategory ? `Subcategorias de: ${selectedCategory.nome}` : 'Selecione uma Categoria'}
              </CardTitle>
              {selectedCategory && (
                <CardDescription>Configure os dados fiscais padrão para esta linha de produtos.</CardDescription>
              )}
            </div>
            {selectedCategory && (
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" onClick={() => handleOpenSubDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nova Subcategoria
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            {!selectedCategory ? (
              <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
                <Tag className="h-16 w-16 opacity-20" />
                <p>Selecione uma categoria à esquerda para ver suas subcategorias.</p>
              </div>
            ) : isLoadingSubs ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-24 w-full bg-white/5 rounded-2xl" />
                <Skeleton className="h-24 w-full bg-white/5 rounded-2xl" />
              </div>
            ) : subcategories?.length === 0 ? (
               <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
                <p>Nenhuma subcategoria encontrada nesta categoria.</p>
                <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleOpenSubDialog()}>Criar a primeira</Button>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                  {subcategories?.map(sub => (
                    <div key={sub.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group relative">
                      
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button 
                            type="button"
                            size="icon" 
                            variant="ghost" 
                            title="Clonar Subcategoria"
                            className="h-8 w-8 bg-black/40 hover:bg-white/10 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); handleCloneSub(sub); }}
                         >
                            <Copy className="h-4 w-4 text-blue-400" />
                         </Button>
                         <Button 
                            type="button"
                            size="icon" 
                            variant="ghost" 
                            title="Editar Subcategoria"
                            className="h-8 w-8 bg-black/40 hover:bg-white/10 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); handleOpenSubDialog(sub); }}
                         >
                            <Pencil className="h-4 w-4 text-emerald-400" />
                         </Button>
                         <Button 
                            type="button"
                            size="icon" 
                            variant="ghost" 
                            title="Excluir Subcategoria"
                            className="h-8 w-8 bg-black/40 hover:bg-red-500/20 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); setSubcategoryToDelete(sub); }}
                         >
                            <Trash2 className="h-4 w-4 text-red-400" />
                         </Button>
                      </div>

                      <div className="flex items-start justify-between mb-4 pr-24">
                        <div>
                            <h3 className="font-bold text-lg text-white">{sub.nome}</h3>
                            {sub.grade_id && (
                                <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs font-medium">
                                    <GridIcon className="h-3 w-3" />
                                    <span>{grids?.find(g => g.id === sub.grade_id)?.nome || 'Grade Vinculada'}</span>
                                </div>
                            )}
                        </div>
                        <Badge variant="outline" className="bg-black/40 border-white/10 text-xs font-mono">{sub.ncm}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-muted-foreground bg-black/40 p-3 rounded-xl border border-white/5">
                        <div><span className="block opacity-60 mb-0.5">CFOP</span><span className="text-white font-medium">{sub.cfop_padrao}</span></div>
                        <div><span className="block opacity-60 mb-0.5">CST/CSOSN</span><span className="text-white font-medium">{sub.cst_icms}</span></div>
                        <div><span className="block opacity-60 mb-0.5">Origem</span><span className="text-white font-medium">{sub.origem}</span></div>
                        <div><span className="block opacity-60 mb-0.5">Unidade</span><span className="text-white font-medium">{sub.unidade_medida}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* DIALOG CATEGORIA */}
      <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
        <DialogContent className="bg-zinc-950 border-white/10">
          <DialogHeader><DialogTitle>{editingCat ? 'Editar Categoria' : 'Nova Categoria Principal'}</DialogTitle></DialogHeader>
          <form onSubmit={handleCatSubmit(onCatSubmit)} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input {...registerCat('nome', { required: true })} placeholder="Ex: Roupas, Acessórios..." className="bg-black/40 border-white/10 h-12" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="bg-transparent border-white/10 hover:bg-white/5" onClick={() => setIsCatDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSavingCat} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {isSavingCat ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG SUBCATEGORIA */}
      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col bg-zinc-950 border-white/10 p-6">
          <DialogHeader className="shrink-0 pb-2">
            <DialogTitle>{editingSub ? 'Editar Subcategoria' : 'Nova Subcategoria'}</DialogTitle>
            <DialogDescription>Define a classificação fiscal e grade padrão. Produtos cadastrados aqui herdarão essas regras.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubSubmit(onSubSubmit)} className="flex flex-col flex-1 overflow-hidden mt-2">
            <div className="flex-1 overflow-y-auto pr-2 pb-2">
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="nome">Nome da Subcategoria</Label>
                      <Input id="nome" {...registerSub('nome', { required: true })} placeholder="Ex: Camisetas" className="bg-black/40 border-white/10 h-12" />
                  </div>
                  <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                          <GridIcon className="h-3 w-3" /> Grade Padrão (Opcional)
                      </Label>
                      <Controller
                        control={controlSub}
                        name="grade_id"
                        render={({ field }) => (
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value == null ? "null" : String(field.value)}
                          >
                            <SelectTrigger className="bg-black/40 border-white/10 h-12"><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">Deixar sem grade</SelectItem>
                                {grids?.map(g => (
                                    <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-4">
                    <h4 className="font-semibold text-emerald-400 text-sm mb-2 uppercase tracking-wider">Regras Fiscais Padrão</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ncm">NCM (8 dígitos)</Label>
                        <Input id="ncm" {...registerSub('ncm', { required: true })} placeholder="00000000" className="bg-black/40 border-white/10 font-mono" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cfop">CFOP Padrão</Label>
                        <Controller
                          control={controlSub}
                          name="cfop_padrao"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <SelectTrigger className="bg-black/40 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5102">5102 - Venda Mercadoria</SelectItem>
                                <SelectItem value="5405">5405 - Venda ST</SelectItem>
                                <SelectItem value="6102">6102 - Venda Interestadual</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>CST / CSOSN</Label>
                        <Controller
                          control={controlSub}
                          name="cst_icms"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <SelectTrigger className="bg-black/40 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="102">102 - Tributada SN</SelectItem>
                                <SelectItem value="300">300 - Imune</SelectItem>
                                <SelectItem value="400">400 - Não Tributada</SelectItem>
                                <SelectItem value="00">00 - Tributada Integralmente</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Origem da Mercadoria</Label>
                        <Controller
                          control={controlSub}
                          name="origem"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                              <SelectTrigger className="bg-black/40 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">0 - Nacional</SelectItem>
                                <SelectItem value="1">1 - Estrangeira (Importação direta)</SelectItem>
                                <SelectItem value="2">2 - Estrangeira (Adq. no mercado interno)</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Unidade de Medida Comercial</Label>
                        <Controller
                          control={controlSub}
                          name="unidade_medida"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <SelectTrigger className="bg-black/40 border-white/10"><SelectValue placeholder="Ex: UN, KG, PC" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UN">UN - Unidade</SelectItem>
                                <SelectItem value="KG">KG - Quilograma</SelectItem>
                                <SelectItem value="MT">MT - Metro</SelectItem>
                                <SelectItem value="CX">CX - Caixa</SelectItem>
                                <SelectItem value="PC">PC - Peça</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                    </div>
                </div>
              </div>
            </div>

            <DialogFooter className="shrink-0 pt-4 mt-4 border-t border-white/10">
              <Button type="button" variant="outline" className="bg-transparent border-white/10 hover:bg-white/5" onClick={() => setIsSubDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSavingSub} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  {isSavingSub ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  {editingSub ? 'Salvar Alterações' : 'Criar Subcategoria'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ALERTAS DE EXCLUSÃO */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita. Excluirá a categoria permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => categoryToDelete && deleteCategory(categoryToDelete.id)} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!subcategoryToDelete} onOpenChange={() => setSubcategoryToDelete(null)}>
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Subcategoria?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita. Excluirá a subcategoria permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => subcategoryToDelete && deleteSubcategory(subcategoryToDelete.id)} className="bg-red-600 hover:bg-red-700 text-white">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}