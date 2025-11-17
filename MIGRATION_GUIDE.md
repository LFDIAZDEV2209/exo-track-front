# Guía de Migración: Mock Data → Servicios API

Esta guía muestra cómo migrar componentes que usan `mock-data.ts` directamente a usar los servicios API.

## Antes (usando mock-data directamente)

```typescript
import { mockUsers } from '@/lib/mock-data';

// En un componente
const users = mockUsers;
```

## Después (usando servicios)

```typescript
import { userService } from '@/services';
import { useEffect, useState } from 'react';

// En un componente
const [users, setUsers] = useState([]);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  fetchUsers();
}, []);
```

## Ejemplos Completos

### 1. Login Form

**Antes:**
```typescript
import { mockUsers } from '@/lib/mock-data';

const user = mockUsers.find((u) => u.documentNumber === data.cedula);
```

**Después:**
```typescript
import { authService } from '@/services';

const response = await authService.login({
  documentNumber: data.cedula,
  password: data.password
});
const user = response.user;
```

### 2. Lista de Clientes

**Antes:**
```typescript
import { mockClients } from '@/lib/mock-data';

const clients = mockClients;
```

**Después:**
```typescript
import { clientService } from '@/services';
import { useEffect, useState } from 'react';

const [clients, setClients] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchClients();
}, []);
```

### 3. Declaraciones de Usuario

**Antes:**
```typescript
import { mockDeclarations } from '@/lib/mock-data';

const userDeclarations = mockDeclarations.filter(
  d => d.userId === userId
);
```

**Después:**
```typescript
import { declarationService } from '@/services';
import { useEffect, useState } from 'react';

const [declarations, setDeclarations] = useState([]);

useEffect(() => {
  const fetchDeclarations = async () => {
    try {
      const data = await declarationService.getByUserId(userId);
      setDeclarations(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  fetchDeclarations();
}, [userId]);
```

### 4. Crear Nueva Declaración

**Antes:**
```typescript
// No había forma de crear en mock-data
```

**Después:**
```typescript
import { declarationService } from '@/services';
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleCreate = async () => {
  try {
    const newDeclaration = await declarationService.create({
      userId: '2',
      taxableYear: 2024,
      description: 'Nueva declaración'
    });
    
    router.push(`/admin/customers/${userId}/declarations/${newDeclaration.id}`);
  } catch (error) {
    console.error('Error creating declaration:', error);
  }
};
```

## Manejo de Errores

Todos los servicios lanzan errores que puedes capturar:

```typescript
try {
  const data = await userService.getById('1');
} catch (error) {
  if (error.status === 404) {
    // Usuario no encontrado
  } else if (error.status === 0) {
    // Error de red
  } else {
    // Otro error
  }
}
```

## Estados de Carga

Siempre maneja estados de carga:

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.getAll();
      // Usar data
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

## Próximos Pasos

1. Reemplaza gradualmente el uso de `mock-data.ts` con servicios
2. Prueba todas las funcionalidades con json-server
3. Cuando estés listo, cambia `NEXT_PUBLIC_API_URL` a tu backend real
4. Los servicios funcionarán sin cambios adicionales

