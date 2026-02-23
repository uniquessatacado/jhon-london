import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Brand } from '@/types';

async function fetchBrands(): Promise<Brand[]> {
  const { data } = await api.get('/marcas');
  return data;
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  });
}