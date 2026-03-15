import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

// O Supabase já tem um tipo 'User', mas podemos estender se precisarmos de campos customizados
// que não estão em `user_metadata`. Por enquanto, o tipo nativo é suficiente.
export type SupabaseUser = User;

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  // A função de login agora será chamada diretamente da tela de login,
  // pois o contexto vai reagir automaticamente às mudanças.
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tenta pegar a sessão inicial assim que o app carrega
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Ouve por mudanças no estado de autenticação (login, logout, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Limpa o listener quando o componente desmontar
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    // O listener onAuthStateChange vai cuidar de limpar o estado
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        isAuthenticated: !!session?.user, 
        isLoading, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
