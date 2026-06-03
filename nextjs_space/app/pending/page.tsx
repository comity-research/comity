'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Clock, LogOut } from 'lucide-react';

export default function PendingPage() {
  const { data: session } = useSession() || {};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 hero-gradient">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-xl">Account Pending Approval</CardTitle>
          <CardDescription>
            Your account ({session?.user?.email ?? 'unknown'}) has been created and is awaiting administrator approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You will gain access once an admin approves your registration. Please check back later.
          </p>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: '/login' })} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
