import { API_CONFIG } from './config';

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

const TOKEN_KEY = 'auth_token';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add JWT token to headers if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      console.log('[API Client] Making request:', { method: options.method || 'GET', url, endpoint });
      const response = await fetch(url, config);

      console.log('[API Client] Response status:', response.status, response.statusText);

      if (!response.ok) {
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          // Don't redirect on login endpoint
          if (!endpoint.includes('/auth/login')) {
            this.removeToken();
            // Redirect to login if we're in the browser
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }

        let errorData: any;
        try {
          const text = await response.text();
          console.log('[API Client] Error response text:', text);
          errorData = text ? JSON.parse(text) : { message: response.statusText };
        } catch (parseError) {
          console.error('[API Client] Error parsing response:', parseError);
          errorData = {
            message: response.statusText || 'An error occurred',
          };
        }

        console.error('[API Client] API Error:', {
          status: response.status,
          message: errorData.message,
          errors: errorData.errors,
          endpoint,
        });

        const error: ApiError = {
          message: errorData.message || errorData.error || 'An error occurred',
          status: response.status,
          errors: errorData.errors,
        };

        throw error;
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      console.log('[API Client] Response content-type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        console.log('[API Client] Response data:', jsonData);
        return jsonData;
      }

      const textData = await response.text();
      console.log('[API Client] Response text (non-JSON):', textData);
      return {} as T;
    } catch (error) {
      console.error('[API Client] Request failed:', error);
      
      // If it's already an ApiError, throw it as is
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }

      // Network or other errors
      const networkError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error. Please check your connection.',
        status: 0,
      };
      
      console.error('[API Client] Network error:', networkError);
      throw networkError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Token management methods (exposed for auth service)
  setAuthToken(token: string): void {
    this.setToken(token);
  }

  clearAuthToken(): void {
    this.removeToken();
  }
}

export const apiClient = new ApiClient();

