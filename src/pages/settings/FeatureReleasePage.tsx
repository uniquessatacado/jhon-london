import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Rocket, Save } from 'lucide-react';

const features = [
  { id: 'dashboard', label: 'Dashboard', description: 'Página inicial com métricas e visão geral.' },
  { id: 'produtos', label: 'Produtos', description: 'Gerenciamento de catálogo, estoque e preços.' },
  { id: 'clientes', label: 'Clientes', description: 'Cadastro e gerenciamento da base de clientes.' },
  { id: 'pdv', label: 'PDV / Vendas', description: 'Frente de caixa para realização de vendas.' },
  { id: 'cadastros', label: 'Cadastros Gerais', description: 'Acesso às configurações de categorias, marcas, etc.' },
  { id: 'usuarios', label: 'Gestão de Usuários', description: 'Gerenciar acesso e permissões da equipe.' },
];

export function FeatureReleasePage() {
  const [featureStates, setFeatureStates] = useState(() => {
    const initialState: { [key: string]: boolean } = {};
    features.forEach(f => {
      initialState[f.id] = true; // Default to enabled
    });
    return initialState;
  });

  const handleToggle = (featureId: string, isEnabled: boolean) => {
    setFeatureStates(prev => ({ ...prev, [featureId]: isEnabled }));
  };

  const handleSaveChanges = () => {
    // TODO: Implement backend call to save these settings
    console.log('Saving feature flags:', featureStates);
    toast.success('Configurações salvas (simulação)', {
      description: 'No futuro, isso atualizará o acesso para todos os usuários.',
    });
  };

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
          {features.map(feature => (
            <div key={feature.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/10">
              <div>
                <Label htmlFor={`feature-${feature.id}`} className="text-base font-medium">{feature.label}</Label>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Switch
                id={`feature-${feature.id}`}
                checked={featureStates[feature.id]}
                onCheckedChange={(checked) => handleToggle(feature.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} className="bg-emerald-500 hover:bg-emerald-600">
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}