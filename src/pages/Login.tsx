import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, User as UserIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // O AuthContext vai detectar o login automaticamente.
      // Apenas navegamos para o dashboard.
      toast.success('Acesso Autorizado', {
          description: `Bem-vindo de volta!`,
      });
      navigate('/');

    } catch (error: any) {
        console.error(error);
        const msg = error.message === 'Invalid login credentials' 
          ? 'Credenciais inválidas. Verifique seu e-mail e senha.'
          : 'Ocorreu um erro ao tentar fazer login.';
        toast.error('Acesso Negado', { description: msg });
    } finally {
        setIsLoading(false);
    }
  };

  // A recuperação de senha também pode usar o método nativo do Supabase
  const handleRecoverPassword = async () => {
    // Exemplo: await supabase.auth.resetPasswordForEmail(email)
    toast.info("Função de recuperar senha a ser implementada com Supabase.");
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
                <button onClick={handleRecoverPassword} className="text-xs text-muted-foreground hover:text-emerald-400 transition-colors">
                    Esqueceu sua senha?
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
