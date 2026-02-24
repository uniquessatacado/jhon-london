import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, ShoppingBag } from 'lucide-react';

// Tipagem simples para a config
type ConfigAtacado = {
  valor: string; // API costuma retornar configs como string em alguns ERPs, mas trataremos como number no input
  descricao?: string;
};

// Fetcher
async function fetchQtdAtacado(): Promise<ConfigAtacado> {
  // Endpoint: GET /api/configuracoes/qtd_minima_atacado_geral
  try {
      const { data } = await api.get('/configuracoes/qtd_minima_atacado_geral');
      return data || { valor: '10' };
  } catch (e) {
      return { valor: '10' }; // Default fallback
  }
}

// Updater
async function updateQtdAtacado(valor: string): Promise<void> {
  await api.put('/configuracoes/qtd_minima_atacado_geral', { 
    valor, 
    descricao: 'Quantidade mínima de itens no carrinho para ativar atacado geral' 
  });
}

export function GeneralSettingsPage() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue } = useForm<{ qtd_minima: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['config_atacado'],
    queryFn: fetchQtdAtacado,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateQtdAtacado,
    onSuccess: () => {
      toast.success('Configuração salva com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['config_atacado'] });
    },
    onError: () => {
      toast.error('Erro ao salvar configuração.');
    }
  });

  useEffect(() => {
    if (data) {
      setValue('qtd_minima', data.valor);
    }
  }, [data, setValue]);

  const onSubmit = (formData: { qtd_minima: string }) => {
    mutate(formData.qtd_minima);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações Gerais</h1>
        <p className="text-muted-foreground">Defina as regras globais de negócio do sistema.</p>
      </div>

      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-emerald-500" /> Regras de Atacado
          </CardTitle>
          <CardDescription>
            Configure como o sistema deve se comportar para vendas em grande quantidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="qtd_minima">Quantidade Mínima (Atacado Geral)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="qtd_minima" 
                  type="number" 
                  min="1"
                  className="bg-black/20 border-white/10" 
                  {...register('qtd_minima', { required: true })} 
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">peças no carrinho</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Se o cliente colocar esta quantidade de itens (misturando qualquer produto) no carrinho, 
                o sistema aplicará a tabela de "Preço de Atacado" nos itens que tiverem essa opção habilitada.
              </p>
            </div>

            <Button type="submit" disabled={isPending || isLoading} className="bg-emerald-500 hover:bg-emerald-600">
              {isPending ? 'Salvando...' : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}