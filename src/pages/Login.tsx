import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, User as UserIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('ussloja@gmail.com');
  const [password, setPassword] = useState('137900');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://206.183.128.27:8001/functions/v1/manual-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro desconhecido');
      }

      // 1. Atualiza o AuthContext
      login(data.user, data.token);
      
      toast.success('Acesso Autorizado', {
          description: `Bem-vindo de volta, ${data.user.nome.split(' ')[0]}.`,
      });

      // 2. Redireciona o usuário
      navigate('/');

    } catch (error: any) {
        console.error(error);
        toast.error('Acesso Negado', { description: error.message });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 space-y-8 animate-in fade-in zoom-in duration-500">
            
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500/30">
                     <img src="/logo.jpg" alt="Logo" className="h-full w-full object-cover" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-500 bg-[size:200%_auto] bg-clip-text text-transparent animate-shimmer">
                            John London
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2">Entre para gerenciar seu império</p>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground">E-mail</Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500/50" />
                            <Input 
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                className="h-12 pl-10 bg-black/40 border-white/10 focus-visible:ring-emerald-500/50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground">Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500/50" />
                            <Input 
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="h-12 pl-10 bg-black/40 border-white/10 focus-visible:ring-emerald-500/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-emerald-500/50 hover:text-emerald-500">
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
                
                <Button type="submit" size="lg" className="w-full h-12 text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Entrar
                </Button>
            </form>

            <div className="text-center">
                <button className="text-xs text-muted-foreground hover:text-emerald-400 transition-colors">
                    Esqueceu sua senha?
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}