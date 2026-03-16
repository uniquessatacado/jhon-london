import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from '@/components/pdv/ShoppingCart';
import { useProducts } from '@/hooks/use-products';
import { Product, CartItem, ProductVariation } from '@/types';
import { Search, Package, PlusCircle, XCircle, PlayCircle } from 'lucide-react';
import { mediaBaseUrl } from '@/lib/api';
import { toast } from 'sonner';
import { PdvProvider, usePdv } from '@/contexts/PdvContext';
import { StartSaleDialog } from '@/components/pdv/StartSaleDialog';
import { PdvHeader } from '@/components/pdv/PdvHeader';
import { CheckoutDialog } from '@/components/pdv/CheckoutDialog';

function PdvContent() {
  const { isSaleActive, clearSale, saleType } = usePdv();
  const { data: products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isStartSaleOpen, setIsStartSaleOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!isSaleActive) {
      setIsStartSaleOpen(true);
    }
  }, [isSaleActive]);

  const filteredProducts = products?.filter(p => {
    const term = searchTerm.toLowerCase();
    const nameMatch = p.nome?.toLowerCase().includes(term) ?? false;
    const variationMatch = p.variacoes?.some(v => 
        (v.sku?.toLowerCase().includes(term) ?? false) ||
        (v.codigo_barras?.toLowerCase().includes(term) ?? false)
    ) ?? false;
    return nameMatch || variationMatch;
  }).slice(0, 50);

  const addToCart = (product: Product, variation: ProductVariation) => {
    // Define o preço baseando no tipo de venda escolhida no início
    let unitPrice = product.preco_varejo;
    if (saleType === 'atacado_geral' && product.habilita_atacado_geral && product.preco_atacado_geral > 0) {
      unitPrice = product.preco_atacado_geral;
    } else if (saleType === 'atacado_grade' && product.habilita_atacado_grade && product.preco_atacado_grade > 0) {
      unitPrice = product.preco_atacado_grade;
    }

    const existingItem = cart.find(item => item.productId === product.id && item.variation.tamanho === variation.tamanho);

    if (existingItem) {
      updateCartQuantity(product.id, variation.tamanho, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.nome,
        variation: {
          tamanho: variation.tamanho,
          sku: variation.sku,
        },
        quantity: 1,
        unitPrice: unitPrice, 
        image: product.imagem_principal,
      };
      setCart(prev => [...prev, newItem]);
    }
    toast.success(`${product.nome} (${variation.tamanho}) adicionado ao carrinho.`);
    setSelectedProduct(null);
  };

  const updateCartQuantity = (productId: number, tamanho: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, tamanho);
      return;
    }
    setCart(prev => prev.map(item => 
      item.productId === productId && item.variation.tamanho === tamanho 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  const removeFromCart = (productId: number, tamanho: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.variation.tamanho === tamanho)));
  };

  const handleProductSelect = (product: Product) => {
    if (product.variacoes && product.variacoes.length > 1) {
      setSelectedProduct(product);
    } else if (product.variacoes && product.variacoes.length === 1) {
      addToCart(product, product.variacoes[0]);
    } else {
      toast.error("Produto sem variações", { description: "Não é possível adicionar este produto ao carrinho." });
    }
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${mediaBaseUrl}${imagePath}`;
  }

  if (!isSaleActive) {
    return (
      <>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Nenhuma venda ativa</h2>
            <p className="text-muted-foreground">Inicie uma nova venda para começar a adicionar produtos.</p>
            <Button onClick={() => setIsStartSaleOpen(true)} className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white">
              <PlayCircle className="mr-2 h-4 w-4" /> Iniciar Nova Venda
            </Button>
          </div>
        </div>
        <StartSaleDialog open={isStartSaleOpen} onOpenChange={setIsStartSaleOpen} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <PdvHeader />
      <div className="flex-1 lg:grid lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-6 h-[50vh] lg:h-auto">
          <Card className="bg-black/20 border-white/10 shrink-0">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, SKU ou código de barras..."
                  className="h-16 text-lg pl-12 bg-black/40 border-white/10 focus:border-emerald-500/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/10 flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-4 shrink-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-400" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <ScrollArea className="absolute inset-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                  {isLoading && Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />)}
                  {filteredProducts?.map(product => {
                    const imageUrl = getImageUrl(product.imagem_principal);
                    return (
                      <button 
                        key={product.id} 
                        onClick={() => handleProductSelect(product)}
                        className="aspect-square rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group text-left flex flex-col justify-end p-2 hover:border-emerald-500/50 transition-all"
                      >
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.nome} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="absolute inset-0 w-full h-full bg-zinc-800 flex items-center justify-center">
                            <Package className="h-10 w-10 text-zinc-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="relative z-10">
                          <p className="text-xs font-bold text-white truncate">{product.nome}</p>
                          <p className="text-xs text-emerald-400 font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco_varejo)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ShoppingCart 
            items={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={handleCheckout}
          />
        </div>

        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setSelectedProduct(null)}>
            <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md m-4 p-6 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Selecione o Tamanho</h3>
                  <p className="text-muted-foreground">{selectedProduct.nome}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)}><XCircle className="h-6 w-6" /></Button>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {selectedProduct.variacoes?.map(v => (
                  <Button 
                    key={v.tamanho} 
                    variant="outline" 
                    className="h-16 text-lg border-white/10 hover:bg-white/5 hover:border-emerald-500/50"
                    onClick={() => addToCart(selectedProduct, v)}
                  >
                    {v.tamanho}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <CheckoutDialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen} />
    </div>
  );
}

export function PDVPage() {
  return (
    <PdvProvider>
      <div className="h-[calc(100vh-120px)]">
        <PdvContent />
      </div>
    </PdvProvider>
  );
}