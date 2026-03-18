import { supabase } from './supabase';

// URL base para imagens absolutas vindo do backend (Storage do Supabase)
export const mediaBaseUrl = 'https://jl2.venduss.com/storage/v1/object/public/produtos/';

// A exportação 'api' foi substituída intencionalmente para disparar erros claros 
// caso ainda exista algum arquivo esquecido tentando chamar endpoints antigos.
export const api = {
  get: async () => { throw new Error('CÓDIGO MORTO: Use o Supabase diretamente.') },
  post: async () => { throw new Error('CÓDIGO MORTO: Use o Supabase diretamente.') },
  put: async () => { throw new Error('CÓDIGO MORTO: Use o Supabase diretamente.') },
  delete: async () => { throw new Error('CÓDIGO MORTO: Use o Supabase diretamente.') },
};