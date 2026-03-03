import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

// URL base para imagens, para ser usada no frontend
export const mediaBaseUrl = 'https://api.jl.venduss.com/uploads/';

// Interceptor para adicionar o token em todas as requisições
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
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Dispara um evento global para o AuthContext lidar com o logout.
      // Isso evita múltiplos redirecionamentos forçados.
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

// Test connection on startup (Optional check)
api.get('/teste').then(response => {
  console.log('API Connection Test:', response.data);
}).catch(error => {
  // Ignora erro de teste silenciosamente em produção/dev
  console.log('API Connection Test (Silent):', error.message);
});