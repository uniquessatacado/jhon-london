# 🚀 INSTRUÇÕES DE TRABALHO - SUPABASE SELF-HOSTED
## Sistema John London - Venduss
### Data: 16/03/2026
### Versão: 1.0

---

## 🎯 REGRA DE OURO:

> **"MAXIMIZE O FRONTEND, MINIMIZE O BACKEND"**

Se der para fazer no código React/frontend usando Supabase client, FAÇA NO FRONT!
Só peça SQL ou Edge Function quando FOR OBRIGATÓRIO!

---

## 🔗 CREDENCIAIS SUPABASE (SEMPRE USE ESTAS):

```javascript
const SUPABASE_URL = 'http://206.183.128.27:8001'
const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MzYwODEwMCwiZXhwIjo0OTI5MjgxNzAwLCJyb2xlIjoiYW5vbiJ9.I1NCfm8Tdgg-OBGbEpruVu1IEzAbVkDA7FU9kOFHgIo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

## 📋 FLUXO DE TRABALHO:

### 1️⃣ NOVAS FUNCIONALIDADES:
* **PRIMEIRO TENTE:** Fazer tudo no frontend usando tabelas existentes
  * Consultas: `supabase.from('tabela').select()`
  * Filtros: `.eq()`, `.gte()`, `.order()`
  * Cálculos: JavaScript puro (map, reduce, etc)
* **SE PRECISAR DE LÓGICA COMPLEXA NO BANCO:**
  * → Me envie o código SQL para criar uma RPC (Function)
* **SE PRECISAR DE INTEGRAÇÃO EXTERNA:**
  * → Me envie o script TypeScript para Edge Function

### 2️⃣ QUANDO USAR CADA COISA:
| CASO | SOLUÇÃO | EXEMPLO |
|---|---|---|
| CRUD simples | FRONTEND | Listar produtos, criar cliente |
| Cálculos/Agregações | RPC (SQL) | Somar vendas do mês, calcular estoque |
| Validações complexas | RPC (SQL) | Verificar limite de crédito |
| API Externa (WhatsApp, Email) | EDGE FUNCTION | Enviar notificação |
| Geração de PDF/Excel | EDGE FUNCTION | Relatório em PDF |
| Upload de arquivos | STORAGE | Fotos de produtos |

### 3️⃣ FORMATO PARA PEDIR AJUDA:
**Se precisar de SQL (RPC):**
```sql
-- Crie uma função que [descrição do que faz]
CREATE OR REPLACE FUNCTION nome_funcao(parametro tipo) 
RETURNS tipo AS $$
BEGIN
  -- código SQL aqui
END;
$$ LANGUAGE plpgsql;
```

**Se precisar de Edge Function:**
```typescript
// Função: [nome]
// O que faz: [descrição]
// Endpoint esperado: /functions/v1/nome-funcao

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // código aqui
})
```

### 4️⃣ TABELAS DISPONÍVEIS (USE ESTAS):
* **Cadastros:**
  * produtos, produto_variacoes, produto_atacado_grade_composicao
  * clientes, fornecedores
  * categorias, subcategorias, marcas, grades, grade_tamanhos
  * usuarios (login manual - campo senha_hash)
* **Movimentações:**
  * vendas, venda_itens, venda_pagamentos
  * contas_receber, contas_pagar
  * movimentacoes_estoque (se existir)
* **Configurações:**
  * formas_pagamento, configuracoes
* **Storage Buckets:**
  * produtos (imagens)
  * comprovantes
  * clientes

### 5️⃣ LOGIN (IMPORTANTE):
NÃO usar `supabase.auth.signInWithPassword()` (auth nativo). USAR consulta manual:
```javascript
const login = async (email, password) => {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single()
  
  if (!user || user.senha_hash !== password) {
    throw new Error('Credenciais inválidas')
  }
  
  localStorage.setItem('user', JSON.stringify(user))
  return user
}
```

### 6️⃣ EDGE FUNCTIONS EXISTENTES:
Acesse: http://edge.venduss.com
Funções atuais:
* auth-login - Autenticação personalizada
* hello - Teste
* main - Função principal
* manual-login - Login manual

Para criar novas: Me envie o código TypeScript que eu crio pelo gerenciador!

### 7️⃣ AUTO-INCREMENTO:
Todas as tabelas já têm ID auto-incremento. NÃO envie ID ao criar registros!
```javascript
// CERTO:
await supabase.from('marcas').insert({ nome: 'Nike' })

// ERRADO:
await supabase.from('marcas').insert({ id: 999, nome: 'Nike' })
```

### 8️⃣ CORS E UPLOAD:
CORS já está configurado no proxy (porta 8001). Upload de imagens use Storage:
```javascript
await supabase.storage.from('produtos').upload(nome, arquivo)
```

## ⚠️ O QUE NÃO FAZER:
* ❌ Criar APIs Node.js separadas (tudo é Supabase agora!)
* ❌ Usar axios/fetch para `/api/...` (não existe mais)
* ❌ Tentar criar Edge Function pelo código (me peça o script)
* ❌ Modificar estrutura do banco sem avisar

## ✅ CHECKLIST ANTES DE ENTREGAR:
- [x] Todos os CRUDs usam `supabase.from()`
- [x] Login usa tabela usuarios (não auth nativo)
- [x] Imagens vão para Storage
- [x] Não há chamadas para localhost ou `/api/`
- [x] Cálculos complexos pedem SQL RPC
- [x] Integrações externas pedem Edge Function