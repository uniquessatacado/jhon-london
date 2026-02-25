import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowRight, Lock, User as UserIcon, Loader2, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password States
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const { data } = await api.post('/auth/login', { email, senha: password });
        
        login(data.token, data.user);
        
        toast.success('Acesso Autorizado', {
            description: `Bem-vindo de volta, ${data.user.nome.split(' ')[0]}.`,
        });
        navigate('/');
    } catch (error: any) {
        console.error(error);
        const msg = error.response?.data?.message || 'Credenciais inválidas.';
        toast.error('Acesso Negado', { description: msg });
    } finally {
        setIsLoading(false);
    }
  };

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error("Digite seu e-mail.");
    
    setIsRecovering(true);
    try {
        await api.post('/auth/recuperar-senha', { email: forgotEmail });
        toast.success('E-mail enviado!', { 
            description: 'Verifique sua caixa de entrada para redefinir a senha.' 
        });
        setIsForgotOpen(false);
        setForgotEmail('');
    } catch (error: any) {
        toast.error('Erro ao recuperar', { 
            description: error.response?.data?.message || 'Tente novamente mais tarde.' 
        });
    } finally {
        setIsRecovering(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-background">
      {/* Background Effects */}
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
                        <Label htmlFor="email" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground">E-mail</Label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500/50" />
                            <Input 
                                id="email" 
                                type="email"
                                placeholder="seu@email.com" 
                                className="pl-10 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl h-12 transition-all hover:bg-white/10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <Label htmlFor="password" className="ml-1 text-xs uppercase tracking-wider text-muted-foreground">Senha</Label>
                            <button 
                                type="button" 
                                onClick={() => setIsForgotOpen(true)}
                                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                Esqueci minha senha
                            </button>
                         </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-emerald-500/50" />
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                className="pl-10 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl h-12 transition-all hover:bg-white/10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl text-base font-semibold shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <span className="flex items-center">Acessar Sistema <ArrowRight className="ml-2 h-4 w-4" /></span>}
                </Button>
            </form>
            
            <div className="text-center">
                <p className="text-xs text-muted-foreground/50">© 2024 John London ERP System</p>
            </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Recuperar Senha</DialogTitle>
            <DialogDescription>
              Digite seu e-mail para receber as instruções de redefinição.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecoverPassword} className="space-y-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="forgot-email">E-mail cadastrado</Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="forgot-email" 
                        type="email" 
                        placeholder="exemplo@johnlondon.com" 
                        className="pl-9"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                    />
                </div>
             </div>
             <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsForgotOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={isRecovering}>
                    {isRecovering ? 'Enviando...' : 'Enviar Email'}
                </Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}