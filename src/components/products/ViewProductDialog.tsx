import { Product } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Tag, Ruler, FileText, Grid as GridIcon, Video, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProductDetails } from '@/hooks/use-product-details';
import { useMemo } from 'react';
import { useCategories, useAllSubcategories } from '@/hooks/use-categories';
import { mediaBaseUrl } from '@/lib/api';

interface ViewProductDialogProps {
  productId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// FORMATADOR BLINDADO
const formatDim = (val: any) => {
  if (val === undefined || val === null || val === '') return '-';
  const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : Number(val);
  return (!isNaN(num) && num > 0) ? num.toString().replace('.', ',') : '-';
};

const ViewProductDialogContent = ({ product }: { product: Product }) => {
  const { data: categories } = useCategories();
  const { data: allSubcategories } = useAllSubcategories();

  const derivedCategoryName = useMemo(() => {
    if (product.categoria_nome) return product.categoria_nome;
    if (product.subcategoria_id && allSubcategories && categories) {
      const sub = allSubcategories.find(s => s.id === product.subcategoria_id);
      if (sub) {
        const cat = categories.find(c => c.id === sub.categoria_id);
        if (cat) return cat.nome;
      }
    }
    return null;
  }, [product, categories, allSubcategories]);

  const formatCurrency = (val: number | undefined) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  const videoSrc = product.video_url || product.video;

  const variacoesComDimensoes = useMemo(() => {
    if (!product.variacoes) return [];
    const dimensoes = product.dimensoes_grade || [];
    return product.variacoes.map(v => {
      const dim = dimensoes.find(d => d.tamanho === v.tamanho);
      return {
        ...v,
        peso_kg: dim?.peso_kg || v.peso_kg,
        altura_cm: dim?.altura_cm || v.altura_cm,
        largura_cm: dim?.largura_cm || v.largura_cm,
        comprimento_cm: dim?.comprimento_cm || v.comprimento_cm,
      };
    });
  }, [product]);

  return (
    <>
      <DialogHeader className="p-6 pb-2 bg-white/5 border-b border-white/10">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-lg bg-white/10 overflow-hidden border border-white/10 flex-shrink-0">
             {product.imagem_principal ? (
               <img src={`${mediaBaseUrl}${product.imagem_principal}`} alt={product.nome} className="h-full w-full object-cover" />
             ) : (
               <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-white/5">
                 <Package className="h-8 w-8 opacity-50" />
               </div>
             )}
          </div>
          <div>
             <DialogTitle className="text-2xl font-bold">{product.nome}</DialogTitle>
             <DialogDescription className="text-muted-foreground flex items-center gap-2 mt-1">
               <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">SKU: {product.sku || product.variacoes?.[0]?.sku || 'N/A'}</Badge>
               <span>•</span>
               <span>{derivedCategoryName || 'Sem Categoria'}</span>
             </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      
      <Tabs defaultValue="basic" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-2 bg-white/5 border-b border-white/10">
              <TabsList className="bg-transparent h-auto p-0 gap-6">
                  <TabsTrigger value="basic" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none pb-3 pt-2 px-1 text-muted-foreground data-[state=active]:text-emerald-400">
                      <Tag className="mr-2 h-4 w-4" /> Dados Básicos
                  </TabsTrigger>
                  <TabsTrigger value="stock" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none pb-3 pt-2 px-1 text-muted-foreground data-[state=active]:text-emerald-400">
                      <GridIcon className="mr-2 h-4 w-4" /> Estoque & Grade
                  </TabsTrigger>
                  <TabsTrigger value="fiscal" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none pb-3 pt-2 px-1 text-muted-foreground data-[state=active]:text-emerald-400">
                      <FileText className="mr-2 h-4 w-4" /> Fiscal
                  </TabsTrigger>
                  <TabsTrigger value="dims" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none pb-3 pt-2 px-1 text-muted-foreground data-[state=active]:text-emerald-400">
                      <Ruler className="mr-2 h-4 w-4" /> Dimensões
                  </TabsTrigger>
                  {videoSrc && (
                      <TabsTrigger value="media" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 rounded-none pb-3 pt-2 px-1 text-muted-foreground data-[state=active]:text-emerald-400">
                          <Video className="mr-2 h-4 w-4" /> Vídeo
                      </TabsTrigger>
                  )}
              </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
              <TabsContent value="basic" className="mt-0 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-4 space-y-2">
                              <span className="text-xs font-medium text-muted-foreground uppercase">Preços</span>
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                  <span>Custo:</span>
                                  <span className="font-mono">{formatCurrency(product.preco_custo)}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                  <span>Varejo:</span>
                                  <span className="font-mono text-emerald-400 font-bold">{formatCurrency(product.preco_varejo)}</span>
                              </div>
                              {(product.habilita_atacado_geral || product.preco_atacado_geral > 0) && (
                                  <div className="flex justify-between items-center text-purple-300">
                                      <span>Atacado Geral:</span>
                                      <span className="font-mono">{formatCurrency(product.preco_atacado_geral)}</span>
                                  </div>
                              )}
                              {(product.habilita_atacado_grade || product.preco_atacado_grade > 0) && (
                                  <div className="flex justify-between items-center text-blue-300">
                                      <span>Atacado Pacote:</span>
                                      <span className="font-mono">{formatCurrency(product.preco_atacado_grade)}</span>
                                  </div>
                              )}
                          </CardContent>
                      </Card>
                      <Card className="bg-white/5 border-white/10">
                          <CardContent className="p-4 space-y-2">
                              <span className="text-xs font-medium text-muted-foreground uppercase">Classificação</span>
                              <div className="grid grid-cols-1 gap-1">
                                  <p><span className="text-muted-foreground">Categoria:</span> {derivedCategoryName || '-'}</p>
                                  <p><span className="text-muted-foreground">Subcategoria:</span> {product.subcategoria_nome || '-'}</p>
                                  <p><span className="text-muted-foreground">Marca:</span> {product.marca_nome || '-'}</p>
                              </div>
                          </CardContent>
                      </Card>
                  </div>
                  {product.imagens_galeria && product.imagens_galeria.length > 0 && (
                      <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Galeria</h4>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                              {product.imagens_galeria.map((img, idx) => (
                                  <img key={idx} src={`${mediaBaseUrl}${img}`} className="h-24 w-24 rounded-md object-cover border border-white/10" alt={`Galeria ${idx}`} />
                              ))}
                          </div>
                      </div>
                  )}
              </TabsContent>

              <TabsContent value="stock" className="mt-0">
                  <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-0">
                          <Table>
                              <TableHeader>
                                  <TableRow className="border-white/10 hover:bg-transparent">
                                      <TableHead>Tamanho</TableHead>
                                      <TableHead className="text-right">Estoque</TableHead>
                                      <TableHead>SKU</TableHead>
                                      <TableHead>EAN</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {product.variacoes?.map((v, i) => (
                                      <TableRow key={i} className="border-white/5 hover:bg-white/5">
                                          <TableCell className="font-bold text-emerald-400">{v.tamanho}</TableCell>
                                          <TableCell className="text-right">{v.estoque}</TableCell>
                                          <TableCell className="text-muted-foreground text-xs">{v.sku || '-'}</TableCell>
                                          <TableCell className="text-muted-foreground text-xs">{v.codigo_barras || '-'}</TableCell>
                                      </TableRow>
                                  ))}
                                  {!product.variacoes?.length && (
                                      <TableRow>
                                          <TableCell colSpan={4} className="text-center text-muted-foreground py-4">Sem variações cadastradas (Estoque Geral: {product.estoque})</TableCell>
                                      </TableRow>
                                  )}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
              </TabsContent>

              <TabsContent value="fiscal" className="mt-0">
                  <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
                           <div>
                              <span className="block text-muted-foreground text-xs">NCM</span>
                              <span className="font-mono">{product.ncm || '-'}</span>
                           </div>
                           <div>
                              <span className="block text-muted-foreground text-xs">CFOP Padrão</span>
                              <span className="font-mono">{product.cfop_padrao || '-'}</span>
                           </div>
                           <div>
                              <span className="block text-muted-foreground text-xs">CST/CSOSN</span>
                              <span className="font-mono">{product.cst_icms || '-'}</span>
                           </div>
                           <div>
                              <span className="block text-muted-foreground text-xs">Origem</span>
                              <span className="font-mono">{product.origem || '-'}</span>
                           </div>
                           <div>
                              <span className="block text-muted-foreground text-xs">Unidade</span>
                              <span className="font-mono">{product.unidade_medida || '-'}</span>
                           </div>
                      </CardContent>
                  </Card>
              </TabsContent>

              <TabsContent value="dims" className="mt-0">
                   <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-0">
                          {variacoesComDimensoes && variacoesComDimensoes.length > 0 ? (
                              <Table>
                                  <TableHeader>
                                      <TableRow className="border-white/10 hover:bg-transparent">
                                          <TableHead>Tamanho</TableHead>
                                          <TableHead>Peso (kg)</TableHead>
                                          <TableHead>Altura (cm)</TableHead>
                                          <TableHead>Largura (cm)</TableHead>
                                          <TableHead>Comp. (cm)</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {variacoesComDimensoes.map((v, i) => (
                                          <TableRow key={i} className="border-white/5 hover:bg-white/5">
                                              <TableCell className="font-bold">{v.tamanho}</TableCell>
                                              <TableCell>{formatDim(v.peso_kg)}</TableCell>
                                              <TableCell>{formatDim(v.altura_cm)}</TableCell>
                                              <TableCell>{formatDim(v.largura_cm)}</TableCell>
                                              <TableCell>{formatDim(v.comprimento_cm)}</TableCell>
                                          </TableRow>
                                      ))}
                                  </TableBody>
                              </Table>
                          ) : (
                              <div className="p-8 text-center text-muted-foreground">
                                  <Ruler className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p>Sem dimensões cadastradas para este produto.</p>
                              </div>
                          )}
                      </CardContent>
                  </Card>
              </TabsContent>

              {videoSrc && (
                  <TabsContent value="media" className="mt-0">
                       <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/10 bg-black">
                           <video 
                              src={`${mediaBaseUrl}${videoSrc}`} 
                              controls 
                              className="w-full h-full"
                           />
                       </div>
                  </TabsContent>
              )}
          </ScrollArea>
      </Tabs>
    </>
  );
};

export function ViewProductDialog({ productId, open, onOpenChange }: ViewProductDialogProps) {
  const { data: product, isLoading, isError } = useProductDetails(productId ? String(productId) : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-zinc-950 border-white/10 text-white">
        {isLoading && (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center h-96 text-destructive">
            Erro ao carregar dados do produto.
          </div>
        )}
        {!isLoading && !isError && product && <ViewProductDialogContent product={product} />}
      </DialogContent>
    </Dialog>
  );
}