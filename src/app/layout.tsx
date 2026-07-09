import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/shared/components/theme-provider';
import { Toaster } from '@/shared/ui/toaster';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'ExoTrack — Gestión de Declaraciones de Renta',
  description: 'Plataforma profesional para la gestión y administración de declaraciones de renta en Colombia',
  keywords: ['declaraciones de renta', 'contadores', 'Colombia', 'DIAN', 'impuestos'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
