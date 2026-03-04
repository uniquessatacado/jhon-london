import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';

export function FiscalSection() {
  const { watch } = useFormContext<any>();

  return (
    <Card className="bg-black/20 border-white/10 shadow-lg">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-base flex items-center gap-2 text-white">
          <FileText className="h-4 w-4 text-emerald-500" /> 5. Dados Fiscais
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground mb-4">Estes dados são preenchidos automaticamente pela subcategoria selecionada.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><Label className="text-xs">NCM</Label><Input readOnly value={watch('ncm') || '-'} className="bg-black/40 border-white/10 mt-1" /></div>
          <div><Label className="text-xs">CFOP</Label><Input readOnly value={watch('cfop_padrao') || '-'} className="bg-black/40 border-white/10 mt-1" /></div>
          <div><Label className="text-xs">CST/CSOSN</Label><Input readOnly value={watch('cst_icms') || '-'} className="bg-black/40 border-white/10 mt-1" /></div>
          <div><Label className="text-xs">Origem</Label><Input readOnly value={watch('origem') || '-'} className="bg-black/40 border-white/10 mt-1" /></div>
          <div><Label className="text-xs">Unidade</Label><Input readOnly value={watch('unidade_medida') || '-'} className="bg-black/40 border-white/10 mt-1" /></div>
        </div>
      </CardContent>
    </Card>
  );
}