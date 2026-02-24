import { ProductMetric } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Package } from 'lucide-react';

interface TopProductsProps {
  products?: ProductMetric[];
  isLoading: boolean;
}

export function TopProducts({ products, isLoading }: TopProductsProps) {
  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 shadow-lg">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-xl font-medium flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-yellow-400" /> Produtos Mais Vendidos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
             <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
             <p>Sem dados de produtos para o período.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, index) => (
              <div key={product.id} className="group relative bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300">
                {/* Ranking Badge */}
                <div className="absolute top-2 left-2 z-10 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {index + 1}
                </div>
                
                {/* Image Area */}
                <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
                    {product.imagem ? (
                        <img 
                            src={product.imagem} 
                            alt={product.nome} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-8 w-8 opacity-50" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    
                    <div className="absolute bottom-2 left-3 right-3">
                         <p className="text-sm font-medium text-white truncate">{product.nome}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="p-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                        <span className="block text-muted-foreground text-[10px] uppercase">Qtd.</span>
                        <span className="font-bold text-emerald-400 text-lg">{product.quantidade_vendida}</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                        <span className="block text-muted-foreground text-[10px] uppercase">Total</span>
                        <span className="font-bold text-white">
                            {new Intl.NumberFormat('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' }).format(product.valor_total_vendido)}
                        </span>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}