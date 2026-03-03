import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://206.183.128.27:3003/api',
});

// URL base para imagens, para ser usada no frontend
export const mediaBaseUrl = 'http://206.183.128.27:3003/';

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
      // Evita loop infinito se já estiver no login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('jl_token');
        localStorage.removeItem('jl_user');
        window.location.href = '/login';
      }
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