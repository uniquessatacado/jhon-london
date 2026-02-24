# REGRAS DE OURO - NUNCA VIOLAR

## ❌ PROIBIDO FAZER SEM PERMISSÃO EXPLÍCITA:
1. NUNCA deletar arquivos .tsx, .ts, .css existentes
2. NUNCA remover funcionalidades já implementadas (upload, vídeo, etc.)
3. NUNCA alterar rotas existentes sem confirmar
4. NUNCA simplificar/remover campos de formulário
5. NUNCA mudar nome de arquivos que estão sendo importados em outros lugares

## ⚠️ ANTES DE QUALQUER ALTERAÇÃO:
1. Ler o arquivo existente completo antes de modificar
2. Entender todas as funcionalidades atuais
3. Manter TODOS os imports existentes
4. Preservar TODOS os estados (useState) existentes
5. Preservar TODOS os useEffect existentes

## ✅ O QUE FAZER:
1. ADICIONAR novas funcionalidades em arquivos SEPARADOS quando possível
2. EDITAR arquivos existentes mantendo o que já funciona
3. Usar extends/inheritance ao invés de substituir
4. Comentar o que foi alterado

## 🚨 SE PEDIREM "CORRIGIR":
- Corrigir = arrumar erro, não reescrever do zero
- Manter todas as funcionalidades existentes
- Não remover campos, apenas preenchê-los corretamente