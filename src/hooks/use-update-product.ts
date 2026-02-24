import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

async function updateProduct({ id, formData }: { id: string; formData: any }): Promise<any> {
  
  const payload = new FormData();

  // Campos Simples (mesma lógica do create, mas iterando o objeto para garantir tudo)
  Object.keys(formData).forEach(key => {
    // Ignora campos especiais que tratamos manualmente abaixo
    if (['variacoes', 'composicao_atacado', 'imagem_principal_file', 'imagens_galeria_files', 'video_file'].includes(key)) return;
    
    // Converte null/undefined para string vazia ou envia valor
    const value = formData[key];
    payload.append(key, value === null || value === undefined ? '' : String(value));
  });

  // --- ARQUIVOS ---
  if (formData.imagem_principal_file) {
    payload.append('imagem_principal', formData.imagem_principal_file);
  }

  if (formData.video_file) {
    payload.append('video', formData.video_file);
  }

  if (formData.imagens_galeria_files && formData.imagens_galeria_files.length > 0) {
    formData.imagens_galeria_files.forEach((file: File) => {
      payload.append('imagens_galeria', file);
    });
  }

  // --- JSONs ---
  // Variações
  const variacoesJson = JSON.stringify(formData.variacoes?.map((v: any) => ({
    ...v,
    estoque: Number(v.estoque) || 0
  })) || []);
  payload.append('variacoes', variacoesJson);

  // Composição Atacado
  if (formData.composicao_atacado) {
      payload.append('composicao_atacado_grade', JSON.stringify(formData.composicao_atacado));
  }

  // Flags de Remoção (se implementado no backend)
  // payload.append('remover_imagem_principal', String(!!formData.remover_imagem_principal));

  const { data } = await api.put(`/produtos/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return data;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      toast.success('Produto atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/produtos');
    },
    onError: (error) => {
      console.error('Erro ao atualizar:', error);
      toast.error('Falha ao atualizar o produto.');
    },
  });
}