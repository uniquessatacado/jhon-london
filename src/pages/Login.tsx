import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (user === 'admin' && password === 'admin123') {
      setError('');
      toast.success('Login bem-sucedido!', {
        description: 'Redirecionando para o painel.',
      });
      navigate('/');
    } else {
      setError('Usuário ou senha inválidos.');
      toast.error('Erro no login', {
        description: 'Usuário ou senha inválidos.',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">John London ERP</CardTitle>
          <CardDescription className="text-center">
            Entre com suas credenciais para acessar o painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="user">Usuário</Label>
              <Input
                id="user"
                type="text"
                placeholder="admin"
                required
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} type="submit" className="w-full" variant="secondary">
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}