'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export type LoginActionState = {
  error?: string;
  redirectUrl?: string;
  user?: {
    id: string;
    fullName: string;
    documentNumber: string;
    email?: string;
    phoneNumber?: string;
    role: string;
    isActive?: boolean;
  };
};

export async function loginAction(
  prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const documentNumber = formData.get('cedula') as string;
  const password = formData.get('password') as string;

  if (!documentNumber || !password) {
    return { error: 'Todos los campos son obligatorios' };
  }

  try {
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentNumber, password }),
    });

    if (!loginResponse.ok) {
      let errorMessage = 'Cédula o contraseña incorrecta';
      try {
        const errorData = await loginResponse.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {}
      return { error: errorMessage };
    }

    const loginData = await loginResponse.json();
    const token: string | undefined = loginData.token;
    if (!token) {
      console.error('[LoginAction] Login response did not contain a token');
      return { error: 'Respuesta inválida del servidor de autenticación' };
    }

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    const role: string = loginData.role || 'user';
    const redirectUrl = role === 'admin' ? '/admin/dashboard' : '/user/home';

    return {
      error: undefined,
      redirectUrl,
      user: {
        id: loginData.id,
        fullName: loginData.fullName,
        documentNumber: loginData.documentNumber,
        email: loginData.email,
        phoneNumber: loginData.phoneNumber,
        role,
        isActive: loginData.isActive,
      },
    };
  } catch (error) {
    console.error('[LoginAction] Error:', error);
    return { error: 'Error de conexión con el servidor' };
  }
}
