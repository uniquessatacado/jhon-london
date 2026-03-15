const SUPABASE_URL = 'http://10.0.3.5:8000';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmF1bHQiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.service_role_key';

const loginFunctionCode = `
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, senha } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '${SUPABASE_URL}',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '${SERVICE_KEY}'
    );

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return new Response(JSON.stringify({ message: 'Credenciais inválidas' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Compara o hash
    const isValid = await bcrypt.compare(senha, user.senha_hash);

    if (!isValid) {
      return new Response(JSON.stringify({ message: 'Credenciais inválidas' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Remove a senha do retorno
    delete user.senha_hash;

    // Retorna um token dummy ou assina um JWT real (para simplificar, enviaremos os dados do user)
    return new Response(JSON.stringify({
      token: 'supabase_dummy_token_' + user.id,
      user
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
`;

const createEdgeFunction = async (name, code) => {
  console.log(\`Fazendo deploy da Edge Function: \${name}...\`);
  try {
    const response = await fetch(\`\${SUPABASE_URL}/v1/projects/default/functions\`, {
      method: 'POST',
      headers: { 
        'Authorization': \`Bearer \${SERVICE_KEY}\`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ slug: name, name: name, source: code })
    });
    
    if (response.ok) {
      console.log(\`✅ Sucesso! Função \${name} criada.\`);
    } else {
      const error = await response.json();
      console.error(\`❌ Erro ao criar \${name}:\`, error);
    }
  } catch (err) {
    console.error("Erro na requisição:", err);
  }
};

// Executa o deploy
createEdgeFunction('auth-login', loginFunctionCode);
