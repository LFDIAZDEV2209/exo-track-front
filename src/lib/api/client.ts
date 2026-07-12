import { API_CONFIG } from './config';

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const config: RequestInit = {
      headers,
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorData: any;
        try {
          const text = await response.text();
          errorData = text ? JSON.parse(text) : { message: response.statusText };
        } catch {
          errorData = {
            message: response.statusText || 'An error occurred',
          };
        }

        const error: ApiError = {
          message: errorData.message || errorData.error || 'An error occurred',
          status: response.status,
          errors: errorData.errors,
        };

        throw error;
      }

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }

      return {} as T;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }

      const networkError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error. Please check your connection.',
        status: 0,
      };
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
}

export const apiClient = new ApiClient();
