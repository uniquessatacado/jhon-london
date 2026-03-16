-- Adiciona a coluna 'tamanho' na tabela 'venda_itens'
-- para registrar a variação específica do produto que foi vendido.

ALTER TABLE public.venda_itens
ADD COLUMN IF NOT EXISTS tamanho TEXT;