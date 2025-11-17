export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  useMockAPI: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
  timeout: 10000,
};

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  // Users
  users: {
    list: '/users',
    get: (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  // Clients (users with role cliente)
  clients: {
    list: '/users?role=cliente',
    get: (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },
  // Declarations
  declarations: {
    list: '/declarations',
    get: (id: string) => `/declarations/${id}`,
    getByUser: (userId: string) => `/declarations?userId=${userId}`,
    create: '/declarations',
    update: (id: string) => `/declarations/${id}`,
    delete: (id: string) => `/declarations/${id}`,
  },
  // Income
  income: {
    list: '/income',
    get: (id: string) => `/income/${id}`,
    getByDeclaration: (declarationId: string) => `/income?declarationId=${declarationId}`,
    create: '/income',
    update: (id: string) => `/income/${id}`,
    delete: (id: string) => `/income/${id}`,
  },
  // Assets
  assets: {
    list: '/assets',
    get: (id: string) => `/assets/${id}`,
    getByDeclaration: (declarationId: string) => `/assets?declarationId=${declarationId}`,
    create: '/assets',
    update: (id: string) => `/assets/${id}`,
    delete: (id: string) => `/assets/${id}`,
  },
  // Liabilities
  liabilities: {
    list: '/liabilities',
    get: (id: string) => `/liabilities/${id}`,
    getByDeclaration: (declarationId: string) => `/liabilities?declarationId=${declarationId}`,
    create: '/liabilities',
    update: (id: string) => `/liabilities/${id}`,
    delete: (id: string) => `/liabilities/${id}`,
  },
};

