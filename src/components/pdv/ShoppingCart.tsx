import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CartItem } from '@/types';
import { Trash2, Plus, Minus, ShoppingCart as ShoppingCartIcon, X } from 'lucide-react';
import { mediaBaseUrl } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, tamanho: string, newQuantity: number) => void;
  onRemoveItem: (productId: number, tamanho: string) => void;
  onCheckout: () => void;
}

export function ShoppingCart({ items, onUpdateQuantity, onRemoveItem, onCheckout }: ShoppingCartProps) {
  const total = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Card className="bg-black/40 border-white/10 h-full flex flex-col shadow-2xl">
      <CardHeader className="flex-row items-center justify-between border-b border-white/5 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5 text-emerald-400" />
          Carrinho
        </CardTitle>
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </Badge>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <ShoppingCartIcon className="h-16 w-16 opacity-10 mb-4" />
            <p className="font-medium">Seu carrinho está vazio</p>
            <p className="text-xs">Adicione produtos para começar a venda.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="divide-y divide-white/5">
              {items.map(item => (
                <div key={`${item.productId}-${item.variation.tamanho}`} className="p-4 flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                    <img src={`${mediaBaseUrl}${item.image}`} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm leading-tight">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Tam: {item.variation.tamanho}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-6 w-6 rounded-full" onClick={() => onUpdateQuantity(item.productId, item.variation.tamanho, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-mono text-sm">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-6 w-6 rounded-full" onClick={() => onUpdateQuantity(item.productId, item.variation.tamanho, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-mono font-medium">{formatCurrency(item.quantity * item.unitPrice)}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" onClick={() => onRemoveItem(item.productId, item.variation.tamanho)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      {items.length > 0 && (
        <div className="p-4 border-t border-white/5 bg-white/5 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between items-baseline text-emerald-400">
            <span className="text-xl font-bold">Total</span>
            <span className="text-2xl font-bold font-mono">{formatCurrency(total)}</span>
          </div>
          <Button className="w-full h-14 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" onClick={onCheckout}>
            Finalizar Venda
          </Button>
        </div>
      )}
    </Card>
  );
}