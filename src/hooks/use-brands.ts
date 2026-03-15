import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Brand } from '@/types';

async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from('marcas').select('*').order('nome');
  
  if (error) throw new Error(error.message);
  return data || [];
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  });
}
