import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, PackagePlus, Pencil, Trash2 } from 'lucide-react';
import { mediaBaseUrl } from '@/lib/api';

interface ProductCardMobileProps {
  product: Product;
  onView: (product: Product) => void;
  onReplenish: (product: Product) => void;
  onEdit: (id: number) => void;
  onDelete: (product: Product) => void;
}

export function ProductCardMobile({ product, onView, onReplenish, onEdit, onDelete }: ProductCardMobileProps) {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  
  const getTotalStock = (p: Product) => {
    if (p.variacoes && p.variacoes.length > 0) {
      return p.variacoes.reduce((acc, v) => acc + (Number(v.estoque) || 0), 0);
    }
    return Number(p.estoque) || 0;
  };

  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const totalEstoque = getTotalStock(product);
  const stockIsLow = totalEstoque <= product.estoque_minimo;

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl shadow-lg p-4 flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="w-24 h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
          {product.imagem_principal ? (
            <img src={`${mediaBaseUrl}${product.imagem_principal}`} alt={product.nome} className="h-full w-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-emerald-500/10 text-emerald-500 font-bold text-xl">
              {getInitials(product.nome)}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-white leading-tight">{product.nome}</h3>
            <p className="text-xs text-muted-foreground mt-1">{product.categoria_nome} • {product.marca_nome}</p>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div>
              <span className="text-xs text-muted-foreground">Estoque</span>
              <Badge 
                variant="outline" 
                className={`rounded-lg border px-3 py-1 font-mono text-base ${
                  stockIsLow 
                  ? 'bg-red-500/5 text-red-400 border-red-500/20'
                  : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {totalEstoque}
              </Badge>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Preço</span>
              <p className="text-emerald-400 font-mono font-bold text-lg">
                {formatCurrency(product.preco_varejo)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button variant="outline" size="icon" className="h-12 w-full bg-white/5 border-white/10" onClick={() => onView(product)}><Eye className="h-5 w-5" /></Button>
        <Button variant="outline" size="icon" className="h-12 w-full bg-white/5 border-white/10" onClick={() => onReplenish(product)}><PackagePlus className="h-5 w-5" /></Button>
        <Button variant="outline" size="icon" className="h-12 w-full bg-white/5 border-white/10" onClick={() => onEdit(product.id)}><Pencil className="h-5 w-5" /></Button>
        <Button variant="destructive" size="icon" className="h-12 w-full" onClick={() => onDelete(product)}><Trash2 className="h-5 w-5" /></Button>
      </div>
    </div>
  );
}