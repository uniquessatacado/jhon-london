import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types/auth';

export interface FeatureStatus {
  [key: string]: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  featureStatus: FeatureStatus | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  refetchFeatureStatus: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [featureStatus, setFeatureStatus] = useState<FeatureStatus | null>(null);

  const fetchFeatureStatus = async () => {
    try {
      const { data } = await api.get('/features/status');
      
      const parsedData: FeatureStatus = {};
      Object.keys(data).forEach(key => {
        parsedData[key] = data[key] === true || String(data[key]) === 'true';
      });
      
      setFeatureStatus(parsedData);
    } catch (error) {
      console.error("Failed to fetch feature status", error);
      setFeatureStatus({});
    }
  };

  const logout = () => {
    localStorage.removeItem('jl_token');
    localStorage.removeItem('jl_user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setFeatureStatus(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('jl_token');
    const storedUser = localStorage.getItem('jl_user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchFeatureStatus();
      } catch (e) {
        logout();
      }
    }
    setIsLoading(false);

    const handleAuthError = () => {
      logout();
    };
    window.addEventListener('auth-error', handleAuthError);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('jl_token', token);
    localStorage.setItem('jl_user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    fetchFeatureStatus();
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('jl_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, featureStatus, login, logout, updateUser, refetchFeatureStatus: fetchFeatureStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);