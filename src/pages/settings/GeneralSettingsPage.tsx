import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, ShoppingBag, Loader2 } from 'lucide-react';

export function GeneralSettingsPage() {
  const { register, handleSubmit, setValue } = useForm<{ qtd_minima: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    supabase.from('configuracoes').select('valor').eq('chave', 'qtd_minima_atacado_geral').single().then(({ data }) => {
        setValue('qtd_minima', data?.valor || '10');
        setIsLoading(false);
    });
  }, [setValue]);

  const onSubmit = async (formData: { qtd_minima: string }) => {
    setIsSaving(true);
    try {
        const { error } = await supabase.from('configuracoes').upsert(
            { chave: 'qtd_minima_atacado_geral', valor: formData.qtd_minima, descricao: 'Qtd min atacado' },
            { onConflict: 'chave' }
        );
        if (error) throw error;
        toast.success('Configuração salva com sucesso!');
    } catch(e) {
        toast.error('Erro ao salvar configuração.');
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações Gerais</h1>
        <p className="text-muted-foreground">Defina as regras globais de negócio do sistema.</p>
      </div>

      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-emerald-500" /> Regras de Atacado</CardTitle>
          <CardDescription>Configure como o sistema deve se comportar para vendas em grande quantidade.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          ) : (
             <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="qtd_minima">Quantidade Mínima (Atacado Geral)</Label>
                  <div className="flex items-center gap-2">
                    <Input id="qtd_minima" type="number" min="1" className="bg-black/20 border-white/10" {...register('qtd_minima', { required: true })} />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">peças no carrinho</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Se o cliente colocar esta quantidade, o sistema aplicará o "Preço de Atacado".</p>
                </div>
                <Button type="submit" disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600">
                  {isSaving ? 'Salvando...' : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
                </Button>
             </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}