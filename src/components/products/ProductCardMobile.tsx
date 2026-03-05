import { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, PackagePlus, Pencil, Trash2, Warehouse } from 'lucide-react';
import { mediaBaseUrl } from '@/lib/api';

interface ProductCardMobileProps {
  product: Product;
  onView: (product: Product) => void;
  onReplenish: (product: Product) => void;
  onEdit: (id: number) => void;
  onDelete: (product: Product) => void;
  onImageView: (imageUrl: string) => void;
  onViewStock: (product: Product) => void;
}

export function ProductCardMobile({ product, onView, onReplenish, onEdit, onDelete, onImageView, onViewStock }: ProductCardMobileProps) {
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

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${mediaBaseUrl}${imagePath}`;
  };

  const imageUrl = getImageUrl(product.imagem_principal);
  const totalEstoque = getTotalStock(product);
  const stockIsLow = totalEstoque <= product.estoque_minimo;

  return (
    <div className="bg-card border rounded-2xl shadow-lg p-4 flex flex-col gap-4">
      <div className="flex gap-4">
        <button
          onClick={() => imageUrl && onImageView(imageUrl)}
          disabled={!imageUrl}
          className="w-24 h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-muted to-transparent border overflow-hidden flex items-center justify-center shadow-inner disabled:cursor-default"
        >
          {imageUrl ? (
            <img src={imageUrl} alt={product.nome} className="h-full w-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-emerald-500/10 text-emerald-500 font-bold text-xl">
              {getInitials(product.nome)}
            </div>
          )}
        </button>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-foreground leading-tight">{product.nome}</h3>
            <p className="text-xs text-muted-foreground mt-1">{product.categoria_nome || 'N/A'} • {product.marca_nome || 'N/A'}</p>
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
      <div className="grid grid-cols-5 gap-2">
        <Button variant="outline" size="icon" className="h-12 w-full bg-muted/50 border" onClick={() => onView(product)}><Eye className="h-5 w-5" /></Button>
        <Button variant="outline" size="icon" className="h-12 w-full bg-muted/50 border" onClick={() => onViewStock(product)}><Warehouse className="h-5 w-5" /></Button>
        <Button variant="outline" size="icon" className="h-12 w-full bg-muted/50 border" onClick={() => onReplenish(product)}><PackagePlus className="h-5 w-5" /></Button>
        <Button variant="outline" size="icon" className="h-12 w-full bg-muted/50 border" onClick={() => onEdit(product.id)}><Pencil className="h-5 w-5" /></Button>
        <Button variant="destructive" size="icon" className="h-12 w-full" onClick={() => onDelete(product)}><Trash2 className="h-5 w-5" /></Button>
      </div>
    </div>
  );
}