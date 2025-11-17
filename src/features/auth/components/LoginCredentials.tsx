import { CardContent } from '@/shared/ui/card';

export function LoginCredentials() {
  return (
    <div className="mt-6 p-4 bg-muted rounded-lg">
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        Demo - Credenciales de prueba:
      </p>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          <strong>Admin:</strong> 1234567890 / password123
        </p>
        <p>
          <strong>Cliente 1:</strong> 1098765432 / password123
        </p>
        <p>
          <strong>Cliente 2:</strong> 1029384756 / password123
        </p>
        <p className="text-xs text-muted-foreground/70 mt-2">
          Todos los usuarios usan la contraseña: password123
        </p>
      </div>
    </div>
  );
}

