import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Grid } from '@/types';

async function fetchGrids(): Promise<Grid[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('*, tamanhos:grade_tamanhos(*)');
    
  if (error) throw new Error(error.message);
  return data || [];
}

export function useGrids() {
  return useQuery({
    queryKey: ['grids'],
    queryFn: fetchGrids,
  });
}
