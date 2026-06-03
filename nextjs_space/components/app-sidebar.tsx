'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  LayoutDashboard,
  Search,
  GitCompare,
  FolderKanban,
  Settings,
  ShieldCheck,
  LogOut,
  Hexagon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyze', label: 'Analyze', icon: Search },
  { href: '/comparison', label: 'Comparison', icon: GitCompare },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname() ?? '';
  const { data: session } = useSession() || {};
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-2 py-4 mb-4">
        <Hexagon className="h-7 w-7 text-primary" />
        <span className="font-display text-lg font-bold tracking-tight">Comity</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item: any) => {
          const Icon = item?.icon;
          const isActive = pathname === item?.href || pathname?.startsWith?.(`${item?.href}/`);
          return (
            <Link key={item?.href} href={item?.href ?? '/'}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-fast',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item?.label ?? ''}</span>
              </div>
            </Link>
          );
        })}

        {isAdmin && (
          <Link href="/admin">
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-fast',
                pathname === '/admin'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin</span>
            </div>
          </Link>
        )}
      </nav>

      <div className="border-t pt-4 space-y-2">
        <div className="flex items-center justify-between px-3">
          <span className="text-xs text-muted-foreground truncate max-w-[140px]">{session?.user?.email ?? ''}</span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => signOut?.({ callbackUrl: '/login' })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
