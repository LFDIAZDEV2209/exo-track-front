'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';

const navigation = [
  { name: 'Inicio', href: '/user/home', icon: Home },
  { name: 'Mis Declaraciones', href: '/user/declarations', icon: FileText },
];

export function ClienteSidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const closeSidebar = () => useUIStore.setState({ sidebarOpen: false });

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/50 bg-sidebar transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-border/50 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold text-sm shadow-sm">
            E
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight">ExoTrack</span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase leading-tight">
              Portal del Cliente
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4 scrollbar-thin overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 shadow-sm border border-emerald-500/20'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                )}
              >
                <item.icon
                  className={cn(
                    'h-4.5 w-4.5 transition-transform duration-200',
                    isActive && 'text-emerald-600',
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 p-4">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[11px] font-medium text-muted-foreground tracking-wider uppercase">
              Soporte
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              soporte@exotrack.com
            </p>
          </div>
        </div>

        <button
          onClick={closeSidebar}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-border/50 bg-background shadow-sm lg:flex hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-3 w-3 text-muted-foreground" />
        </button>
      </aside>
    </>
  );
}
