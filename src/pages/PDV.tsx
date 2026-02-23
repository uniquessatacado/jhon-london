import { HardHat } from 'lucide-react';

export function PDVPage() {
  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold mb-6">PDV (Ponto de Venda)</h1>
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed bg-card p-8">
        <div className="text-center">
          <HardHat className="mx-auto h-16 w-16 animate-bounce text-primary" />
          <h2 className="mt-6 text-2xl font-semibold tracking-tight">
            Página em Construção
          </h2>
          <p className="mt-2 text-muted-foreground">
            Estamos trabalhando para trazer o melhor Ponto de Venda para você.
          </p>
        </div>
      </div>
    </div>
  );
}