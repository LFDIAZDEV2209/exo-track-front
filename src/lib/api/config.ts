export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  useMockAPI: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
  timeout: 10000,
};

export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    checkAuthStatus: '/auth/check-auth-status',
  },
  // Users
  users: {
    findAll: (params?: { limit?: number; offset?: number }) => {
      const queryParams = new URLSearchParams();
      if (params?.limit !== undefined) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params?.offset !== undefined) {
        queryParams.append('offset', params.offset.toString());
      }
      const query = queryParams.toString();
      const endpoint = `/users${query ? `?${query}` : ''}`;
      
      // Debug: Ver qué URL se está generando
      console.log('[API Config] Generated endpoint:', endpoint);
      
      return endpoint;
    },
    findOne: (term: string) => `/users/${term}`,
    update: (id: string) => `/users/${id}`,
    remove: (id: string) => `/users/${id}`,
    stats: '/users/stats',
  },
  // Declarations
  declarations: {
    findAll: (params?: { limit?: number; offset?: number; userId?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.userId) queryParams.append('userId', params.userId);
      const query = queryParams.toString();
      return `/declarations${query ? `?${query}` : ''}`;
    },
    findOne: (id: string) => `/declarations/${id}`,
    create: '/declarations',
    update: (id: string) => `/declarations/${id}`,
    remove: (id: string) => `/declarations/${id}`,
    stats: '/declarations/stats',
    recentActivity: '/declarations/recent-activity',
  },
  // Income
  income: {
    findAll: (params?: { limit?: number; offset?: number; declarationId?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.declarationId) queryParams.append('declarationId', params.declarationId);
      const query = queryParams.toString();
      return `/incomes${query ? `?${query}` : ''}`;
    },
    create: '/incomes',
    update: (id: string) => `/incomes/${id}`,
    remove: (id: string) => `/incomes/${id}`,
  },
  // Assets
  assets: {
    findAll: (params?: { limit?: number; offset?: number; declarationId?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.declarationId) queryParams.append('declarationId', params.declarationId);
      const query = queryParams.toString();
      return `/assets${query ? `?${query}` : ''}`;
    },
    create: '/assets',
    update: (id: string) => `/assets/${id}`,
    remove: (id: string) => `/assets/${id}`,
  },
  // Liabilities
  liabilities: {
    findAll: (params?: { limit?: number; offset?: number; declarationId?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.declarationId) queryParams.append('declarationId', params.declarationId);
      const query = queryParams.toString();
      return `/liabilities${query ? `?${query}` : ''}`;
    },
    create: '/liabilities',
    update: (id: string) => `/liabilities/${id}`,
    remove: (id: string) => `/liabilities/${id}`,
  },
};

