import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Tag, FolderTree, ArrowRight, Trash2, Pencil, Grid as GridIcon } from 'lucide-react';
import { useCategories, useSubcategories } from '@/hooks/use-categories';
import { useCreateCategory, useDeleteCategory, useCreateSubcategory, useUpdateSubcategory } from '@/hooks/use-category-mutations';
import { useGrids } from '@/hooks/use-grids';
import { Skeleton } from '@/components/ui/skeleton';
import { Category, Subcategory } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export function CategoryPage() {
  const queryClient = useQueryClient();

  // Hooks de Dados
  const { data: categories, isLoading: isLoadingCats } = useCategories();
  const { data: grids } = useGrids();
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { data: subcategories, isLoading: isLoadingSubs } = useSubcategories(selectedCategory?.id || null);

  // Hooks de Mutação
  const { mutate: createCategory, isPending: isCreatingCat } = useCreateCategory();
  const { mutate: createSubcategory, isPending: isCreatingSub } = useCreateSubcategory();
  const { mutate: updateSubcategory, isPending: isUpdatingSub } = useUpdateSubcategory();

  // Estados de UI
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);

  // Forms
  const { register: registerCat, handleSubmit: handleCatSubmit, reset: resetCat } = useForm<{ nome: string }>();
  const { register: registerSub, handleSubmit: handleSubSubmit, reset: resetSub, setValue: setSubValue, watch: watchSub } = useForm<Subcategory>();

  const watchedSubGradeId = watchSub('grade_id');

  // Handlers
  const onCatSubmit = (data: { nome: string }) => {
    createCategory(data, {
      onSuccess: () => {
        setIsCatDialogOpen(false);
        resetCat();
      }
    });
  };

  const handleOpenSubDialog = (sub: Subcategory | null = null) => {
    if (sub) {
        setEditingSub(sub);
        // Preencher form
        setSubValue('nome', sub.nome);
        setSubValue('ncm', sub.ncm);
        setSubValue('cfop_padrao', sub.cfop_padrao);
        setSubValue('cst_icms', sub.cst_icms);
        setSubValue('origem', sub.origem);
        setSubValue('unidade_medida', sub.unidade_medida);
        setSubValue('grade_id', sub.grade_id);
    } else {
        setEditingSub(null);
        resetSub();
        // Defaults
        setSubValue('cfop_padrao', '');
        setSubValue('cst_icms', '');
        setSubValue('origem', '');
        setSubValue('unidade_medida', '');
        setSubValue('grade_id', null);
    }
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
        grade_id: data.grade_id && data.grade_id !== "null" ? Number(data.grade_id) : null
    };

    const handleSuccess = () => {
        setIsSubDialogOpen(false);
        resetSub();
        setEditingSub(null);
        queryClient.invalidateQueries({ queryKey: ['subcategories', selectedCategory.id] });
    };

    if (editingSub) {
        updateSubcategory({ id: editingSub.id, ...payload }, { onSuccess: handleSuccess });
    } else {
        createSubcategory(payload, { onSuccess: handleSuccess });
    }
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
              <Button size="sm" className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30" onClick={() => handleOpenSubDialog()}>
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
                <Button variant="link" onClick={() => handleOpenSubDialog()}>Criar a primeira</Button>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                  {subcategories?.map(sub => (
                    <div key={sub.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-all group relative">
                      <Button 
                         size="icon" 
                         variant="ghost" 
                         className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                         onClick={() => handleOpenSubDialog(sub)}
                      >
                         <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <div className="flex items-start justify-between mb-2 pr-8">
                        <div>
                            <h3 className="font-bold text-lg text-white">{sub.nome}</h3>
                            {sub.grade_id && (
                                <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs font-medium">
                                    <GridIcon className="h-3 w-3" />
                                    <span>{grids?.find(g => g.id === sub.grade_id)?.nome || 'Grade Vinculada'}</span>
                                </div>
                            )}
                        </div>
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

      {/* DIALOG: Nova/Edit Subcategoria */}
      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSub ? 'Editar Subcategoria' : 'Nova Subcategoria'}</DialogTitle>
            <DialogDescription>Define a classificação fiscal e grade padrão.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubSubmit(onSubSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="nome">Nome da Subcategoria</Label>
                    <Input id="nome" {...registerSub('nome', { required: true })} placeholder="Ex: Calça Jeans" />
                </div>
                <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                        <GridIcon className="h-3 w-3" /> Grade Padrão (Opcional)
                    </Label>
                    <Select 
                        onValueChange={(v) => setSubValue('grade_id', v === "null" ? null : Number(v))} 
                        value={watchedSubGradeId ? String(watchedSubGradeId) : "null"}
                    >
                        <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="null">Nenhuma</SelectItem>
                            {grids?.map(g => (
                                <SelectItem key={g.id} value={String(g.id)}>{g.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                  <Label htmlFor="ncm">NCM (8 dígitos)</Label>
                  <Input id="ncm" {...registerSub('ncm', { required: true })} placeholder="00000000" />
                  <p className="text-[10px] text-muted-foreground">Aceita pontos. Enviaremos apenas números.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cfop">CFOP Padrão</Label>
                   <Select 
                        onValueChange={(v) => setSubValue('cfop_padrao', v)}
                        defaultValue={editingSub?.cfop_padrao}
                   >
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
                  <Select 
                    onValueChange={(v) => setSubValue('cst_icms', v)}
                    defaultValue={editingSub?.cst_icms}
                  >
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
                  <Select 
                    onValueChange={(v) => setSubValue('origem', v)}
                    defaultValue={editingSub?.origem}
                  >
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
                  <Select 
                    onValueChange={(v) => setSubValue('unidade_medida', v)}
                    defaultValue={editingSub?.unidade_medida}
                  >
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
              <Button type="submit" disabled={isCreatingSub || isUpdatingSub}>
                  {editingSub ? 'Salvar Alterações' : 'Criar Subcategoria'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}