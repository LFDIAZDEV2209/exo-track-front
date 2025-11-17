export interface User {
  id: string;
  cedula: string;
  nombreCompleto: string;
  email: string;
  rol: 'admin' | 'cliente';
}

export const mockUsers: User[] = [
  {
    id: '1',
    cedula: '1234567890',
    nombreCompleto: 'Admin Usuario',
    email: 'admin@exotrack.com',
    rol: 'admin',
  },
  {
    id: '2',
    cedula: '1098765432',
    nombreCompleto: 'Cliente Usuario',
    email: 'cliente@exotrack.com',
    rol: 'cliente',
  },
];

