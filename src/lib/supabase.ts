import { createClient } from '@supabase/supabase-js';

// Usando as novas credenciais do seu Supabase com Auth Nativo
const supabaseUrl = 'http://supabasekong-lef9kvb2b2r2lsvxdv73cez3.206.183.128.27.sslip.io';
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MzYwODEwMCwiZXhwIjo0OTI5MjgxNzAwLCJyb2xlIjoiYW5vbiJ9.I1NCfm8Tdgg-OBGbEpruVu1IEzAbVkDA7FU9kOFHgIo';

// Cliente principal para o app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Garante que a sessão do usuário seja salva no localStorage
  },
});

// Storage URLs helper
// NOTA: A URL do Storage pode ser diferente da URL principal da API. 
// Vamos assumir que segue o mesmo padrão por enquanto.
export const storageUrl = `${supabaseUrl}/storage/v1/object/public`;

// Helper para pegar a imagem do bucket 'produtos'
export const getProductImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${storageUrl}/produtos/${imagePath}`;
};

// Helper para pegar a imagem do bucket 'clientes'
export const getCustomerImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${storageUrl}/clientes/${imagePath}`;
};
