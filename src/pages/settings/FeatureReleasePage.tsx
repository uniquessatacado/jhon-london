import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Rocket, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

const featureMap: { [key: string]: { label: string; description: string } } = {
  pdv_liberado: { label: 'PDV / Vendas', description: 'Frente de caixa para realização de vendas.' },
  clientes_liberado: { label: 'Clientes', description: 'Cadastro e gerenciamento da base de clientes.' },
  produtos_liberado: { label: 'Produtos', description: 'Gerenciamento de catálogo, estoque e preços.' },
  vendas_liberado: { label: 'Vendas (Geral)', description: 'Módulo geral de histórico de vendas e faturamento.' },
};

export function FeatureReleasePage() {
  const { refetchFeatureStatus } = useAuth();
  
  // Guardará o estado exato que veio do servidor
  const [features, setFeatures] = useState<{ [key: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingKeys, setLoadingKeys] = useState<{ [key: string]: boolean }>({});

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/features/status');
      
      // Converte para garantir que o state seja booleano (true/false)
      const parsedData: { [key: string]: boolean } = {};
      Object.keys(data).forEach(key => {
        parsedData[key] = data[key] === true || String(data[key]) === 'true';
      });
      
      setFeatures(parsedData);
    } catch (error) {
      toast.error("Erro ao buscar o status atualizado do servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // Ao carregar a página, busca o estado real do DB
  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggle = async (featureKey: string, newValue: boolean) => {
    // Liga o loader APENAS na chave sendo clicada
    setLoadingKeys(prev => ({ ...prev, [featureKey]: true }));

    try {
      // Faz o PUT e AGUARDA resposta 200
      await api.put(`/configuracoes/${featureKey}`, { 
        valor: newValue ? 'true' : 'false'
      });
      
      // Se deu certo (200), aí sim mudamos a chavinha na tela
      setFeatures(prev => ({ ...prev, [featureKey]: newValue }));
      toast.success(`Módulo atualizado com sucesso!`);
      
      // Atualiza o contexto global para que o Menu Lateral (Sidebar) reflita a mudança
      refetchFeatureStatus();

    } catch (error) {
      toast.error('Falha ao salvar a alteração. A configuração não foi modificada.');
    } finally {
      // Remove o spinner
      setLoadingKeys(prev => ({ ...prev, [featureKey]: false }));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Liberação de Funcionalidades</h1>
        <p className="text-muted-foreground">Controle o acesso global às principais páginas do sistema.</p>
      </div>

      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-emerald-500" /> Módulos do Sistema
          </CardTitle>
          <CardDescription>
            Ative ou desative módulos para todos os colaboradores da loja.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(featureMap).map(key => (
            <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/10 hover:border-emerald-500/30 transition-colors">
              <div>
                <Label htmlFor={`feature-${key}`} className="text-base font-medium text-white">{featureMap[key].label}</Label>
                <p className="text-sm text-muted-foreground">{featureMap[key].description}</p>
              </div>
              <div className="flex items-center gap-3">
                  {loadingKeys[key] && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
                  <Switch
                    id={`feature-${key}`}
                    checked={features[key] ?? false}
                    onCheckedChange={(checked) => handleToggle(key, checked)}
                    disabled={loadingKeys[key]}
                    className="data-[state=checked]:bg-emerald-500"
                  />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}