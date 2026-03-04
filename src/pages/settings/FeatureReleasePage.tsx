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
};

export function FeatureReleasePage() {
  const { featureStatus, refetchFeatureStatus } = useAuth();
  
  // Controle de estado local para a interface responder instantaneamente
  const [localFeatures, setLocalFeatures] = useState<{ [key: string]: boolean }>({});
  // Bloqueia apenas a chavinha que está sendo salva no momento
  const [loadingKeys, setLoadingKeys] = useState<{ [key: string]: boolean }>({});

  // Sincroniza os dados do servidor com a tela de forma segura (forçando ser Verdadeiro/Falso)
  useEffect(() => {
    if (featureStatus && featureStatus.features) {
      const parsedFeatures: { [key: string]: boolean } = {};
      
      // Mapeia todas as chaves esperadas para garantir que apareçam, mesmo se a API não enviar
      Object.keys(featureMap).forEach(key => {
        const val = featureStatus.features[key];
        // Forçamos para string para evitar o erro do TS (comparar boolean com string)
        parsedFeatures[key] = String(val) === 'true';
      });
      
      setLocalFeatures(prev => ({ ...prev, ...parsedFeatures }));
    }
  }, [featureStatus]);

  const handleToggle = async (featureKey: string, isEnabled: boolean) => {
    // 1. Atualização "Otimista" - Muda a UI imediatamente para não parecer travado
    setLocalFeatures(prev => ({ ...prev, [featureKey]: isEnabled }));
    setLoadingKeys(prev => ({ ...prev, [featureKey]: true }));

    try {
      // 2. Envia para o servidor
      await api.put(`/configuracoes/${featureKey}`, { 
        valor: isEnabled ? 'true' : 'false',
        descricao: `Liberação do módulo: ${featureMap[featureKey]?.label || featureKey}`
      });
      
      toast.success(`'${featureMap[featureKey]?.label || featureKey}' atualizado com sucesso!`);
      
      // 3. Aguarda 1 segundo antes de pedir os dados novos, para dar tempo do Banco de Dados atualizar.
      // Isso evita o bug da chavinha "voltar sozinha".
      setTimeout(() => {
        refetchFeatureStatus();
      }, 1000);

    } catch (error) {
      // Se der erro real, reverte a chavinha para a posição anterior
      setLocalFeatures(prev => ({ ...prev, [featureKey]: !isEnabled }));
      toast.error('Falha ao atualizar a funcionalidade. Tente novamente.');
    } finally {
      setLoadingKeys(prev => ({ ...prev, [featureKey]: false }));
    }
  };

  if (!featureStatus) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;
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
                    checked={localFeatures[key] ?? false}
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