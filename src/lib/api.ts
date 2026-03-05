import axios from 'axios';

// Usamos um caminho relativo para o proxy do Vite ou rewrites da Vercel interceptarem
export const api = axios.create({
  baseURL: '/api',
});

// URL base para imagens absolutas vindo do backend
export const mediaBaseUrl = 'https://api.jl.venduss.com/uploads/';

// Interceptor para adicionar o token em TODAS as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jl_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com token expirado ou inválido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dispara evento global para deslogar o usuário em caso de token inválido
      window.dispatchEvent(new Event('auth-error'));
    }
    // 403 - Acesso negado: não deslogar, apenas mostrar erro na tela
    return Promise.reject(error);
  }
);