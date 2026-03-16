import { createClient } from '@supabase/supabase-js';

// Usando a URL fornecida (porta 8001)
const supabaseUrl = 'http://206.183.128.27:8001';
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MzYwODEwMCwiZXhwIjo0OTI5MjgxNzAwLCJyb2xlIjoiYW5vbiJ9.I1NCfm8Tdgg-OBGbEpruVu1IEzAbVkDA7FU9kOFHgIo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// A URL do Storage também aponta para o mesmo endereço
const storageBaseUrl = `${supabaseUrl}/storage/v1/object/public`;

// Helper para pegar a imagem do bucket 'produtos'
export const getProductImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${storageBaseUrl}/produtos/${imagePath}`;
};

// Helper para pegar a imagem do bucket 'clientes'
export const getCustomerImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${storageBaseUrl}/clientes/${imagePath}`;
};