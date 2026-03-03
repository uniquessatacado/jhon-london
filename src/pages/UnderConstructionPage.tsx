import { HardHat } from 'lucide-react';

export function UnderConstructionPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <HardHat className="h-24 w-24 text-emerald-500/30 mb-6" />
      <h1 className="text-4xl font-bold text-white">Em Construção</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        Estamos trabalhando para liberar esta funcionalidade o mais breve possível. Agradecemos a sua paciência!
      </p>
    </div>
  );
}