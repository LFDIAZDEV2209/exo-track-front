# ExoTrack Frontend

Sistema de gestión de declaraciones de renta para contadores en Colombia.

## 🚀 Inicio Rápido

### Instalación

```bash
pnpm install
```

### Desarrollo

Para ejecutar el proyecto con json-server (backend simulado):

```bash
pnpm run dev:all
```

Esto iniciará:
- **Next.js** en `http://localhost:3000`
- **JSON Server** en `http://localhost:3001`

Para ejecutar solo el frontend:

```bash
pnpm run dev
```

Para ejecutar solo el json-server:

```bash
pnpm run json-server
```

### Build

```bash
pnpm run build
pnpm run start
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── admin/             # Rutas de administrador
│   └── user/              # Rutas de usuario
├── features/               # Features organizadas por dominio
│   ├── auth/
│   ├── admin/
│   └── user/
├── services/               # Servicios API
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── client.service.ts
│   ├── declaration.service.ts
│   ├── income.service.ts
│   ├── asset.service.ts
│   └── liability.service.ts
├── lib/
│   ├── api/               # Configuración y cliente API
│   │   ├── config.ts
│   │   └── client.ts
│   ├── mock-data.ts        # Datos mock (fallback)
│   └── validations.ts      # Esquemas Zod
├── shared/                 # Componentes compartidos
│   ├── components/
│   ├── layout/
│   └── ui/
├── stores/                 # Zustand stores
├── hooks/                  # Custom hooks
└── types/                  # TypeScript types
```

## 🔧 Configuración

### Variables de Entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Variables disponibles:

- `NEXT_PUBLIC_API_URL`: URL del backend (default: `http://localhost:3001`)
- `NEXT_PUBLIC_USE_MOCK_API`: Usar API mock (default: `true`)

### JSON Server

El archivo `db.json` contiene los datos simulados. JSON Server expone las siguientes rutas:

- `GET /users` - Lista de usuarios
- `GET /users/:id` - Usuario por ID
- `POST /users` - Crear usuario
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

- `GET /declarations` - Lista de declaraciones
- `GET /declarations/:id` - Declaración por ID
- `GET /declarations?userId=:userId` - Declaraciones por usuario
- `POST /declarations` - Crear declaración
- `PATCH /declarations/:id` - Actualizar declaración
- `DELETE /declarations/:id` - Eliminar declaración

- `GET /income` - Lista de ingresos
- `GET /income?declarationId=:id` - Ingresos por declaración
- `POST /income` - Crear ingreso
- `PATCH /income/:id` - Actualizar ingreso
- `DELETE /income/:id` - Eliminar ingreso

- `GET /assets` - Lista de activos
- `GET /assets?declarationId=:id` - Activos por declaración
- `POST /assets` - Crear activo
- `PATCH /assets/:id` - Actualizar activo
- `DELETE /assets/:id` - Eliminar activo

- `GET /liabilities` - Lista de pasivos
- `GET /liabilities?declarationId=:id` - Pasivos por declaración
- `POST /liabilities` - Crear pasivo
- `PATCH /liabilities/:id` - Actualizar pasivo
- `DELETE /liabilities/:id` - Eliminar pasivo

## 📚 Uso de Servicios

### Ejemplo: Autenticación

```typescript
import { authService } from '@/services';

// Login
const response = await authService.login({
  documentNumber: '1234567890',
  password: 'password123'
});

// Obtener usuario actual
const user = await authService.getCurrentUser();
```

### Ejemplo: Declaraciones

```typescript
import { declarationService } from '@/services';

// Obtener todas las declaraciones
const declarations = await declarationService.getAll();

// Obtener declaraciones de un usuario
const userDeclarations = await declarationService.getByUserId('2');

// Crear declaración
const newDeclaration = await declarationService.create({
  userId: '2',
  taxableYear: 2024,
  description: 'Declaración 2024'
});

// Actualizar declaración
const updated = await declarationService.update('d1', {
  status: 'finalizada',
  description: 'Completada'
});
```

### Ejemplo: Ingresos, Activos y Pasivos

```typescript
import { incomeService, assetService, liabilityService } from '@/services';

// Ingresos
const incomes = await incomeService.getByDeclaration('d1');
const newIncome = await incomeService.create({
  declarationId: 'd1',
  concept: 'Salario',
  amount: 96000000,
  source: 'exogeno'
});

// Activos
const assets = await assetService.getByDeclaration('d1');
const newAsset = await assetService.create({
  declarationId: 'd1',
  concept: 'Apartamento',
  amount: 350000000,
  source: 'manual'
});

// Pasivos
const liabilities = await liabilityService.getByDeclaration('d1');
const newLiability = await liabilityService.create({
  declarationId: 'd1',
  concept: 'Crédito hipotecario',
  amount: 180000000,
  source: 'exogeno'
});
```

## 🔄 Migración al Backend Real

Cuando estés listo para conectar el backend real:

1. Actualiza `NEXT_PUBLIC_API_URL` en `.env.local` con la URL de tu backend
2. Ajusta los endpoints en `src/lib/api/config.ts` si es necesario
3. Los servicios ya están preparados para trabajar con cualquier backend REST

## 🛠️ Tecnologías

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Zustand** - Gestión de estado
- **React Hook Form** - Formularios
- **Zod** - Validación
- **Tailwind CSS** - Estilos
- **Radix UI** - Componentes UI
- **JSON Server** - Backend simulado

## 📝 Notas

- Los datos se guardan en `db.json` (no se persisten entre reinicios del servidor)
- Para producción, reemplaza los servicios con llamadas a tu backend real
- Todos los servicios están tipados con TypeScript
