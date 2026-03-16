-- Adiciona as colunas 'tipo_venda' e 'itens_count' na tabela de vendas
-- para armazenar o tipo da venda (varejo/atacado) e a quantidade total de itens.

ALTER TABLE public.vendas
ADD COLUMN IF NOT EXISTS tipo_venda TEXT,
ADD COLUMN IF NOT EXISTS itens_count INTEGER;