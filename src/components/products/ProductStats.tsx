
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign } from "lucide-react";

interface ProductStatsProps {
  totalStock: number;
  totalCost: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function ProductStats({ totalStock, totalCost }: ProductStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card className="bg-card border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Estoque Disponível
          </CardTitle>
          <Package className="h-5 w-5 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{totalStock.toLocaleString('pt-BR')}</div>
          <p className="text-xs text-muted-foreground">Peças no estoque</p>
        </CardContent>
      </Card>
      <Card className="bg-card border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Custo Total do Estoque
          </CardTitle>
          <DollarSign className="h-5 w-5 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{formatCurrency(totalCost)}</div>
          <p className="text-xs text-muted-foreground">Valor total de custo dos produtos</p>
        </CardContent>
      </Card>
    </div>
  );
}
