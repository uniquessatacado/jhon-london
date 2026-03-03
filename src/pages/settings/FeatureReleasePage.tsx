import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Rocket, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

const featureMap: { [key: string]: { label: string; description: string } } = {
  pdv_liberado: { label: 'PDV / Vendas', description: 'Frente de caixa para realização de vendas.' },
  clientes_liberado: { label: 'Clientes', description: 'Cadastro e gerenciamento da base de clientes.' },
  produtos_liberado: { label: 'Produtos', description: 'Gerenciamento de catálogo, estoque e preços.' },
  // Adicione outras chaves da API aqui conforme necessário
};

export function FeatureReleasePage() {
  const { featureStatus, refetchFeatureStatus } = useAuth();
  const [localFeatures, setLocalFeatures] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (featureStatus) {
      setLocalFeatures(featureStatus.features);
    }
  }, [featureStatus]);

  const handleToggle = async (featureKey: string, isEnabled: boolean) => {
    setLocalFeatures(prev => ({ ...prev, [featureKey]: isEnabled }));
    setIsSaving(true);
    try {
      await api.put(`/features/${featureKey}`, { valor: isEnabled });
      toast.success(`'${featureMap[featureKey]?.label || featureKey}' atualizado com sucesso!`);
      refetchFeatureStatus(); // Atualiza o estado global
    } catch (error) {
      toast.error('Falha ao atualizar a funcionalidade.');
      // Reverte a mudança visual em caso de erro
      setLocalFeatures(prev => ({ ...prev, [featureKey]: !isEnabled }));
    } finally {
      setIsSaving(false);
    }
  };

  if (!featureStatus) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Liberação de Funcionalidades</h1>
        <p className="text-muted-foreground">Controle o acesso global às principais páginas do sistema.</p>
      </div>

      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-emerald-500" /> Módulos do Sistema
          </CardTitle>
          <CardDescription>
            Ative ou desative módulos para todos os usuários (exceto você).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(featureMap).map(key => (
            <div key={key} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/10">
              <div>
                <Label htmlFor={`feature-${key}`} className="text-base font-medium">{featureMap[key].label}</Label>
                <p className="text-sm text-muted-foreground">{featureMap[key].description}</p>
              </div>
              <Switch
                id={`feature-${key}`}
                checked={localFeatures[key] ?? false}
                onCheckedChange={(checked) => handleToggle(key, checked)}
                disabled={isSaving}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}