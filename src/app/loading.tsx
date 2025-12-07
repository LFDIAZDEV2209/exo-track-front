import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-300" style={{ animationDelay: '200ms' }}>Cargando...</p>
      </div>
    </div>
  );
}

