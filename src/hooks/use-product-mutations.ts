import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// DTO Unificado
type ProductFormDTO = {
  id?: number; // Se tiver ID, é update
  nome: string;
  grade_id: string;
  subcategoria_id: string;
  marca_id: string;
  
  variacoes: {
    tamanho: string;
    estoque: number;
    sku: string;
    codigo_barras: string;
  }[];

  // Fiscal
  ncm: string;
  cfop_padrao: string;
  cst_icms: string;
  origem: string;
  unidade_medida: string;

  // Financeiro
  preco_custo: number;
  preco_varejo: number;
  
  // Atacado
  habilita_atacado_geral: boolean;
  preco_atacado_geral: number;
  
  habilita_atacado_grade: boolean;
  usar_preco_atacado_unico: boolean;
  grade_atacado_id: string;
  preco_atacado_grade: number;
  
  composicao_atacado: {
    tamanho: string;
    quantidade: number;
  }[];

  // Arquivos (Opcionais na edição)
  imagem_principal_file?: File | null;
  imagens_galeria_files?: File[];
  video_file?: File | null;
};

// Função auxiliar para montar o FormData
const buildFormData = (formData: ProductFormDTO) => {
  const payload = new FormData();

  // Campos Simples (Garante que não envia "undefined")
  payload.append('nome', formData.nome);
  payload.append('grade_id', String(formData.grade_id || ''));
  payload.append('subcategoria_id', String(formData.subcategoria_id || ''));
  payload.append('marca_id', String(formData.marca_id || ''));
  
  // Fiscal
  payload.append('ncm', formData.ncm || '');
  payload.append('cfop_padrao', formData.cfop_padrao || '');
  payload.append('cst_icms', formData.cst_icms || '');
  payload.append('origem', formData.origem || '');
  payload.append('unidade_medida', formData.unidade_medida || '');

  // Financeiro
  payload.append('preco_custo', String(Number(formData.preco_custo) || 0));
  payload.append('preco_varejo', String(Number(formData.preco_varejo) || 0));
  
  // Atacado Geral
  payload.append('habilita_atacado_geral', String(formData.habilita_atacado_geral));
  payload.append('preco_atacado_geral', String(Number(formData.preco_atacado_geral) || 0));
  
  // Atacado Grade
  payload.append('habilita_atacado_grade', String(formData.habilita_atacado_grade));
  payload.append('usar_preco_atacado_unico', String(formData.usar_preco_atacado_unico));
  
  if (formData.grade_atacado_id) {
    payload.append('grade_atacado_id', String(formData.grade_atacado_id));
  }
  
  const precoAtacadoGrade = formData.usar_preco_atacado_unico 
        ? (Number(formData.preco_atacado_geral) || 0) 
        : (Number(formData.preco_atacado_grade) || 0);
  payload.append('preco_atacado_grade', String(precoAtacadoGrade));

  // --- ARQUIVOS ---
  // IMPORTANTE: Só envia se for FILE. Se for string (URL antiga), o backend ignora e mantem a atual.
  if (formData.imagem_principal_file instanceof File) {
    payload.append('imagem_principal', formData.imagem_principal_file);
  }

  if (formData.video_file instanceof File) {
    payload.append('video', formData.video_file);
  }

  if (formData.imagens_galeria_files && formData.imagens_galeria_files.length > 0) {
    formData.imagens_galeria_files.forEach((file) => {
      if (file instanceof File) {
         payload.append('imagens_galeria', file);
      }
    });
  }

  // --- OBJETOS COMPLEXOS (JSON Stringify) ---
  const variacoesJson = JSON.stringify(formData.variacoes?.map(v => ({
    tamanho: v.tamanho,
    estoque: Number(v.estoque) || 0,
    sku: v.sku || '',
    codigo_barras: v.codigo_barras || ''
  })) || []);
  payload.append('variacoes', variacoesJson);

  let composicaoJson = "[]";
  if (formData.habilita_atacado_grade && formData.grade_atacado_id && formData.composicao_atacado) {
      const composicaoValida = formData.composicao_atacado
          .filter(c => c && c.tamanho && Number(c.quantidade) > 0)
          .map(c => ({
              tamanho: c.tamanho,
              quantidade: Number(c.quantidade)
          }));
      if (composicaoValida.length > 0) {
          composicaoJson = JSON.stringify(composicaoValida);
      }
  }
  payload.append('composicao_atacado_grade', composicaoJson);

  return payload;
};

export function useProductMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: ProductFormDTO) => {
      const payload = buildFormData(data);
      
      if (data.id) {
        // UPDATE (PUT)
        const response = await api.put(`/produtos/${data.id}`, payload, {
           headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      } else {
        // CREATE (POST)
        const response = await api.post('/produtos', payload, {
           headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }
    },
    onMutate: () => {
        toast.loading('Processando produto...', { id: 'saving-product' });
    },
    onSuccess: (_, variables) => {
      toast.dismiss('saving-product');
      toast.success(variables.id ? 'Produto atualizado!' : 'Produto criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (variables.id) {
          queryClient.invalidateQueries({ queryKey: ['product', String(variables.id)] });
      }
      navigate('/produtos');
    },
    onError: (error) => {
      toast.dismiss('saving-product');
      console.error('Erro na mutação:', error);
      toast.error('Falha ao salvar produto.', {
        description: 'Verifique sua conexão e os dados inseridos.',
      });
    },
  });
}