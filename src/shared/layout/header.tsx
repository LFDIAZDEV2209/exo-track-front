'use client';

import { Menu, Bell } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ThemeToggle } from '@/shared/components/theme-toggle';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { useRouter } from 'next/navigation';

export function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="flex h-16 items-center gap-4 px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden transition-all duration-200 hover:bg-accent/50"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1" />

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="relative transition-all duration-200 hover:bg-accent/50"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full transition-all duration-200 hover:ring-2 hover:ring-emerald-500/50 hover:ring-offset-2 hover:ring-offset-background"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-medium text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
