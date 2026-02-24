import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Box, Ruler, Tag, FileText, Grid3X3 } from "lucide-react";

interface ViewProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewProductDialog({ product, open, onOpenChange }: ViewProductDialogProps) {
  if (!product) return null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg overflow-hidden border border-white/10 bg-black/20 flex-shrink-0">
               {product.imagem_principal ? (
                   <img src={product.imagem_principal} className="w-full h-full object-cover" alt={product.nome} />
               ) : (
                   <div className="flex items-center justify-center h-full w-full text-muted-foreground"><Box /></div>
               )}
            </div>
            <div>
                <DialogTitle className="text-xl">{product.nome}</DialogTitle>
                <DialogDescription className="mt-1 flex gap-2">
                    <Badge variant="outline">SKU: {product.sku || 'N/A'}</Badge>
                    <Badge variant="secondary">{product.categoria_nome || 'Sem Categoria'}</Badge>
                </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic"><Tag className="h-4 w-4 mr-2" /> Básicos</TabsTrigger>
            <TabsTrigger value="stock"><Grid3X3 className="h-4 w-4 mr-2" /> Estoque</TabsTrigger>
            <TabsTrigger value="fiscal"><FileText className="h-4 w-4 mr-2" /> Fiscal</TabsTrigger>
            <TabsTrigger value="dims"><Ruler className="h-4 w-4 mr-2" /> Dimensões</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 mt-4 pr-4">
            <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-white/10 rounded-lg bg-white/5">
                        <span className="text-xs text-muted-foreground uppercase">Preço Varejo</span>
                        <div className="text-xl font-bold text-emerald-400">{formatCurrency(product.preco_varejo)}</div>
                    </div>
                    <div className="p-3 border border-white/10 rounded-lg bg-white/5">
                        <span className="text-xs text-muted-foreground uppercase">Preço Custo</span>
                        <div className="text-lg font-medium">{formatCurrency(product.preco_custo)}</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                    <div><span className="text-muted-foreground">Marca:</span> <span className="font-medium">{product.marca_nome || '-'}</span></div>
                    <div><span className="text-muted-foreground">Subcategoria:</span> <span className="font-medium">{product.subcategoria_nome || '-'}</span></div>
                    <div><span className="text-muted-foreground">Atacado Geral:</span> <Badge variant={product.habilita_atacado_geral ? 'default' : 'secondary'}>{product.habilita_atacado_geral ? 'Sim' : 'Não'}</Badge></div>
                </div>
            </TabsContent>

            <TabsContent value="stock">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tamanho</TableHead>
                            <TableHead>SKU Var.</TableHead>
                            <TableHead className="text-right">Estoque</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {product.variacoes?.map((v, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-bold">{v.tamanho}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">{v.sku || '-'}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className={v.estoque > 0 ? "text-emerald-400 border-emerald-500/30" : "text-red-400"}>
                                        {v.estoque} un
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="bg-white/5 font-bold">
                            <TableCell colSpan={2}>TOTAL</TableCell>
                            <TableCell className="text-right text-emerald-400">
                                {product.variacoes?.reduce((acc, curr) => acc + curr.estoque, 0)} un
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TabsContent>

            <TabsContent value="fiscal" className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><span className="text-xs text-muted-foreground">NCM</span><p className="font-mono bg-white/5 p-2 rounded border border-white/10">{product.ncm || 'Não informado'}</p></div>
                    <div className="space-y-1"><span className="text-xs text-muted-foreground">CFOP Padrão</span><p className="font-mono bg-white/5 p-2 rounded border border-white/10">{product.cfop_padrao || '-'}</p></div>
                    <div className="space-y-1"><span className="text-xs text-muted-foreground">CST/CSOSN</span><p className="font-mono bg-white/5 p-2 rounded border border-white/10">{product.cst_icms || '-'}</p></div>
                    <div className="space-y-1"><span className="text-xs text-muted-foreground">Origem</span><p className="font-mono bg-white/5 p-2 rounded border border-white/10">{product.origem || '-'}</p></div>
                    <div className="space-y-1"><span className="text-xs text-muted-foreground">Unidade</span><p className="font-mono bg-white/5 p-2 rounded border border-white/10">{product.unidade_medida || '-'}</p></div>
                 </div>
            </TabsContent>

            <TabsContent value="dims" className="space-y-4">
                 <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <div className="text-2xl font-light">{product.peso_kg}</div>
                        <div className="text-xs text-muted-foreground uppercase">Kg</div>
                    </div>
                    <div className="col-span-2 bg-white/5 p-3 rounded-lg border border-white/10 flex justify-around items-center">
                         <div>
                            <div className="text-lg font-light">{product.altura_cm}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">Alt (cm)</div>
                         </div>
                         <div className="h-8 w-px bg-white/10" />
                         <div>
                            <div className="text-lg font-light">{product.largura_cm}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">Larg (cm)</div>
                         </div>
                         <div className="h-8 w-px bg-white/10" />
                         <div>
                            <div className="text-lg font-light">{product.comprimento_cm}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">Comp (cm)</div>
                         </div>
                    </div>
                 </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}