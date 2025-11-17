import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to format Colombian currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Helper to format relative dates
export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffInMs = now.getTime() - past.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInYears > 1) {
    return `hace más de ${diffInYears} año${diffInYears > 1 ? 's' : ''}`;
  } else if (diffInYears === 1) {
    return 'hace más de 1 año';
  } else if (diffInMonths > 1) {
    return `hace alrededor de ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  } else if (diffInMonths === 1) {
    return 'hace alrededor de 1 mes';
  } else if (diffInDays > 1) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInDays === 1) {
    return 'hace 1 día';
  } else if (diffInHours > 1) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInHours === 1) {
    return 'hace 1 hora';
  } else if (diffInMinutes > 1) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  } else {
    return 'hace unos momentos';
  }
}
