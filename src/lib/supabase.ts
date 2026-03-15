import { createClient } from '@supabase/supabase-js';

// Usando as credenciais do seu servidor local (Self-Hosted)
const supabaseUrl = 'http://10.0.3.5:8000';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmF1bHQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.default_anon_key';

// Cliente principal (usado pelo app com RLS - Row Level Security)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage URLs helper
export const storageUrl = 'http://10.0.3.5:5000/object/public';

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
