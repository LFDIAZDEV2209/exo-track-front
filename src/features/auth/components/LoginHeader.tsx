import { FileText } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';

export function LoginHeader() {
  return (
    <CardHeader className="space-y-4 text-center">
      <div className="mx-auto w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
        <FileText className="h-6 w-6 text-primary-foreground" />
      </div>
      <div>
        <CardTitle className="text-2xl font-bold">ExoTrack</CardTitle>
        <CardDescription className="mt-2">
          Sistema de Gestión de Declaraciones de Renta
        </CardDescription>
      </div>
    </CardHeader>
  );
}

