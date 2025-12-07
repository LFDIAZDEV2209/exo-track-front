import { CardHeader, CardTitle } from '@/shared/ui/card';
import Image from 'next/image';

export function LoginHeader() {
  return (
    <CardHeader className="text-center">
      <div className="mx-auto w-40 h-40 rounded-lg flex items-center justify-center">
        <Image 
          src="/logo.png" 
          alt="Logo ExoTrack" 
          width={160} 
          height={160} 
          className="object-contain" 
          priority
        />
      </div>
      <CardTitle className="mt-2">
        Sistema de Gestión de Declaraciones de Renta
      </CardTitle>
    </CardHeader>
  );
}

