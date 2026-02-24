import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowRight, Lock, User } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    
    // Simulação de delay de rede para efeito visual
    setTimeout(() => {
        if (user === 'admin' && password === 'admin123') {
          setError('');
          toast.success('Acesso Autorizado', {
            description: 'Bem-vindo ao John London ERP.',
          });
          navigate('/');
        } else {
          setError('Credenciais inválidas.');
          toast.error('Acesso Negado', {
            description: 'Verifique suas credenciais.',
          });
          setIsLoading(false);
        }
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 space-y-8 animate-in fade-in zoom-in duration-500">
            
            {/* Header com Logo */}
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

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="user" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground">Usuário</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500/50" />
                            <Input 
                                id="user" 
                                placeholder="Digite seu usuário" 
                                className="pl-10 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl h-12 transition-all hover:bg-white/10"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="password" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground">Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500/50" />
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                className="pl-10 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl h-12 transition-all hover:bg-white/10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{error}</div>}

                <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl text-base font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300"
                    disabled={isLoading}
                >
                    {isLoading ? 'Acessando...' : <span className="flex items-center">Acessar Sistema <ArrowRight className="ml-2 h-4 w-4" /></span>}
                </Button>
            </form>
            
            <div className="text-center">
                <p className="text-xs text-muted-foreground/50">© 2024 John London ERP System</p>
            </div>
        </div>
      </div>
    </div>
  );
}