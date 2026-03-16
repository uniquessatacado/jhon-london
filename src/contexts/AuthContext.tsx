import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserType } from '@/types/auth';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: UserType, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<UserType>) => void;
  featureStatus: { [key: string]: boolean } | null;
  refetchFeatureStatus: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [featureStatus, setFeatureStatus] = useState<{ [key: string]: boolean } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('jl_token');
      const storedUser = localStorage.getItem('jl_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Falha ao carregar sessão do localStorage", error);
      localStorage.removeItem('jl_token');
      localStorage.removeItem('jl_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: UserType, authToken: string) => {
    localStorage.setItem('jl_token', authToken);
    localStorage.setItem('jl_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('jl_token');
    localStorage.removeItem('jl_user');
    setToken(null);
    setUser(null);
    navigate('/login');
    toast.info("Você saiu da sua conta.");
  };

  const updateUser = (userData: Partial<UserType>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('jl_user', JSON.stringify(updatedUser));
    }
  };

  const refetchFeatureStatus = async () => {
    // Esta função será implementada quando a API de features estiver pronta
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    updateUser,
    featureStatus: { // Mock para manter o layout funcionando
        pdv_liberado: true,
        clientes_liberado: true,
        produtos_liberado: true,
        vendas_liberado: true,
    },
    refetchFeatureStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};