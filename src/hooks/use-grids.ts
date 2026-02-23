import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Grid } from '@/types';

async function fetchGrids(): Promise<Grid[]> {
  const { data } = await api.get('/grades');
  return data;
}

export function useGrids() {
  return useQuery({
    queryKey: ['grids'],
    queryFn: fetchGrids,
  });
}