import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type CreateProductDTO = Omit<Product, 'id' | 'criado_em' | 'atualizado_em' | 'imagens_galeria'> & {
  imagens_galeria: string;
};


async function createProduct(newProduct: Partial<CreateProductDTO>): Promise<Product> {
  const payload = {
    ...newProduct,
    // Convertendo campos numéricos que podem vir como string do formulário
    preco_custo: Number(newProduct.preco_custo) || 0,
    preco_varejo: Number(newProduct.preco_varejo) || 0,
    preco_atacado: Number(newProduct.preco_atacado) || 0,
    estoque: Number(newProduct.estoque) || 0,
    estoque_minimo: Number(newProduct.estoque_minimo) || 0,
    peso_kg: Number(newProduct.peso_kg) || 0,
    altura_cm: Number(newProduct.altura_cm) || 0,
    largura_cm: Number(newProduct.largura_cm) || 0,
    comprimento_cm: Number(newProduct.comprimento_cm) || 0,
    categoria_id: Number(newProduct.categoria_id),
    marca_id: Number(newProduct.marca_id),
  };
  const { data } = await api.post('/produtos', payload);
  return data;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success('Produto criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/produtos');
    },
    onError: (error) => {
      console.error('Erro ao criar produto:', error);
      toast.error('Falha ao criar o produto.', {
        description: 'Verifique os dados e tente novamente.',
      });
    },
  });
}